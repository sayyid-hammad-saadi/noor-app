import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, G, Path, Pattern, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';

/** Eight-point star lattice drawn over gradient headers at low opacity. */
export function IslamicPattern({
  opacity = 0.05,
  id = 'noor-star',
}: {
  opacity?: number;
  id?: string;
}) {
  const { colors } = useTheme();
  return (
    <Svg
      style={[StyleSheet.absoluteFill, { opacity }]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Defs>
        <Pattern id={id} width={56} height={56} patternUnits="userSpaceOnUse">
          <G fill="none" stroke={colors.onHeader} strokeWidth={1.2}>
            <Rect x={18} y={18} width={20} height={20} />
            <Rect x={18} y={18} width={20} height={20} rotation={45} origin="28, 28" />
            <Circle cx={28} cy={28} r={4} />
            <Path d="M0 0l8 8M56 0l-8 8M0 56l8-8M56 56l-8-8" />
          </G>
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
