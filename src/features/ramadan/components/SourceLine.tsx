import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { GradeChip, Text } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

import type { Source } from '../content';
import { sourceLabel } from '../format';

/** "Muslim 2702 [Sahih]": the reference with its grade chip. */
export function SourceLine({ source }: { source: Source }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { localizeDigits } = useLanguage();
  return (
    <View style={styles.root}>
      <Text variant="caption">{sourceLabel(source, t, localizeDigits)}</Text>
      {source.grade ? <GradeChip grade={source.grade} /> : null}
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm, flexWrap: 'wrap' },
  }),
);
