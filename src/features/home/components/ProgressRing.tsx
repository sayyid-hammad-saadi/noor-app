import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { type ColorToken, Text } from '@/components/ui';
import { useTheme } from '@/theme';

/** Circular progress with a centred label (Today's Amol "2/5", My Ramadan). */
export function ProgressRing({
  progress,
  label,
  accessibilityLabel,
  size = 44,
  stroke = 5,
  color = 'primary',
  labelSize,
}: {
  progress: number;
  label: string;
  accessibilityLabel: string;
  size?: number;
  stroke?: number;
  color?: ColorToken;
  /** Label font size; defaults to the micro variant. */
  labelSize?: number;
}) {
  const { colors } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(1, progress)) * c;
  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colors.surface2}
          strokeWidth={stroke}
        />
        {filled > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={colors[color]}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${c}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text variant="micro" size={labelSize} weight="700" tabular maxFontSizeMultiplier={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center' } });
