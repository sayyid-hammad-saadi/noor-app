import { StyleSheet, View } from 'react-native';

import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

import { Text } from './Text';

export type BadgeProps = { count: number; max?: number; accessibilityLabel?: string };

/** Count pill (unread notifications). */
export function Badge({ count, max = 99, accessibilityLabel }: BadgeProps) {
  const styles = useStyles();
  const { formatNumber } = useLanguage();
  const label = count > max ? `${formatNumber(max)}+` : formatNumber(count);
  return (
    <View style={styles.root} accessibilityLabel={accessibilityLabel}>
      <Text variant="micro" weight="700" color="onBtn" tabular>
        {label}
      </Text>
    </View>
  );
}

/** Small gold dot (new / unread marker). */
export function Dot() {
  const styles = useStyles();
  return <View style={styles.dot} accessibilityElementsHidden importantForAccessibility="no" />;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      minWidth: 20,
      minHeight: 20,
      paddingHorizontal: 6,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.btn,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dot: { width: 8, height: 8, borderRadius: t.radius.pill, backgroundColor: t.colors.gold },
  }),
);
