import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/feedback';
import { Radio, Text, Touchable } from '@/components/ui';
import { makeStyles } from '@/theme';

import { madhhabPref } from '../madhhabStore';
import { MADHHABS } from '../masail';

/** Picks the school answers open in. */
export function MadhhabSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const current = madhhabPref.use();
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('masail.madhhabTitle')}>
      <View accessibilityRole="radiogroup" style={styles.list}>
        {MADHHABS.map((m) => (
          <Touchable
            key={m}
            accessibilityRole="radio"
            accessibilityState={{ checked: current === m }}
            onPress={() => {
              madhhabPref.set(m);
              onClose();
            }}
            style={styles.row}
          >
            <Text variant="bodyStrong" style={styles.grow}>
              {t(`masail.schools.${m}`)}
            </Text>
            <Radio selected={current === m} />
          </Touchable>
        ))}
      </View>
      <Text variant="caption" style={styles.note}>
        {t('masail.madhhabNote')}
      </Text>
    </BottomSheet>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    list: { gap: t.space.xxs },
    row: {
      minHeight: t.size.touch + 4,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    grow: { flex: 1 },
    note: { marginTop: t.space.sm, marginBottom: t.space.md },
  }),
);
