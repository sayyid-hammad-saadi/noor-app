import { useState } from 'react';
import {
  type LayoutChangeEvent,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Mask,
  Path,
  Pattern,
  Rect,
  Stop,
} from 'react-native-svg';

import { type Palette, useTheme } from '@/theme';

export type IslamicPatternProps = {
  opacity?: number;
  /** Stroke colour token; onHeader for gradient headers, primary on plain grounds. */
  color?: keyof Palette;
  /** Fade the pattern out towards the bottom (Language screen). */
  fadeOut?: boolean;
  /** Unique per screen so SVG ids don't collide. */
  id?: string;
  style?: StyleProp<ViewStyle>;
};

/** Eight-point star lattice drawn over headers and grounds at low opacity. */
export function IslamicPattern({
  opacity = 0.05,
  color = 'onHeader',
  fadeOut,
  id = 'noor-star',
  style,
}: IslamicPatternProps) {
  const { colors } = useTheme();
  const stroke = colors[color];
  // Percent sizes inside SVG are unreliable across platforms; measure and pass pixels.
  const [box, setBox] = useState({ width: 0, height: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== box.width || height !== box.height) setBox({ width, height });
  };
  return (
    <View
      style={[StyleSheet.absoluteFill, { opacity }, style]}
      onLayout={onLayout}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {box.width > 0 ? (
        <Svg width={box.width} height={box.height}>
          <Defs>
            <Pattern id={id} width={56} height={56} patternUnits="userSpaceOnUse">
              <G fill="none" stroke={stroke} strokeWidth={1.2}>
                <Rect x={18} y={18} width={20} height={20} />
                <Rect x={18} y={18} width={20} height={20} transform="rotate(45 28 28)" />
                <Circle cx={28} cy={28} r={4} />
                <Path d="M0 0l8 8M56 0l-8 8M0 56l8-8M56 56l-8-8" />
              </G>
            </Pattern>
            {fadeOut ? (
              <>
                <LinearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.onHeader} stopOpacity={1} />
                  <Stop offset="1" stopColor={colors.onHeader} stopOpacity={0} />
                </LinearGradient>
                <Mask id={`${id}-mask`}>
                  <Rect width={box.width} height={box.height} fill={`url(#${id}-fade)`} />
                </Mask>
              </>
            ) : null}
          </Defs>
          <Rect
            width={box.width}
            height={box.height}
            fill={`url(#${id})`}
            mask={fadeOut ? `url(#${id}-mask)` : undefined}
          />
        </Svg>
      ) : null}
    </View>
  );
}
