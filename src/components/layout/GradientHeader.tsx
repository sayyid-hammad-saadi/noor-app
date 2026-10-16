import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { IslamicPattern } from './IslamicPattern';

export type GradientHeaderProps = PropsWithChildren<{
  /** teal: Home, Prayer, Splash; ramadan: Ramadan night sky. */
  tone?: 'teal' | 'ramadan';
  pattern?: boolean;
  /** Pad by the top safe-area inset (header drawn under the status bar). */
  insetTop?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

/** 170° gradient header with the star pattern (.hdr). Children render in onHeader colour. */
export function GradientHeader({
  tone = 'teal',
  pattern = true,
  insetTop,
  style,
  children,
}: GradientHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const stops =
    tone === 'teal'
      ? ([colors.hdr1, colors.hdr2] as const)
      : ([colors.ramadan1, colors.ramadan2] as const);
  return (
    <LinearGradient
      colors={stops}
      // ≈170deg: top edge slightly left to bottom edge slightly right.
      start={{ x: 0.41, y: 0 }}
      end={{ x: 0.59, y: 1 }}
      style={[styles.root, insetTop ? { paddingTop: insets.top } : null, style]}
    >
      {pattern ? <IslamicPattern /> : null}
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { overflow: 'hidden' },
});
