import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';

const BARS = [
  [92, 96, 14],
  [104, 88, 30],
  [116, 80, 46],
  [128, 90, 26],
  [140, 76, 54],
  [152, 84, 38],
  [164, 92, 22],
  [176, 86, 34],
  [188, 96, 14],
] as const;

/** Onboarding 2: open Quran on a rehal with audio waves. */
export function QuranArt({ size }: { size: number }) {
  const { colors: c } = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('onboarding.slides.quran.art')}
    >
      <Svg width={size} height={size} viewBox="0 0 300 300">
        <Circle cx={150} cy={150} r={140} fill={c.tint} />
        <Path d="M50 100l1.4 3.6L55 105l-3.6 1.4L50 110l-1.4-3.6L45 105l3.6-1.4z" fill={c.gold} />
        <Path d="M258 150l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z" fill={c.gold} />
        <Path d="M80 64l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z" fill={c.gold} />
        <G fill={c.gold}>
          {BARS.map(([x, y, h]) => (
            <Rect key={x} x={x} y={y} width={6} height={h} rx={3} />
          ))}
        </G>
        <Circle cx={234} cy={102} r={24} fill={c.primary} />
        <Path d="M228 92v20l16-10z" fill={c.onBtn} />
        <G stroke={c.primaryDark} strokeWidth={10} strokeLinecap="round">
          <Line x1={100} y1={266} x2={186} y2={190} />
          <Line x1={200} y1={266} x2={114} y2={190} />
        </G>
        <Path
          d="M150 180c-24-18-58-20-84-12v66c26-8 60-6 84 12 24-18 58-20 84-12v-66c-26-8-60-6-84 12z"
          fill={c.primary}
        />
        <Path d="M150 174c-22-16-52-18-76-12v62c24-6 54-4 76 12z" fill={c.surface} />
        <Path d="M150 174c22-16 52-18 76-12v62c-24-6-54-4-76 12z" fill={c.surface} />
        <Line x1={150} y1={174} x2={150} y2={236} stroke={c.border} strokeWidth={1.5} />
        <G stroke={c.border} strokeWidth={3} strokeLinecap="round" fill="none">
          <Path d="M86 176c18-3 36-1 52 7" />
          <Path d="M86 188c18-3 36-1 52 7" />
          <Path d="M86 200c18-3 36-1 52 7" />
          <Path d="M162 183c16-8 34-10 52-7" />
          <Path d="M162 195c16-8 34-10 52-7" />
          <Path d="M162 207c16-8 34-10 52-7" />
        </G>
        <Circle cx={126} cy={214} r={4} fill="none" stroke={c.gold} strokeWidth={1.5} />
        <Circle cx={176} cy={222} r={4} fill="none" stroke={c.gold} strokeWidth={1.5} />
      </Svg>
    </View>
  );
}
