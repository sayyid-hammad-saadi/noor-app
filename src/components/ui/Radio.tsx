import { StyleSheet, View } from 'react-native';

import { makeStyles } from '@/theme';

/**
 * Radio indicator (.rd). Put it inside a row that carries accessibilityRole="radio"
 * and accessibilityState={{ checked }}, so the whole row is the touch target.
 */
export function Radio({ selected }: { selected: boolean }) {
  const styles = useStyles();
  return (
    <View
      style={[styles.ring, selected && styles.on]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {selected ? <View style={styles.dot} /> : null}
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    ring: {
      width: 22,
      height: 22,
      borderRadius: t.radius.pill,
      borderWidth: 2,
      borderColor: t.colors.ctl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    on: { borderColor: t.colors.btn },
    dot: { width: 10, height: 10, borderRadius: t.radius.pill, backgroundColor: t.colors.btn },
  }),
);
