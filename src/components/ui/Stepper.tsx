import { Minus, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { makeStyles } from '@/theme';

import { Icon } from './Icon';
import { Text } from './Text';
import { Touchable } from './Touchable';

export type StepperProps = {
  /** Already formatted value, e.g. "+২". */
  value: string;
  onIncrement: () => void;
  onDecrement: () => void;
  canIncrement?: boolean;
  canDecrement?: boolean;
  accessibilityLabel: string;
};

/** − value + stepper (.step), e.g. per-prayer minute adjustment. */
export function Stepper({
  value,
  onIncrement,
  onDecrement,
  canIncrement = true,
  canDecrement = true,
  accessibilityLabel,
}: StepperProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <View
      style={styles.root}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'increment' && canIncrement) onIncrement();
        if (e.nativeEvent.actionName === 'decrement' && canDecrement) onDecrement();
      }}
    >
      <Touchable
        accessibilityLabel={t('actions.decrease')}
        disabled={!canDecrement}
        onPress={onDecrement}
        style={[styles.btn, !canDecrement && styles.off]}
      >
        <Icon icon={Minus} size={18} color="link" />
      </Touchable>
      <Text variant="bodyStrong" weight="700" tabular align="center" style={styles.value}>
        {value}
      </Text>
      <Touchable
        accessibilityLabel={t('actions.increase')}
        disabled={!canIncrement}
        onPress={onIncrement}
        style={[styles.btn, !canIncrement && styles.off]}
      >
        <Icon icon={Plus} size={18} color="link" />
      </Touchable>
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      minHeight: t.size.touch,
      flexDirection: 'row',
      alignItems: 'stretch',
      borderRadius: t.radius.md,
      borderWidth: 1.5,
      borderColor: t.colors.ctl,
      overflow: 'hidden',
      alignSelf: 'flex-start',
    },
    btn: { width: 40, alignItems: 'center', justifyContent: 'center' },
    off: { opacity: 0.4 },
    value: { minWidth: 44, alignSelf: 'center' },
  }),
);
