import { forwardRef, useMemo } from 'react';
import {
  I18nManager,
  Text as RNText,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';

import { useLanguage } from '@/i18n';
import {
  buildTextStyle,
  type Palette,
  type Script,
  type TextVariant,
  useTheme,
  type Weight,
  variants,
} from '@/theme';

export type ColorToken = keyof Palette;

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  /** Typeface family. Defaults to the current UI language's script. */
  script?: Script;
  weight?: Weight;
  size?: number;
  color?: ColorToken;
  /**
   * Defaults to 'start' (follows the layout direction, not the text's script).
   * 'right' is the physical right edge in every layout direction; use it for Arabic
   * and Quran text, which always reads from the right.
   */
  align?: 'auto' | 'start' | 'center' | 'end' | 'right';
  /** Tabular figures for times and amounts. */
  tabular?: boolean;
};

// React Native mirrors left/right when the layout is RTL, so 'left' means start.
const ALIGN: Record<NonNullable<TextProps['align']>, TextStyle['textAlign']> = {
  auto: 'auto',
  start: 'left',
  center: 'center',
  end: 'right',
  right: I18nManager.isRTL ? 'left' : 'right',
};

/**
 * The only text primitive. Picks the font family for the script, sets a line height
 * tall enough for Bangla and Arabic glyphs, and reads colour from theme tokens.
 */
export const Text = forwardRef<RNText, TextProps>(function Text(
  {
    variant = 'body',
    script,
    weight,
    size,
    color,
    align = 'start',
    tabular,
    style,
    maxFontSizeMultiplier = 1.6,
    ...rest
  },
  ref,
) {
  const { colors } = useTheme();
  const { script: uiScript } = useLanguage();
  const resolvedScript = script ?? uiScript;
  const tone = color ?? variants[variant].tone ?? 'text';

  const base = useMemo<TextStyle>(() => {
    const s = buildTextStyle({ variant, script: resolvedScript, size, weight });
    if (tabular) s.fontVariant = ['tabular-nums'];
    s.textAlign = ALIGN[align];
    return s;
  }, [variant, resolvedScript, size, weight, tabular, align]);

  return (
    <RNText
      ref={ref}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[base, { color: colors[tone] }, style]}
      {...rest}
    />
  );
});
