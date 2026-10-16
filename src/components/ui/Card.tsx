import type { PropsWithChildren } from 'react';
import { StyleSheet, type StyleProp, View, type ViewStyle } from 'react-native';

import { makeStyles, useTheme } from '@/theme';

import { Touchable } from './Touchable';

export type CardProps = PropsWithChildren<{
  /** standard: surface; active: current prayer / playing ayah; gold: Ramadan & bookmarks. */
  variant?: 'standard' | 'active' | 'gold';
  padded?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}>;

export function Card({
  variant = 'standard',
  padded = true,
  onPress,
  accessibilityLabel,
  style,
  children,
}: CardProps) {
  const styles = useStyles();
  const { shadows } = useTheme();
  const composed = [
    styles.base,
    styles[variant],
    variant === 'standard' && { boxShadow: shadows.card },
    padded && styles.pad,
    style,
  ];
  if (!onPress) return <View style={composed}>{children}</View>;
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={composed}
    >
      {children}
    </Touchable>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    base: { borderRadius: t.radius.card },
    standard: { backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.edge },
    active: { backgroundColor: t.colors.tint, borderWidth: 1.5, borderColor: t.colors.primary },
    gold: { backgroundColor: t.colors.goldTint, borderWidth: 1, borderColor: t.colors.goldBorder },
    pad: { paddingVertical: 14, paddingHorizontal: t.space.lg },
  }),
);
