import { useEffect } from 'react';
import { type DimensionValue, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';

export type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  /** Translucent block for gradient headers (.skw). */
  onHeader?: boolean;
};

/** Pulsing placeholder block (.sk). Static when the user prefers reduced motion. */
export function Skeleton({
  width = '100%',
  height = 14,
  radius = 8,
  style,
  onHeader,
}: SkeletonProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const from = onHeader ? colors.onHeaderChip : colors.skel1;
  const to = onHeader ? colors.onHeaderChip : colors.skel2;

  useEffect(() => {
    if (reduceMotion) return;
    progress.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
    return () => cancelAnimation(progress);
  }, [reduceMotion, progress]);

  const animated = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [from, to]),
    // Header blocks share one colour, so they pulse by opacity instead.
    opacity: onHeader ? 1 - progress.value * 0.45 : 1,
  }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.base, { width, height, borderRadius: radius }, animated, style]}
    />
  );
}

const styles = StyleSheet.create({ base: { overflow: 'hidden' } });
