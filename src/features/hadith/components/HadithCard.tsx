import { Bookmark } from 'lucide-react-native';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { GradeChip, Icon, Text, Touchable } from '@/components/ui';
import { type Language, localizeDigits } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';

import type { Hadith } from '../data/types';

/** The preview text in the UI language. */
export function previewText(h: Hadith, language: Language): string {
  if (language === 'bn' && h.bnBody) return h.bnBody;
  if (language === 'ar') return h.matn ?? h.ar;
  return h.enBody || h.bnBody;
}

/** Reference, grade, two lines of text and the narrator (21a card). */
export const HadithCard = memo(function HadithCard({
  hadith,
  saved,
  language,
  onPress,
}: {
  hadith: Hadith;
  saved: boolean;
  language: Language;
  onPress: () => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const ref = t('hadith.ref', {
    book: t(`hadith.books.${hadith.book}`),
    n: localizeDigits(hadith.ref, language),
  });
  return (
    <Touchable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.card, { boxShadow: shadows.card }]}
    >
      <View style={styles.head}>
        <Text variant="caption" weight="700" color="link" style={styles.shrink} numberOfLines={1}>
          {ref}
        </Text>
        <GradeChip grade={hadith.grade} />
        <View style={styles.grow} />
        {saved ? <Icon icon={Bookmark} size={18} color="goldText" filled /> : null}
      </View>
      <Text numberOfLines={2} script={language === 'ar' ? 'ar' : undefined} style={styles.text}>
        {previewText(hadith, language)}
      </Text>
      {hadith.narrator && language === 'en' ? (
        <Text variant="caption" weight="400">
          {t('hadith.narratedBy', { name: hadith.narrator })}
        </Text>
      ) : null}
    </Touchable>
  );
});

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    card: {
      paddingTop: t.space.md,
      paddingStart: t.space.lg,
      paddingEnd: 14,
      paddingBottom: 14,
      gap: 6,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
    head: { minHeight: 26, flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
    shrink: { flexShrink: 1 },
    grow: { flex: 1 },
    text: { paddingEnd: t.space.xs },
  }),
);
