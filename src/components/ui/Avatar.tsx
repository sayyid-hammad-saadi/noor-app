import { StyleSheet, View } from 'react-native';

import { makeStyles } from '@/theme';

import { Text } from './Text';

/** Initials tile (.avatar) for reciters and the signed-in user. */
export function Avatar({ initials, size = 40 }: { initials: string; size?: number }) {
  const styles = useStyles();
  return (
    <View
      style={[styles.root, { width: size, height: size, borderRadius: size * 0.3 }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text variant="label" weight="700" color="link" size={Math.round(size * 0.33)}>
        {initials}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { backgroundColor: t.colors.tint, alignItems: 'center', justifyContent: 'center' },
  }),
);
