import { useTranslation } from 'react-i18next';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';

/** 04a: map card with a location pin. */
export function LocationArt({ size }: { size: number }) {
  const { colors: c } = useTheme();
  const { t } = useTranslation();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 260 260"
      accessibilityRole="image"
      accessibilityLabel={t('permissions.location.art')}
    >
      <Circle cx={130} cy={130} r={120} fill={c.tint} />
      <Rect
        x={42}
        y={66}
        width={176}
        height={128}
        rx={20}
        fill={c.surface}
        stroke={c.border}
        strokeWidth={1.5}
      />
      <Path
        d="M150 66c-6 30 10 50 0 80s-6 34 0 48"
        fill="none"
        stroke={c.border}
        strokeWidth={9}
        strokeLinecap="round"
      />
      <Path
        d="M42 120c40-8 80 10 176-14"
        fill="none"
        stroke={c.border}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <Path
        d="M62 194c10-26 30-30 40-60"
        fill="none"
        stroke={c.border}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <Rect x={168} y={140} width={34} height={34} rx={10} fill={c.tint} />
      <Rect x={60} y={80} width={40} height={24} rx={8} fill={c.tint} />
      <Ellipse
        cx={130}
        cy={176}
        rx={44}
        ry={13}
        fill="none"
        stroke={c.primary}
        strokeWidth={1.5}
        opacity={0.35}
      />
      <Ellipse cx={130} cy={176} rx={24} ry={7} fill={c.primary} opacity={0.25} />
      <Path d="M130 176s-34-34-34-60a34 34 0 0 1 68 0c0 26-34 60-34 60z" fill={c.primary} />
      <Circle cx={130} cy={116} r={15} fill={c.surface} />
      <Circle cx={127} cy={117} r={8} fill={c.gold} />
      <Circle cx={131} cy={113.5} r={7} fill={c.surface} />
      <Path d="M214 52l1.4 3.6L219 57l-3.6 1.4L214 62l-1.4-3.6L209 57l3.6-1.4z" fill={c.gold} />
      <Path d="M36 212l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z" fill={c.gold} />
    </Svg>
  );
}
