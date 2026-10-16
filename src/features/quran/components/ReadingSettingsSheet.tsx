import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/feedback';
import { Icon, Slider, Switch, Text, Touchable } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles, palettes, type Palette, type ReadingTheme, sepia, useTheme } from '@/theme';

import { readingPrefs } from '../data/library';

const THEME_PREVIEW: Record<ReadingTheme, Palette> = {
  light: palettes.light,
  dark: palettes.dark,
  sepia,
};

/** 12 Quran reading settings: Arabic size, what to show with each ayah, reading theme. */
export function ReadingSettingsSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { localizeDigits } = useLanguage();
  const { scheme } = useTheme();
  const prefs = readingPrefs.use();
  const activeTheme: ReadingTheme = prefs.theme ?? scheme;
  const set = (patch: Partial<typeof prefs>) => readingPrefs.set((p) => ({ ...p, ...patch }));

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.head}>
        <Text variant="h2" accessibilityRole="header" style={styles.grow}>
          {t('quran.readingSettings')}
        </Text>
        <Touchable accessibilityRole="button" onPress={onClose} style={styles.done}>
          <Text variant="bodyStrong" weight="700" color="link">
            {t('quran.settings.done')}
          </Text>
        </Touchable>
      </View>

      <View style={styles.labelRow}>
        <Text variant="label">{t('quran.settings.fontSize')}</Text>
        <Text variant="label" weight="700" color="text">
          {t('quran.settings.fontPx', { size: localizeDigits(prefs.arabicSize) })}
        </Text>
      </View>
      <View style={styles.preview}>
        <Text script="quran" size={prefs.arabicSize} align="center" maxFontSizeMultiplier={1}>
          قُلْ هُوَ ٱللَّهُ أَحَدٌ
        </Text>
      </View>
      <View style={styles.sliderRow}>
        <Text script="quran" size={18} color="text2" importantForAccessibility="no">
          ا
        </Text>
        <Slider
          value={prefs.arabicSize}
          min={24}
          max={40}
          step={2}
          onChange={(arabicSize) => set({ arabicSize })}
          accessibilityLabel={t('quran.settings.fontSize')}
          accessibilityValueText={t('quran.settings.fontPx', { size: prefs.arabicSize })}
        />
        <Text script="quran" size={30} color="text2" importantForAccessibility="no">
          ا
        </Text>
      </View>

      <Text variant="label" style={styles.section}>
        {t('quran.settings.showWith')}
      </Text>
      <View style={styles.group}>
        {(
          [
            ['transliteration', 'quran.settings.translit', 'quran.settings.sample', 'latin'],
            ['bangla', 'quran.settings.bn', 'quran.settings.bnBy', 'bn'],
            ['english', 'quran.settings.en', 'quran.settings.enBy', 'latin'],
          ] as const
        ).map(([key, label, caption, script], i) => (
          <View key={key} style={[styles.row, i > 0 && styles.rowBorder]}>
            <View style={styles.grow}>
              <Text variant="bodyStrong">{t(label)}</Text>
              <Text variant="caption" script={script}>
                {t(caption)}
              </Text>
            </View>
            <Switch
              value={prefs[key]}
              onValueChange={(v) => set({ [key]: v })}
              accessibilityLabel={t(label)}
            />
          </View>
        ))}
      </View>

      <Text variant="label" style={styles.section}>
        {t('quran.settings.theme')}
      </Text>
      <View
        style={styles.themes}
        accessibilityRole="radiogroup"
        accessibilityLabel={t('quran.settings.theme')}
      >
        {(['light', 'dark', 'sepia'] as const).map((key) => {
          const p = THEME_PREVIEW[key];
          const selected = activeTheme === key;
          return (
            <Touchable
              key={key}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => set({ theme: key })}
              style={styles.theme}
            >
              <View
                style={[
                  styles.themePreview,
                  { backgroundColor: p.surface, borderColor: selected ? p.primary : p.border },
                ]}
              >
                {selected ? (
                  <View style={[styles.themeCheck, { backgroundColor: p.primary }]}>
                    <Icon icon={Check} size={11} color="onBtn" strokeWidth={3.5} />
                  </View>
                ) : null}
                <Text script="quran" size={18} style={{ color: p.text }} maxFontSizeMultiplier={1}>
                  بِسْمِ ٱللَّهِ
                </Text>
                <View style={[styles.line, { width: '70%', backgroundColor: p.primary }]} />
                <View style={[styles.line, { width: '90%', backgroundColor: p.border }]} />
              </View>
              <Text variant="label" weight="600" color="text">
                {t(`quran.settings.themes.${key}`)}
              </Text>
            </Touchable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    grow: { flex: 1 },
    head: { minHeight: 52, flexDirection: 'row', alignItems: 'center' },
    done: { minHeight: t.size.touch, paddingHorizontal: t.space.xs, justifyContent: 'center' },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    preview: {
      paddingHorizontal: t.space.lg,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.surface2,
    },
    sliderRow: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
    section: { marginTop: t.space.xs },
    group: {
      paddingStart: 14,
      paddingEnd: t.space.xs,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface2,
    },
    row: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
      paddingVertical: t.space.xs,
    },
    rowBorder: { borderTopWidth: 1, borderTopColor: t.colors.border },
    themes: { flexDirection: 'row', gap: 10 },
    theme: { flex: 1, alignItems: 'center', gap: t.space.sm },
    themePreview: {
      width: '100%',
      minHeight: 84,
      borderRadius: t.radius.lg,
      borderWidth: 2,
      padding: 10,
      alignItems: 'flex-end',
      gap: 6,
    },
    themeCheck: {
      position: 'absolute',
      top: 6,
      start: 6,
      width: 18,
      height: 18,
      borderRadius: t.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    line: { height: 4, borderRadius: 9 },
  }),
);
