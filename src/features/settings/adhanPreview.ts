import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ADHAN_ASSETS } from '@/features/prayer/adhanAssets';
import { adhanSound, type VoiceId } from '@/features/prayer/adhanVoices';

/** Plays the bundled full-length Adhan of a voice as an in-app preview. */
export function useAdhanPreview() {
  const { t } = useTranslation();
  const sound = adhanSound.use();
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const [voice, setVoice] = useState<VoiceId | null>(null);
  const playingVoice = status.playing ? voice : null;

  const toggle = (v: VoiceId) => {
    const source = ADHAN_ASSETS[v]?.preview;
    if (!source) return;
    if (playingVoice === v) {
      player.pause();
      return;
    }
    setVoice(v);
    player.replace(source);
    player.play();
  };

  const current = sound.voice === 'default' || sound.voice === 'silent' ? null : sound.voice;
  const name = t(`adhan.voices.${sound.voice}.name`);
  const summary =
    current && sound.fajrSeparate && ADHAN_ASSETS[current]?.fajrSound
      ? t('adhan.summaryFajr', { name })
      : name;

  return {
    playingVoice,
    playing: !!playingVoice && playingVoice === current,
    canPreview: !!current && !!ADHAN_ASSETS[current]?.preview,
    toggle,
    toggleCurrent: () => current && toggle(current),
    stop: () => player.pause(),
    summary,
  };
}
