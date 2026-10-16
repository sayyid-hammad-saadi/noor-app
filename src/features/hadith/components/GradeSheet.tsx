import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/feedback';
import { GradeChip, Text } from '@/components/ui';
import { makeStyles } from '@/theme';

import { gradeOf } from '../data/text';
import type { Hadith } from '../data/types';

/** Who graded this hadith, as given in the dataset. */
export function GradeSheet({
  hadith,
  visible,
  onClose,
}: {
  hadith: Hadith;
  visible: boolean;
  onClose: () => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const book = t(`hadith.books.${hadith.book}`);
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('hadith.gradesTitle')}>
      <View style={styles.list}>
        {hadith.grades.length ? (
          hadith.grades.map(([name, grade], i) => (
            <View key={i} style={[styles.row, i > 0 && styles.rule]}>
              <View style={styles.grow}>
                <Text variant="bodyStrong" script="latin">
                  {name}
                </Text>
                <Text variant="caption" script="latin">
                  {grade}
                </Text>
              </View>
              <GradeChip grade={gradeOf('tirmidhi', [[name, grade]])} />
            </View>
          ))
        ) : (
          <View style={styles.row}>
            <Text style={styles.grow}>{t('hadith.consensus', { book })}</Text>
            <GradeChip grade="sahih" />
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    list: { paddingBottom: t.space.sm },
    row: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
      paddingVertical: t.space.sm,
    },
    rule: { borderTopWidth: 1, borderTopColor: t.colors.border },
    grow: { flex: 1 },
  }),
);
