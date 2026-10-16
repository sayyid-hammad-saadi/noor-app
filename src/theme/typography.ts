import type { TextStyle } from 'react-native';

import type { FontFamily } from './fonts';

/**
 * Which typeface a run of text needs.
 * - latin: Plus Jakarta Sans (English UI)
 * - bn: Hind Siliguri (Bangla UI)
 * - ar: IBM Plex Sans Arabic (Arabic UI, Hijri dates)
 * - quran: Amiri Quran (Quranic text in every language)
 */
export type Script = 'latin' | 'bn' | 'ar' | 'quran';
export type Weight = '400' | '500' | '600' | '700';

/** On Android each weight is its own family, so weight is chosen through the family name. */
const families: Record<Script, Record<Weight, FontFamily>> = {
  latin: {
    '400': 'PlusJakartaSans_400Regular',
    '500': 'PlusJakartaSans_500Medium',
    '600': 'PlusJakartaSans_600SemiBold',
    '700': 'PlusJakartaSans_700Bold',
  },
  bn: {
    '400': 'HindSiliguri_400Regular',
    '500': 'HindSiliguri_500Medium',
    '600': 'HindSiliguri_600SemiBold',
    '700': 'HindSiliguri_700Bold',
  },
  ar: {
    '400': 'IBMPlexSansArabic_400Regular',
    '500': 'IBMPlexSansArabic_500Medium',
    '600': 'IBMPlexSansArabic_600SemiBold',
    '700': 'IBMPlexSansArabic_700Bold',
  },
  // Amiri Quran ships a single weight.
  quran: {
    '400': 'AmiriQuran_400Regular',
    '500': 'AmiriQuran_400Regular',
    '600': 'AmiriQuran_400Regular',
    '700': 'AmiriQuran_400Regular',
  },
};

export function fontFamily(script: Script, weight: Weight = '400'): FontFamily {
  return families[script][weight];
}

/**
 * Minimum line-height multiplier per script. Bangla conjuncts and vowel signs and
 * Arabic diacritics extend far above and below Latin metrics, so they get more
 * room. Quran text uses the design's 2.05.
 */
export const minLineHeight: Record<Script, number> = {
  latin: 1.25,
  bn: 1.55,
  ar: 1.6,
  quran: 2.05,
};

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'title'
  | 'body'
  | 'bodyStrong'
  | 'subtle'
  | 'label'
  | 'section'
  | 'caption'
  | 'overline'
  | 'button'
  | 'buttonSm'
  | 'micro';

export type VariantSpec = {
  size: number;
  weight: Weight;
  lineHeight: number;
  /** Letter spacing in em; only applied to Latin text (it breaks Arabic joining). */
  tracking?: number;
  uppercase?: boolean;
  tone?: 'text' | 'text2';
};

/** Type scale from noor.css (.h1, .h2, .ttl, .t, .body, .cap, .over, .fl, .sec, .btn). */
export const variants: Record<TextVariant, VariantSpec> = {
  display: { size: 40, weight: '700', lineHeight: 1.1, tracking: -0.02 },
  h1: { size: 24, weight: '700', lineHeight: 1.25, tracking: -0.01 },
  h2: { size: 20, weight: '700', lineHeight: 1.3 },
  title: { size: 17, weight: '700', lineHeight: 1.35 },
  bodyStrong: { size: 15, weight: '600', lineHeight: 1.4 },
  body: { size: 15, weight: '400', lineHeight: 1.55 },
  subtle: { size: 15, weight: '400', lineHeight: 1.55, tone: 'text2' },
  label: { size: 13, weight: '600', lineHeight: 1.4, tone: 'text2' },
  section: { size: 13, weight: '700', lineHeight: 1.4, tracking: 0.02, tone: 'text2' },
  caption: { size: 12, weight: '500', lineHeight: 1.4, tone: 'text2' },
  overline: {
    size: 12,
    weight: '700',
    lineHeight: 1.4,
    tracking: 0.05,
    uppercase: true,
    tone: 'text2',
  },
  button: { size: 17, weight: '700', lineHeight: 1.3 },
  buttonSm: { size: 15, weight: '700', lineHeight: 1.3 },
  micro: { size: 11, weight: '600', lineHeight: 1.3 },
};

type BuildOptions = {
  variant: TextVariant;
  script: Script;
  size?: number;
  weight?: Weight;
};

/** Resolves a variant into a concrete style for the given script. */
export function buildTextStyle({ variant, script, size, weight }: BuildOptions): TextStyle {
  const spec = variants[variant];
  const fontSize = size ?? spec.size;
  const isLatin = script === 'latin';
  const multiplier = Math.max(spec.lineHeight, minLineHeight[script]);
  return {
    fontFamily: fontFamily(script, weight ?? spec.weight),
    fontSize,
    lineHeight: Math.ceil(fontSize * multiplier),
    letterSpacing: isLatin && spec.tracking ? spec.tracking * fontSize : 0,
    textTransform: isLatin && spec.uppercase ? 'uppercase' : 'none',
  };
}
