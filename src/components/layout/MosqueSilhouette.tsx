import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { type Palette, useTheme } from '@/theme';

export type MosqueSilhouetteProps = {
  width?: number;
  color?: keyof Palette;
  opacity?: number;
  /** front: full skyline with crescent and ground; back: simpler distant layer. */
  variant?: 'front' | 'back';
};

/** Skyline of domes and minarets used along the bottom of the splash and headers. */
export function MosqueSilhouette({
  width = 390,
  color = 'onHeader',
  opacity = 0.14,
  variant = 'front',
}: MosqueSilhouetteProps) {
  const { colors } = useTheme();
  return (
    <Svg
      width={width}
      height={(width * 140) / 390}
      viewBox="0 0 390 140"
      preserveAspectRatio="xMidYMax meet"
      style={{ opacity }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <G fill={colors[color]}>
        {variant === 'front' ? (
          <>
            <Rect x={22} y={58} width={8} height={82} />
            <Path d="M20 58h12l-6-16z" />
            <Rect x={19} y={74} width={14} height={3} rx={1} />
            <Rect x={360} y={58} width={8} height={82} />
            <Path d="M358 58h12l-6-16z" />
            <Rect x={357} y={74} width={14} height={3} rx={1} />
            <Circle cx={75} cy={16} r={2} />
            <Circle cx={315} cy={16} r={2} />
          </>
        ) : null}
        <Rect x={70} y={40} width={10} height={100} />
        <Path d="M68 40h14l-7-20z" />
        <Rect x={66} y={60} width={18} height={4} rx={1} />
        <Rect x={310} y={40} width={10} height={100} />
        <Path d="M308 40h14l-7-20z" />
        <Rect x={306} y={60} width={18} height={4} rx={1} />
        <Path d="M96 140V98c0-14 12-24 28-28 16 4 28 14 28 28v42z" />
        <Path d="M238 140V98c0-14 12-24 28-28 16 4 28 14 28 28v42z" />
        <Path d="M140 140V84c0-24 24-42 55-50 31 8 55 26 55 50v56z" />
        {variant === 'front' ? (
          <>
            <Rect x={193.5} y={18} width={3} height={18} />
            <Path d="M195 4a6 6 0 1 0 5 9 5 5 0 1 1-5-9z" />
            <Rect x={0} y={122} width={390} height={18} />
          </>
        ) : null}
      </G>
    </Svg>
  );
}
