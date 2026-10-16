import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';

/** Two hanging lanterns for the Ramadan header (13a). `single` draws one (13b). */
export function Lanterns({ single, opacity = 1 }: { single?: boolean; opacity?: number }) {
  const { colors } = useTheme();
  if (single) {
    return (
      <Svg width={80} height={80} viewBox="0 0 80 80" opacity={opacity}>
        <Line x1={40} y1={0} x2={40} y2={22} stroke={colors.gold} strokeWidth={1.2} />
        <G fill={colors.gold}>
          <Path d="M33 34l7-8 7 8z" />
          <Rect x={31} y={34} width={18} height={4} rx={1.5} />
          <Rect x={32} y={38} width={16} height={24} rx={4} />
          <Rect x={31} y={62} width={18} height={4} rx={1.5} />
        </G>
        <Path d="M36 59V46a4 4 0 0 1 8 0v13z" fill={colors.illoGlow} />
      </Svg>
    );
  }
  return (
    <Svg width={120} height={150} viewBox="0 0 120 150" opacity={opacity}>
      <G stroke={colors.gold} strokeWidth={1.2} fill="none" opacity={0.7}>
        <Line x1={40} y1={0} x2={40} y2={58} />
        <Line x1={92} y1={0} x2={92} y2={26} />
      </G>
      <G fill={colors.gold} opacity={0.85}>
        <Path d="M31 72l9-10 9 10z" />
        <Rect x={28} y={72} width={24} height={5} rx={2} />
        <Rect x={30} y={77} width={20} height={34} rx={5} />
        <Rect x={28} y={111} width={24} height={5} rx={2} />
        <Path d="M34 116h12l-6 10z" />
        <Path d="M85 38l7-8 7 8z" />
        <Rect x={83} y={38} width={18} height={4} rx={1.5} />
        <Rect x={84} y={42} width={16} height={26} rx={4} />
        <Rect x={83} y={68} width={18} height={4} rx={1.5} />
        <Path d="M88 72h8l-4 7z" />
      </G>
      <Path d="M35 106V86a5 5 0 0 1 10 0v20z" fill={colors.illoGlow} opacity={0.9} />
      <Path d="M88 64V50a4 4 0 0 1 8 0v14z" fill={colors.illoGlow} opacity={0.9} />
      <Circle cx={40} cy={60} r={3} fill="none" stroke={colors.gold} strokeWidth={1.2} />
      <Circle cx={92} cy={28} r={2.5} fill="none" stroke={colors.gold} strokeWidth={1.2} />
    </Svg>
  );
}
