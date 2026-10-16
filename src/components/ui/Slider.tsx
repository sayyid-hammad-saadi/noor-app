import { useState } from 'react';
import { I18nManager, type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { makeStyles, useTheme } from '@/theme';

export type SliderProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
  /** Spoken value, e.g. "30 px". */
  accessibilityValueText?: string;
};

/** Stepped slider: drag or tap the track; screen readers adjust with swipe up/down. */
export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  accessibilityLabel,
  accessibilityValueText,
}: SliderProps) {
  const styles = useStyles();
  const { shadows } = useTheme();
  const [width, setWidth] = useState(0);

  const update = (x: number) => {
    if (!width) return;
    const ratio = Math.min(1, Math.max(0, (I18nManager.isRTL ? width - x : x) / width));
    const next = Math.round((min + ratio * (max - min)) / step) * step;
    if (next !== value) onChange(next);
  };

  const pan = Gesture.Pan()
    .minDistance(0)
    .runOnJS(true)
    .onBegin((e) => update(e.x))
    .onUpdate((e) => update(e.x));

  const ratio = (value - min) / (max - min);

  return (
    <GestureDetector gesture={pan}>
      <View
        style={styles.hit}
        onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min, max, now: value, text: accessibilityValueText }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'increment') onChange(Math.min(max, value + step));
          if (e.nativeEvent.actionName === 'decrement') onChange(Math.max(min, value - step));
        }}
      >
        <View style={styles.track} pointerEvents="none">
          <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
        </View>
        <View
          pointerEvents="none"
          style={[styles.thumb, { start: ratio * width - 12, boxShadow: shadows.knob }]}
        />
      </View>
    </GestureDetector>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    hit: { flex: 1, height: t.size.touch, justifyContent: 'center' },
    track: {
      height: 4,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.border,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    fill: { backgroundColor: t.colors.primary },
    thumb: {
      position: 'absolute',
      width: 24,
      height: 24,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.surface,
      borderWidth: 2,
      borderColor: t.colors.primary,
    },
  }),
);
