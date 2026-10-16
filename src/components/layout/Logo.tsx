import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { brand } from '@/theme';

/** Noor mark: eight-point star with crescent and gold sparkle. */
export function Logo({
  size = 120,
  accessibilityLabel,
}: {
  size?: number;
  accessibilityLabel?: string;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <G fill={brand.white}>
        <Rect x={24} y={24} width={72} height={72} rx={22} />
        <Rect x={24} y={24} width={72} height={72} rx={22} rotation={45} origin="60, 60" />
      </G>
      <Circle cx={57} cy={62} r={22} fill={brand.teal} />
      <Circle cx={67} cy={54} r={19} fill={brand.white} />
      <Path d="M78 44l1.6 4.4L84 50l-4.4 1.6L78 56l-1.6-4.4L72 50l4.4-1.6z" fill={brand.gold} />
    </Svg>
  );
}
