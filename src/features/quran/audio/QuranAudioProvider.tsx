import {
  setAudioModeAsync,
  type AudioStatus,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';

import { createPersistedStore } from '@/lib/persistedStore';
import { StorageKeys } from '@/lib/storage';

import { isOnline } from '@/lib/network';

import { audioSource, getReciter, isSurahDownloaded, type Reciter } from '../data/reciters';
import { getSurah } from '../data/surahs';
import { AudioOfflineSheet } from './AudioOfflineSheet';
import { watchPendingDownloads } from './pendingDownloads';

export type PlayerPrefs = { reciter: string; speed: number; repeat: number };

export const playerPrefs = createPersistedStore<PlayerPrefs>(
  StorageKeys.quranPlayer,
  { reciter: 'ar.alafasy', speed: 1, repeat: 1 },
  (raw) => ({ reciter: 'ar.alafasy', speed: 1, repeat: 1, ...(raw as object) }),
);

export const SPEEDS = [0.75, 1, 1.25, 1.5] as const;
export const REPEATS = [1, 2, 3, 5] as const;
export const SLEEP_MINUTES = [null, 5, 10, 15, 30, 60] as const;

export type Track = {
  surah: number;
  /** 0-based index into the surah's ayahs. */
  index: number;
  total: number;
  firstAyahId: number;
};

type QuranAudio = {
  track: Track | null;
  status: Pick<AudioStatus, 'playing' | 'isBuffering' | 'currentTime' | 'duration'>;
  reciter: Reciter;
  prefs: PlayerPrefs;
  sleepEndsAt: number | null;
  error: boolean;
  play: (surah: number, fromAyah?: number, repeatOverride?: number) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  stop: () => void;
  setReciter: (id: string) => void;
  setSpeed: (speed: number) => void;
  setRepeat: (repeat: number) => void;
  setSleep: (minutes: number | null) => void;
};

const QuranAudioContext = createContext<QuranAudio | null>(null);

/**
 * One app-wide recitation player so audio continues across screens and in the
 * background. Plays a surah ayah by ayah, repeating each ayah as configured.
 */
export function QuranAudioProvider({ children }: PropsWithChildren) {
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const prefs = playerPrefs.use();
  const reciter = getReciter(prefs.reciter);
  const [track, setTrack] = useState<Track | null>(null);
  const [sleepEndsAt, setSleepEndsAt] = useState<number | null>(null);
  const [error, setError] = useState(false);
  /** A play request held back because the device is offline and the surah isn't downloaded. */
  const [blocked, setBlocked] = useState<{
    surah: number;
    fromAyah: number;
    repeat?: number;
  } | null>(null);

  // Mutable mirrors for the native event callback.
  const trackRef = useRef<Track | null>(null);
  const repeatsLeft = useRef(0);
  const repeatOverride = useRef<number | null>(null);
  const prefsRef = useRef(prefs);
  useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(() => undefined);
  }, []);

  const load = useCallback(
    (next: Track) => {
      const p = prefsRef.current;
      const r = getReciter(p.reciter);
      trackRef.current = next;
      repeatsLeft.current = (repeatOverride.current ?? p.repeat) - 1;
      setTrack(next);
      setError(false);
      try {
        player.replace({ uri: audioSource(r, next.firstAyahId + next.index) });
        player.setPlaybackRate(p.speed);
        player.play();
        const surah = getSurah(next.surah);
        if (Platform.OS !== 'web') {
          player.setActiveForLockScreen(true, {
            title: `${surah.name.en} · ${next.index + 1}/${next.total}`,
            artist: r.name.en,
            albumTitle: surah.nameAr,
          });
        }
      } catch {
        setError(true);
      }
    },
    [player],
  );

  // Advance or repeat when an ayah finishes.
  useEffect(() => {
    const sub = player.addListener('playbackStatusUpdate', (s) => {
      if (!s.didJustFinish) return;
      const current = trackRef.current;
      if (!current) return;
      if (repeatsLeft.current > 0) {
        repeatsLeft.current -= 1;
        void player.seekTo(0).then(() => player.play());
        return;
      }
      if (current.index + 1 < current.total) {
        load({ ...current, index: current.index + 1 });
      } else {
        repeatOverride.current = null;
        player.pause();
      }
    });
    return () => sub.remove();
  }, [player, load]);

  useEffect(() => (Platform.OS === 'web' ? undefined : watchPendingDownloads()), []);

  // Sleep timer.
  useEffect(() => {
    if (!sleepEndsAt) return;
    const id = setTimeout(
      () => {
        player.pause();
        setSleepEndsAt(null);
      },
      Math.max(0, sleepEndsAt - Date.now()),
    );
    return () => clearTimeout(id);
  }, [sleepEndsAt, player]);

  const start = useCallback(
    (surahNumber: number, fromAyah = 1, repeat?: number) => {
      const surah = getSurah(surahNumber);
      repeatOverride.current = repeat ?? null;
      load({
        surah: surah.number,
        index: Math.min(surah.ayahCount, Math.max(1, fromAyah)) - 1,
        total: surah.ayahCount,
        firstAyahId: surah.firstAyahId,
      });
    },
    [load],
  );

  /** Plays, unless offline with nothing downloaded for this surah (34f). */
  const play = useCallback(
    (surahNumber: number, fromAyah = 1, repeat?: number) => {
      const surah = getSurah(surahNumber);
      const r = getReciter(prefsRef.current.reciter);
      if (Platform.OS === 'web' || isSurahDownloaded(r, surah.firstAyahId, surah.ayahCount)) {
        start(surahNumber, fromAyah, repeat);
        return;
      }
      void isOnline().then((online) =>
        online
          ? start(surahNumber, fromAyah, repeat)
          : setBlocked({ surah: surahNumber, fromAyah, repeat }),
      );
    },
    [start],
  );

  const value = useMemo<QuranAudio>(
    () => ({
      track,
      status: {
        playing: status.playing,
        isBuffering: status.isBuffering,
        currentTime: status.currentTime,
        duration: status.duration,
      },
      reciter,
      prefs,
      sleepEndsAt,
      error,
      play,
      toggle: () => {
        if (!trackRef.current) return;
        if (status.playing) player.pause();
        else player.play();
      },
      next: () => {
        const t = trackRef.current;
        if (t && t.index + 1 < t.total) load({ ...t, index: t.index + 1 });
      },
      previous: () => {
        const t = trackRef.current;
        if (!t) return;
        if (status.currentTime > 3 || t.index === 0) void player.seekTo(0);
        else load({ ...t, index: t.index - 1 });
      },
      stop: () => {
        player.pause();
        if (Platform.OS !== 'web') player.setActiveForLockScreen(false);
        trackRef.current = null;
        repeatOverride.current = null;
        setTrack(null);
        setSleepEndsAt(null);
      },
      setReciter: (id) => {
        playerPrefs.set((p) => ({ ...p, reciter: id }));
        const t = trackRef.current;
        if (t) setTimeout(() => load(t), 0);
      },
      setSpeed: (speed) => {
        playerPrefs.set((p) => ({ ...p, speed }));
        player.setPlaybackRate(speed);
      },
      setRepeat: (repeat) => {
        repeatOverride.current = null;
        playerPrefs.set((p) => ({ ...p, repeat }));
        repeatsLeft.current = Math.min(repeatsLeft.current, repeat - 1);
      },
      setSleep: (minutes) => setSleepEndsAt(minutes ? Date.now() + minutes * 60_000 : null),
    }),
    [track, status, reciter, prefs, sleepEndsAt, error, play, load, player],
  );

  return (
    <QuranAudioContext.Provider value={value}>
      {children}
      <AudioOfflineSheet
        request={blocked}
        reciter={reciter}
        onClose={() => setBlocked(null)}
        onPlayWith={(id) => {
          const req = blocked;
          playerPrefs.set((p) => ({ ...p, reciter: id }));
          prefsRef.current = { ...prefsRef.current, reciter: id };
          setBlocked(null);
          if (req) start(req.surah, req.fromAyah, req.repeat);
        }}
      />
    </QuranAudioContext.Provider>
  );
}

export function useQuranAudio(): QuranAudio {
  const ctx = useContext(QuranAudioContext);
  if (!ctx) throw new Error('useQuranAudio must be used inside <QuranAudioProvider>');
  return ctx;
}
