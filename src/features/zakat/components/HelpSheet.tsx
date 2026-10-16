import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/feedback';
import { Text } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

/** The four steps of the calculation in plain words. */
export function HelpSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { localizeDigits } = useLanguage();
  const steps = t('zakat.help.steps', { returnObjects: true }) as string[];
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('zakat.help.title')}>
      <View style={styles.list}>
        {steps.map((s, i) => (
          <View key={i} style={styles.row}>
            <View style={styles.num}>
              <Text size={13} weight="700" color="link">
                {localizeDigits(i + 1)}
              </Text>
            </View>
            <Text style={styles.grow}>{s}</Text>
          </View>
        ))}
      </View>
    </BottomSheet>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    list: { gap: t.space.md, paddingBottom: t.space.sm },
    row: { flexDirection: 'row', gap: t.space.md, alignItems: 'flex-start' },
    num: {
      width: 28,
      height: 28,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.tint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    grow: { flex: 1 },
  }),
);
