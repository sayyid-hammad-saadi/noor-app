import { useTranslation } from 'react-i18next';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { useTheme } from '@/theme';

/** 04b: ringing bell with sound waves. */
export function BellArt({ size }: { size: number }) {
  const { colors: c } = useTheme();
  const { t } = useTranslation();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 260 260"
      accessibilityRole="image"
      accessibilityLabel={t('permissions.notifications.art')}
    >
      <Circle cx={130} cy={130} r={120} fill={c.tint} />
      <G fill="none" stroke={c.gold} strokeWidth={5} strokeLinecap="round">
        <Path d="M64 92a60 60 0 0 0 0 64" />
        <Path d="M196 92a60 60 0 0 1 0 64" />
      </G>
      <G fill="none" stroke={c.gold} strokeWidth={5} strokeLinecap="round" opacity={0.5}>
        <Path d="M46 78a84 84 0 0 0 0 92" />
        <Path d="M214 78a84 84 0 0 1 0 92" />
      </G>
      <Circle cx={130} cy={58} r={8} fill={c.primary} />
      <Path
        d="M130 62c-30 0-50 22-50 52v32l-14 22h128l-14-22v-32c0-30-20-52-50-52z"
        fill={c.primary}
      />
      <Circle cx={130} cy={180} r={13} fill={c.primaryDark} />
      <Circle cx={126} cy={114} r={14} fill={c.gold} />
      <Circle cx={133} cy={108} r={12} fill={c.primary} />
      <Path d="M214 40l1.4 3.6L219 45l-3.6 1.4L214 50l-1.4-3.6L209 45l3.6-1.4z" fill={c.gold} />
      <Path d="M40 204l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z" fill={c.gold} />
    </Svg>
  );
}
