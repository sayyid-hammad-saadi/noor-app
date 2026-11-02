import { useRouter } from 'expo-router';
import {
  Check,
  ChevronDown,
  CloudDownload,
  Ellipsis,
  Gauge,
  type LucideIcon,
  Moon,
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
} from 'lucide-react-native';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Rect } from 'react-native-svg';

import { BottomSheet, EmptyState, useToast } from '@/components/feedback';
import { GradientHeader, TopBar } from '@/components/layout';
import { Avatar, Button, Icon, IconButton, List, ListRow, Text, Touchable } from '@/components/ui';
import { useNow } from '@/features/prayer/usePrayerTimes';
import { useLanguage } from '@/i18n';
import { routes } from '@/lib/routes';
import { makeStyles, useTheme } from '@/theme';

import { REPEATS, SLEEP_MINUTES, SPEEDS, useQuranAudio } from './audio/QuranAudioProvider';
import { downloadSurahAudio, estimateSurahMb, isSurahDownloaded, RECITERS } from './data/reciters';
import { getSurah, juzOfAyahId, surahName } from './data/surahs';
import { quranRoute } from './routes';

/** 11 Quran audio player (modal). */
export default function PlayerScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const audio = useQuranAudio();
  const { language, localizeDigits, formatNumber } = useLanguage();
  const [qariOpen, setQariOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [sleepChoice, setSleepChoice] = useState(0);
  const now = useNow(1000);
  const track = audio.track;

  if (!track) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <TopBar
          backIcon={ChevronDown}
          backLabel={t('quran.player.minimise')}
          onBack={() => (router.canGoBack() ? router.back() : router.replace(routes.quran))}
        />
        <View style={styles.flex}>
          <EmptyState
            icon={Play}
            title={t('quran.player.emptyTitle')}
            body={t('quran.player.emptyBody')}
            action={{
              label: t('quran.player.emptyAction'),
              onPress: () => router.replace(routes.quran),
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const surah = getSurah(track.surah);
  const juz = juzOfAyahId(track.firstAyahId + track.index);
  const ayahProgress =
    audio.status.duration > 0 ? Math.min(1, audio.status.currentTime / audio.status.duration) : 0;
  const clock = (sec: number) => {
    const s = Math.max(0, Math.round(sec));
    return localizeDigits(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
  };
  const speed = audio.prefs.speed;
  const repeat = audio.prefs.repeat;
  const sleepLeft = audio.sleepEndsAt
    ? Math.max(0, (audio.sleepEndsAt - now.getTime()) / 1000)
    : null;
  const cycle = <T,>(list: readonly T[], value: T) =>
    list[(list.indexOf(value) + 1) % list.length] ?? list[0]!;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grab} />
        <View style={styles.top}>
          <IconButton
            icon={ChevronDown}
            accessibilityLabel={t('quran.player.minimise')}
            onPress={() => router.back()}
            style={styles.edgeStart}
          />
          <Text variant="label" weight="600" align="center" style={styles.flex}>
            {t('quran.player.nowPlaying', { juz: localizeDigits(juz) })}
          </Text>
          <IconButton
            icon={Ellipsis}
            size={22}
            accessibilityLabel={t('quran.player.more')}
            onPress={() => setMoreOpen(true)}
            style={styles.edgeEnd}
          />
        </View>

        <Artwork
          nameAr={surah.nameAr}
          label={t('quran.player.surahLabel', { n: localizeDigits(surah.number) })}
        />

        <View style={styles.titleBlock}>
          <Text variant="h2" align="center" accessibilityRole="header">
            {t('quran.player.ayahOf', {
              surah: surahName(surah, language),
              ayah: localizeDigits(track.index + 1),
              total: localizeDigits(track.total),
            })}
          </Text>
          <Touchable
            accessibilityRole="button"
            accessibilityLabel={t('quran.player.changeQari', {
              name: audio.reciter.name[language],
            })}
            onPress={() => setQariOpen(true)}
            style={styles.qari}
          >
            <Avatar initials={audio.reciter.initials} size={32} />
            <Text variant="bodyStrong" numberOfLines={1} style={styles.shrink}>
              {audio.reciter.name[language]}
            </Text>
            <Icon icon={ChevronDown} size={16} color="text2" />
          </Touchable>
        </View>

        <AyahProgress
          index={track.index}
          total={track.total}
          progress={ayahProgress}
          elapsed={clock(audio.status.currentTime)}
          duration={clock(audio.status.duration)}
        />

        <View style={styles.controls}>
          <IconButton
            icon={SkipBack}
            size={26}
            accessibilityLabel={t('quran.player.previous')}
            onPress={audio.previous}
            style={styles.skip}
          />
          <Touchable
            accessibilityRole="button"
            accessibilityLabel={audio.status.playing ? t('actions.pause') : t('actions.play')}
            onPress={audio.toggle}
            style={styles.play}
          >
            <Icon icon={audio.status.playing ? Pause : Play} size={28} color="onBtn" filled />
          </Touchable>
          <IconButton
            icon={SkipForward}
            size={26}
            accessibilityLabel={t('quran.player.next')}
            onPress={audio.next}
            style={styles.skip}
          />
        </View>

        <View style={styles.options}>
          <Option
            icon={Gauge}
            title={t('quran.player.speed')}
            value={`${formatNumber(speed, { decimals: speed % 1 === 0 ? 1 : 2 })}×`}
            onPress={() => audio.setSpeed(cycle(SPEEDS, speed as (typeof SPEEDS)[number]))}
          />
          <Option
            icon={Repeat}
            title={t('quran.player.repeat')}
            value={
              repeat > 1
                ? t('quran.player.repeatEach', { n: localizeDigits(repeat) })
                : t('quran.player.repeatOff')
            }
            onPress={() => audio.setRepeat(cycle(REPEATS, repeat as (typeof REPEATS)[number]))}
          />
          <Option
            icon={Moon}
            title={t('quran.player.sleep')}
            value={
              sleepLeft !== null
                ? t('quran.player.sleepLeft', { time: clock(sleepLeft) })
                : t('quran.player.sleepOff')
            }
            active={sleepLeft !== null}
            onPress={() => {
              // Off → 5 → 10 → 15 → 30 → 60 → Off.
              const from = sleepLeft === null ? 0 : sleepChoice;
              const next = (from + 1) % SLEEP_MINUTES.length;
              setSleepChoice(next);
              audio.setSleep(SLEEP_MINUTES[next] ?? null);
            }}
          />
          <DownloadOption surahNumber={surah.number} />
        </View>
      </ScrollView>

      <BottomSheet
        visible={qariOpen}
        onClose={() => setQariOpen(false)}
        title={t('quran.player.qari')}
      >
        <List>
          {RECITERS.map((r) => (
            <ListRow
              key={r.id}
              title={r.name[language]}
              leading={<Avatar initials={r.initials} size={34} />}
              trailing={
                r.id === audio.reciter.id ? <Icon icon={Check} size={20} color="link" /> : undefined
              }
              accessibilityRole="radio"
              accessibilityState={{ checked: r.id === audio.reciter.id }}
              onPress={() => {
                audio.setReciter(r.id);
                setQariOpen(false);
              }}
            />
          ))}
        </List>
      </BottomSheet>

      <BottomSheet visible={moreOpen} onClose={() => setMoreOpen(false)}>
        <Button
          variant="secondary"
          label={t('quran.player.goToReader')}
          onPress={() => {
            setMoreOpen(false);
            router.back();
            router.push(quranRoute(track.surah, track.index + 1));
          }}
        />
        <Button
          variant="destructive"
          label={t('quran.player.stop')}
          onPress={() => {
            setMoreOpen(false);
            audio.stop();
            router.back();
          }}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}

function Artwork({ nameAr, label }: { nameAr: string; label: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <GradientHeader pattern={false} style={styles.art}>
      <Svg width={196} height={196} viewBox="0 0 196 196" style={StyleSheet.absoluteFill}>
        <G fill="none" stroke={colors.onHeader} strokeWidth={1.2} opacity={0.14}>
          <Rect x={38} y={38} width={120} height={120} rx={10} />
          <Rect x={38} y={38} width={120} height={120} rx={10} transform="rotate(45 98 98)" />
          <Circle cx={98} cy={98} r={44} />
        </G>
      </Svg>
      <Text
        script="quran"
        size={40}
        color="onHeader"
        align="center"
        maxFontSizeMultiplier={1}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {nameAr}
      </Text>
      <Text variant="caption" weight="600" color="onHeader" style={styles.artLabel}>
        {label}
      </Text>
    </GradientHeader>
  );
}

/** Per-ayah segments for short surahs; a single bar with times for long ones. */
function AyahProgress({
  index,
  total,
  progress,
  elapsed,
  duration,
}: {
  index: number;
  total: number;
  progress: number;
  elapsed: string;
  duration: string;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { localizeDigits } = useLanguage();
  const segmented = total <= 8;
  return (
    <View
      style={styles.progress}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('quran.player.progress')}
      accessibilityValue={{
        text: `${t('quran.player.ayah', { n: index + 1 })}, ${Math.round(progress * 100)}%`,
      }}
    >
      {segmented ? (
        <View style={styles.segments}>
          {Array.from({ length: total }, (_, i) => (
            <View key={i} style={styles.segment}>
              <View
                style={[
                  styles.segmentFill,
                  { width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%' },
                ]}
              />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.segment}>
          <View style={[styles.segmentFill, { width: `${progress * 100}%` }]} />
        </View>
      )}
      <View style={styles.progressText}>
        <Text variant="micro" color="link">
          {`${t('quran.player.ayah', { n: localizeDigits(index + 1) })} · ${elapsed}`}
        </Text>
        <Text variant="micro" color="text2" tabular>
          {duration}
        </Text>
      </View>
    </View>
  );
}

function Option({
  icon,
  title,
  value,
  active,
  onPress,
  leading,
}: {
  icon?: LucideIcon;
  title: string;
  value: string;
  active?: boolean;
  onPress: () => void;
  leading?: ReactNode;
}) {
  const styles = useStyles();
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${value}`}
      onPress={onPress}
      style={[styles.option, active && styles.optionOn]}
    >
      {leading ?? (icon ? <Icon icon={icon} size={20} color="link" /> : null)}
      <View style={styles.optionText}>
        <Text variant="caption">{title}</Text>
        <Text variant="bodyStrong" weight="700" numberOfLines={1}>
          {value}
        </Text>
      </View>
    </Touchable>
  );
}

function DownloadOption({ surahNumber }: { surahNumber: number }) {
  const { t } = useTranslation();
  const toast = useToast();
  const { colors } = useTheme();
  const { reciter } = useQuranAudio();
  const { formatNumber, localizeDigits } = useLanguage();
  const surah = getSurah(surahNumber);
  const [progress, setProgress] = useState<number | null>(null);
  const [done, setDone] = useState(() =>
    isSurahDownloaded(reciter, surah.firstAyahId, surah.ayahCount),
  );
  const signal = useRef({ cancelled: false });

  useEffect(() => {
    const s = signal.current;
    return () => {
      s.cancelled = true;
    };
  }, []);

  const start = async () => {
    if (progress !== null) {
      signal.current.cancelled = true;
      signal.current = { cancelled: false };
      setProgress(null);
      return;
    }
    setProgress(0);
    try {
      await downloadSurahAudio(
        reciter,
        surah.firstAyahId,
        surah.ayahCount,
        setProgress,
        signal.current,
      );
      if (!signal.current.cancelled) setDone(true);
    } catch {
      toast.show({ message: t('quran.player.downloadFailed') });
    } finally {
      setProgress(null);
    }
  };

  const mb = formatNumber(estimateSurahMb(reciter, surah.ayahCount), { decimals: 1 });
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <Option
      title={`${t('quran.player.offline')} · ${t('quran.player.sizeHint', { mb })}`}
      value={
        done
          ? t('quran.player.downloaded')
          : progress !== null
            ? t('quran.player.downloading', { percent: localizeDigits(Math.round(progress * 100)) })
            : t('quran.player.download')
      }
      onPress={() => !done && void start()}
      leading={
        progress !== null ? (
          <Svg width={22} height={22} viewBox="0 0 22 22">
            <Circle cx={11} cy={11} r={r} fill="none" stroke={colors.border} strokeWidth={2.5} />
            <Circle
              cx={11}
              cy={11}
              r={r}
              fill="none"
              stroke={colors.primary}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray={`${progress * c} ${c}`}
              transform="rotate(-90 11 11)"
            />
          </Svg>
        ) : (
          <Icon icon={done ? Check : CloudDownload} size={20} color="link" />
        )
      }
    />
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.surface },
    flex: { flex: 1 },
    shrink: { flexShrink: 1 },
    content: { paddingHorizontal: t.size.gutter, paddingTop: 10, paddingBottom: t.space.xxl },
    grab: {
      alignSelf: 'center',
      width: 36,
      height: 5,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.border,
    },
    top: { minHeight: t.size.topBar, flexDirection: 'row', alignItems: 'center' },
    edgeStart: { marginStart: -10 },
    edgeEnd: { marginEnd: -10 },
    art: {
      marginTop: t.space.sm,
      alignSelf: 'center',
      width: 196,
      height: 196,
      borderRadius: t.radius.sheet,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      paddingHorizontal: t.space.md,
    },
    artLabel: { opacity: 0.85, letterSpacing: 0.7 },
    titleBlock: { marginTop: t.space.lg, alignItems: 'center', gap: 10 },
    qari: {
      minHeight: t.size.touch,
      maxWidth: '100%',
      paddingStart: 6,
      paddingEnd: t.space.md,
      borderRadius: t.radius.pill,
      borderWidth: 1,
      borderColor: t.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    progress: { marginTop: t.space.xl, gap: t.space.sm },
    segments: { flexDirection: 'row', gap: t.space.xs },
    segment: {
      flex: 1,
      height: 6,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.surface2,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    segmentFill: { borderRadius: t.radius.pill, backgroundColor: t.colors.primary },
    progressText: { flexDirection: 'row', justifyContent: 'space-between' },
    controls: {
      marginTop: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 28,
    },
    skip: { width: 52, height: 52 },
    play: {
      width: 72,
      height: 72,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.btn,
      alignItems: 'center',
      justifyContent: 'center',
    },
    options: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm },
    option: {
      width: '48.5%',
      flexGrow: 1,
      minHeight: 56,
      paddingHorizontal: t.space.md,
      paddingVertical: t.space.sm,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.surface2,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    optionOn: { backgroundColor: t.colors.tint },
    optionText: { flex: 1, minWidth: 0 },
  }),
);
