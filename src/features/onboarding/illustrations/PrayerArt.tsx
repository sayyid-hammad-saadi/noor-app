import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';

import { ArtCardText } from './ArtCard';

/** Onboarding 1: mosque, prayer-time card and Qibla compass. */
export function PrayerArt({ size }: { size: number }) {
  const { colors: c } = useTheme();
  const { t } = useTranslation();
  const s = size / 300;
  return (
    <View
      style={[styles.box, { width: size, height: size }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('onboarding.slides.prayer.art')}
    >
      <Svg width={size} height={size} viewBox="0 0 300 300">
        <Circle cx={150} cy={150} r={140} fill={c.tint} />
        <Circle cx={78} cy={74} r={22} fill={c.gold} />
        <Circle cx={88} cy={66} r={19} fill={c.tint} />
        <Path d="M44 120l1.4 3.6L49 125l-3.6 1.4L44 130l-1.4-3.6L39 125l3.6-1.4z" fill={c.gold} />
        <Path d="M120 52l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z" fill={c.gold} />
        <Path d="M266 176l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z" fill={c.gold} />
        <G fill={c.primary}>
          <Rect x={70} y={122} width={12} height={108} />
          <Path d="M67 122h18l-9-26z" />
          <Rect x={64} y={148} width={24} height={5} rx={2} />
          <Rect x={218} y={122} width={12} height={108} />
          <Path d="M215 122h18l-9-26z" />
          <Rect x={212} y={148} width={24} height={5} rx={2} />
          <Path d="M95 232v-58c0-26 25-44 55-52 30 8 55 26 55 52v58z" />
          <Rect x={149} y={100} width={2} height={22} />
        </G>
        <Path d="M150 88a6 6 0 1 0 5 9 5 5 0 1 1-5-9z" fill={c.gold} />
        <Path d="M140 232v-22a10 10 0 0 1 20 0v22z" fill={c.tint} />
        <Path d="M112 196v-10a6 6 0 0 1 12 0v10z" fill={c.tint} />
        <Path d="M176 196v-10a6 6 0 0 1 12 0v10z" fill={c.tint} />
        <Rect x={48} y={228} width={204} height={10} rx={3} fill={c.primaryDark} />
        {/* Qibla compass */}
        <Circle cx={230} cy={84} r={40} fill={c.surface} stroke={c.border} strokeWidth={1.5} />
        <Circle cx={230} cy={84} r={31} fill="none" stroke={c.tint} strokeWidth={2} />
        <G transform="rotate(-38 230 84)">
          <Path d="M230 56l7 28h-14z" fill={c.primary} />
          <Path d="M230 112l7-28h-14z" fill={c.border} />
        </G>
        <Circle cx={230} cy={84} r={4} fill={c.surface} stroke={c.primary} strokeWidth={2} />
        <Rect x={208} y={54} width={9} height={9} rx={1.5} fill={c.illoInk} />
        <Rect x={208} y={56.5} width={9} height={1.6} fill={c.gold} />
        {/* Prayer-time card */}
        <Rect
          x={18}
          y={186}
          width={112}
          height={50}
          rx={14}
          fill={c.surface}
          stroke={c.border}
          strokeWidth={1.5}
        />
        <Circle cx={42} cy={211} r={12} fill={c.tint} />
        <Path
          d="M36 214a6 6 0 0 1 12 0M42 204v3M34 214h-1M51 214h-1"
          fill="none"
          stroke={c.gold}
          strokeWidth={1.75}
          strokeLinecap="round"
        />
      </Svg>
      <ArtCardText
        scale={s}
        x={60}
        y={190}
        width={66}
        height={42}
        secondary={t('onboarding.slides.prayer.cardLabel')}
        primary={t('onboarding.slides.prayer.cardValue')}
        secondarySize={11}
        primarySize={15}
      />
    </View>
  );
}

// Artwork is not mirrored in RTL, so the overlaid card text must stay LTR-positioned too.
// (`direction` is native-only; the web preview has no RTL layout.)
const styles = StyleSheet.create({ box: Platform.OS === 'web' ? {} : { direction: 'ltr' } });
