import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';

import { ArtCardText } from './ArtCard';

/** Onboarding 3: lanterns, crescent and a stack of Zakat coins. */
export function RamadanArt({ size }: { size: number }) {
  const { colors: c } = useTheme();
  const { t } = useTranslation();
  const s = size / 300;
  return (
    <View
      style={[styles.box, { width: size, height: size }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('onboarding.slides.ramadan.art')}
    >
      <Svg width={size} height={size} viewBox="0 0 300 300">
        <Circle cx={150} cy={150} r={140} fill={c.tint} />
        <Circle cx={226} cy={78} r={30} fill={c.gold} />
        <Circle cx={240} cy={66} r={26} fill={c.tint} />
        <Path
          d="M262 130l1.4 3.6L267 135l-3.6 1.4L262 140l-1.4-3.6L257 135l3.6-1.4z"
          fill={c.gold}
        />
        <Path d="M44 150l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z" fill={c.gold} />
        <Path d="M190 128l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z" fill={c.gold} />
        <G stroke={c.gold} strokeWidth={1.5} fill="none">
          <Line x1={96} y1={22} x2={96} y2={68} />
          <Circle cx={96} cy={72} r={4} />
          <Line x1={150} y1={12} x2={150} y2={38} />
          <Circle cx={150} cy={41} r={3} />
        </G>
        <G fill={c.gold}>
          <Path d="M84 88l12-12 12 12z" />
          <Rect x={80} y={88} width={32} height={6} rx={2} />
          <Rect x={82} y={94} width={28} height={46} rx={6} />
          <Rect x={80} y={140} width={32} height={6} rx={2} />
          <Path d="M88 146h16l-8 12z" />
          <Path d="M141 54l9-10 9 10z" />
          <Rect x={138} y={54} width={24} height={5} rx={2} />
          <Rect x={139} y={59} width={22} height={36} rx={5} />
          <Rect x={138} y={95} width={24} height={5} rx={2} />
          <Path d="M144 100h12l-6 9z" />
        </G>
        <Path d="M88 134v-26a8 8 0 0 1 16 0v26z" fill={c.illoGlow} />
        <Path d="M144 90v-14a6 6 0 0 1 12 0v14z" fill={c.illoGlow} />
        {/* Coin stack, bottom to top */}
        {[236, 226, 216, 206].map((y, i) => (
          <G key={y}>
            <Rect x={178} y={y} width={60} height={i === 0 ? 8 : 10} fill={c.illoGoldEdge} />
            <Ellipse
              cx={208}
              cy={y}
              rx={30}
              ry={9}
              fill={c.gold}
              stroke={c.illoGoldEdge}
              strokeWidth={1.5}
            />
          </G>
        ))}
        <Path
          d="M208 200l1.6 3.4 3.8.6-2.7 2.6.6 3.8-3.3-1.8-3.3 1.8.6-3.8-2.7-2.6 3.8-.6z"
          fill={c.illoGoldEdge}
        />
        <Rect
          x={28}
          y={182}
          width={116}
          height={62}
          rx={14}
          fill={c.surface}
          stroke={c.border}
          strokeWidth={1.5}
        />
      </Svg>
      <ArtCardText
        scale={s}
        x={42}
        y={188}
        width={98}
        height={52}
        primary={t('onboarding.slides.ramadan.cardValue')}
        secondary={t('onboarding.slides.ramadan.cardLabel')}
        primarySize={20}
        secondarySize={11}
        primaryFirst
        primaryColor="primary"
      />
    </View>
  );
}

// Artwork is not mirrored in RTL, so the overlaid card text must stay LTR-positioned too.
// (`direction` is native-only; the web preview has no RTL layout.)
const styles = StyleSheet.create({ box: Platform.OS === 'web' ? {} : { direction: 'ltr' } });
