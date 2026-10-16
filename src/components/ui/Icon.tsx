import type { LucideIcon } from 'lucide-react-native';
import { I18nManager, Platform, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import type { ColorToken } from './Text';

export type IconProps = {
  icon: LucideIcon;
  size?: number;
  color?: ColorToken;
  strokeWidth?: number;
  /** Fill the shape with the stroke colour (active tab icons). */
  filled?: boolean;
  /** Mirror in RTL layouts (back arrows, chevrons, "forward" glyphs). */
  flipInRTL?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Stroke icons in the design's style: 1.75 stroke, round caps, colour from tokens. */
export function Icon({
  icon: Glyph,
  size = 24,
  color = 'text',
  strokeWidth = 1.75,
  filled,
  flipInRTL,
  style,
}: IconProps) {
  const { colors } = useTheme();
  const tint = colors[color];
  return (
    <Glyph
      size={size}
      color={tint}
      strokeWidth={strokeWidth}
      fill={filled ? tint : 'none'}
      style={[flipInRTL && I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : null, style]}
      // react-native-svg forwards `accessible` to the DOM on web, which React rejects.
      {...(Platform.OS === 'web' ? {} : { accessible: false })}
    />
  );
}
