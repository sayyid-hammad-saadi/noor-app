import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OctagonBadge, Text, Touchable } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

import { type Surah, surahMeaning, surahName } from '../data/surahs';

/** One surah in the list: number, name, place, meaning and Arabic name. */
export const SurahRow = memo(function SurahRow({
  surah,
  onPress,
}: {
  surah: Surah;
  onPress: () => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { language, localizeDigits } = useLanguage();
  const meaning = surahMeaning(surah, language);
  const count = localizeDigits(surah.ayahCount);
  const meta = meaning ? t('quran.surahMeta', { meaning, count }) : t('quran.ayahCount', { count });
  return (
    <Touchable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <OctagonBadge value={surah.number} />
      <View style={styles.text}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {surahName(surah, language)}
        </Text>
        <View style={styles.meta}>
          <View style={styles.place}>
            <Text variant="micro" color="text2">
              {t(surah.meccan ? 'quran.meccan' : 'quran.medinan')}
            </Text>
          </View>
          <Text variant="caption" numberOfLines={1} style={styles.shrink}>
            {meta}
          </Text>
        </View>
      </View>
      {language !== 'ar' ? (
        <Text script="quran" size={22} align="right" maxFontSizeMultiplier={1.2}>
          {surah.nameAr}
        </Text>
      ) : null}
    </Touchable>
  );
});

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
      paddingVertical: t.space.xs,
    },
    text: { flex: 1, minWidth: 0, gap: 3 },
    meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    place: {
      minHeight: 20,
      paddingHorizontal: t.space.sm,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.surface2,
      justifyContent: 'center',
    },
    shrink: { flexShrink: 1 },
  }),
);
