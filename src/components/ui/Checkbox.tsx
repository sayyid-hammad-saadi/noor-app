import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { makeStyles } from '@/theme';

import { Icon } from './Icon';
import { Touchable } from './Touchable';

export type CheckboxProps = {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
};

/** Round 26px check (.ck). Without onChange it renders as a static indicator. */
export function Checkbox({ checked, onChange, accessibilityLabel, disabled }: CheckboxProps) {
  const styles = useStyles();
  const box = (
    <View style={[styles.box, checked && styles.on]}>
      {checked ? <Icon icon={Check} size={15} color="onBtn" strokeWidth={2.5} /> : null}
    </View>
  );
  if (!onChange) return box;
  return (
    <Touchable
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={styles.hit}
    >
      {box}
    </Touchable>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    hit: {
      width: t.size.touch,
      height: t.size.touch,
      alignItems: 'center',
      justifyContent: 'center',
    },
    box: {
      width: 26,
      height: 26,
      borderRadius: t.radius.pill,
      borderWidth: 2,
      borderColor: t.colors.ctl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    on: { backgroundColor: t.colors.btn, borderColor: t.colors.btn },
  }),
);
