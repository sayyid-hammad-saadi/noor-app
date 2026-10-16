import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { makeStyles, useTheme } from '@/theme';

/** Pager dots: the active one stretches to a 24px pill. */
export function PageDots({
  count,
  index,
  accessibilityLabel,
}: {
  count: number;
  index: number;
  accessibilityLabel: string;
}) {
  const styles = useStyles();
  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
    >
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} active={i === index} />
      ))}
    </View>
  );
}

function Dot({ active }: { active: boolean }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const progress = useSharedValue(active ? 1 : 0);
  const off = colors.border;
  const on = colors.primary;

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 220 });
  }, [active, progress]);

  const animated = useAnimatedStyle(() => ({
    width: 8 + 16 * progress.value,
    backgroundColor: interpolateColor(progress.value, [0, 1], [off, on]),
  }));

  return <Animated.View style={[styles.dot, animated]} />;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'center', gap: t.space.sm },
    dot: { height: 8, borderRadius: t.radius.pill },
  }),
);
