import { useEffect } from 'react';
import { I18nManager, Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { makeStyles, useTheme } from '@/theme';

export type SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** Required: what the switch controls. */
  accessibilityLabel: string;
  disabled?: boolean;
};

const TRACK_W = 50;
const KNOB = 24;
const PAD = 3;
const TRAVEL = TRACK_W - KNOB - PAD * 2;

/** 50×30 switch inside a 58×44 touch target. Mirrors in RTL. */
export function Switch({ value, onValueChange, accessibilityLabel, disabled }: SwitchProps) {
  const styles = useStyles();
  const { colors, shadows } = useTheme();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 180 });
  }, [value, progress]);

  const direction = I18nManager.isRTL ? -1 : 1;
  const trackOff = colors.ctl;
  const trackOn = colors.btn;
  const knobOff = colors.knobOff;
  const knobOn = colors.onBtn;

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [trackOff, trackOn]),
  }));
  const knobStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [knobOff, knobOn]),
    transform: [{ translateX: progress.value * TRAVEL * direction }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[styles.hit, disabled && styles.disabled]}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.knob, { boxShadow: shadows.knob }, knobStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    hit: { width: 58, height: t.size.touch, alignItems: 'center', justifyContent: 'center' },
    track: {
      width: TRACK_W,
      height: 30,
      borderRadius: t.radius.pill,
      padding: PAD,
      flexDirection: 'row',
      alignItems: 'center',
    },
    knob: { width: KNOB, height: KNOB, borderRadius: t.radius.pill },
    disabled: { opacity: 0.5 },
  }),
);
