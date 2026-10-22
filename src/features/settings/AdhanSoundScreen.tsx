import { Play, Square } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TopBar } from '@/components/layout';
import { IconButton, List, Radio, Switch, Text, Touchable } from '@/components/ui';
import { ADHAN_ASSETS } from '@/features/prayer/adhanAssets';
import {
  type AdhanChoice,
  adhanSound,
  isVoiceAvailable,
  VOICES,
  type VoiceId,
} from '@/features/prayer/adhanVoices';
import { makeStyles } from '@/theme';

import { useAdhanPreview } from './adhanPreview';
import { SettingRow } from './components/SettingRow';

const CHOICES: readonly AdhanChoice[] = ['default', ...VOICES, 'silent'];
const isVoice = (c: AdhanChoice): c is VoiceId => c !== 'default' && c !== 'silent';

/** 32b Adhan sound: the voice for Adhan notifications, with previews and Fajr option. */
export default function AdhanSoundScreen() {
  const styles = useStyles();
  const { t } = useTranslation();
  const sound = adhanSound.use();
  const preview = useAdhanPreview();
  const anyVoice = VOICES.some(isVoiceAvailable);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar title={t('adhan.title')} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text variant="section" style={styles.section} accessibilityRole="header">
          {t('adhan.voiceSection')}
        </Text>
        <List>
          {CHOICES.map((c) => {
            const available = !isVoice(c) || isVoiceAvailable(c);
            const selected = sound.voice === c;
            const playing = isVoice(c) && preview.playingVoice === c;
            const status = !available
              ? t('adhan.notAdded')
              : playing
                ? t('adhan.playing')
                : t(`adhan.voices.${c}.note`);
            return (
              <View key={c} style={styles.row}>
                <Touchable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected, disabled: !available }}
                  disabled={!available}
                  onPress={() => adhanSound.set((s) => ({ ...s, voice: c }))}
                  style={[styles.choice, !available && styles.unavailable]}
                >
                  <Radio selected={selected} />
                  <View style={styles.grow}>
                    <Text variant="bodyStrong" weight="600">
                      {t(`adhan.voices.${c}.name`)}
                    </Text>
                    <Text variant="caption">
                      {isVoice(c) ? `${t(`adhan.voices.${c}.place`)} · ${status}` : status}
                    </Text>
                  </View>
                </Touchable>
                {isVoice(c) && ADHAN_ASSETS[c]?.preview ? (
                  <IconButton
                    icon={playing ? Square : Play}
                    size={14}
                    color={playing ? 'onBtn' : 'primary'}
                    accessibilityLabel={
                      playing
                        ? t('adhan.stop')
                        : t('adhan.preview', { name: t(`adhan.voices.${c}.name`) })
                    }
                    onPress={() => preview.toggle(c)}
                    style={[styles.preview, playing && styles.previewOn]}
                  />
                ) : null}
              </View>
            );
          })}
        </List>
        {!anyVoice ? (
          <Text variant="caption" style={styles.note}>
            {t('adhan.noneAdded')}
          </Text>
        ) : null}

        <Text variant="section" style={styles.section} accessibilityRole="header">
          {t('adhan.options')}
        </Text>
        <List>
          <SettingRow
            title={t('adhan.fajr')}
            caption={t('adhan.fajrNote')}
            control={
              <Switch
                value={sound.fajrSeparate}
                onValueChange={(fajrSeparate) => adhanSound.set((s) => ({ ...s, fajrSeparate }))}
                accessibilityLabel={t('adhan.fajr')}
              />
            }
          />
        </List>
        <Text variant="caption" style={styles.note}>
          {t('adhan.volumeNote')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    body: { paddingHorizontal: t.size.gutter, paddingBottom: t.space.xxl },
    section: { marginTop: t.space.lg, marginBottom: t.space.sm },
    row: { flexDirection: 'row', alignItems: 'center', paddingEnd: t.space.md },
    choice: {
      flex: 1,
      minHeight: 60,
      paddingVertical: 10,
      paddingStart: t.space.lg,
      paddingEnd: t.space.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    unavailable: { opacity: 0.55 },
    grow: { flex: 1 },
    preview: {
      width: 36,
      height: 36,
      minWidth: 36,
      minHeight: 36,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.tint,
    },
    previewOn: { backgroundColor: t.colors.btn },
    note: { marginTop: t.space.sm },
  }),
);
