/**
 * Noor colour tokens, taken from the design's shared stylesheet (noor.css) plus the
 * per-screen variables the design defines. This folder is the ONLY place colour
 * literals may appear (enforced by ESLint); everything else reads `useTheme().colors`.
 */

export type ColorScheme = 'light' | 'dark';

export type Palette = {
  // grounds
  bg: string;
  surface: string;
  surface2: string;
  /** Hairline border on cards in dark mode (transparent in light, where cards use a shadow). */
  edge: string;
  border: string;
  /** Outlines of unselected controls; 3:1 against the surface. */
  ctl: string;

  // brand
  primary: string;
  primaryDark: string;
  tint: string;

  // text
  text: string;
  text2: string;
  link: string;

  // buttons
  btn: string;
  onBtn: string;
  disBg: string;
  disFg: string;

  // gold (Ramadan, Laylatul Qadr, bookmarks)
  gold: string;
  goldTint: string;
  goldText: string;
  goldBorder: string;

  // status
  danger: string;
  dangerTint: string;
  dangerText: string;
  success: string;
  okBg: string;
  okFg: string;

  // headers
  hdr1: string;
  hdr2: string;
  /** Text and icons drawn on the gradient headers. */
  onHeader: string;
  /** Translucent chips and buttons on gradient headers. */
  onHeaderChip: string;
  /** Highlight pill on gradient headers (e.g. "Next prayer"). */
  hlBg: string;
  hlFg: string;
  /** Ramadan night-sky header. */
  ramadan1: string;
  ramadan2: string;
  /** Gold accents on the Ramadan header. */
  headerGold: string;

  /** Cards that sit on a surface sheet (Home); one step up from surface in dark. */
  cardRaised: string;

  // feedback
  skel1: string;
  skel2: string;
  toast: string;
  onToast: string;
  overlay: string;
  /** Thumb of a switch that is off (always white in the design). */
  knobOff: string;
  /** Inactive dot in the calendar legend. */
  mutedDot: string;

  // illustrations (onboarding art)
  /** Dark device/ink details. */
  illoInk: string;
  /** Warm lantern glow. */
  illoGlow: string;
  /** Darker gold for coin edges. */
  illoGoldEdge: string;
};

const light: Palette = {
  bg: '#F4F7F6',
  surface: '#FFFFFF',
  surface2: '#EEF4F2',
  edge: 'transparent',
  border: '#E3EAE8',
  ctl: '#7D8C88',

  primary: '#14A38B',
  primaryDark: '#0B7A68',
  tint: '#E3F5F1',

  text: '#0F1F1C',
  text2: '#5B6B67',
  link: '#0B7A68',

  btn: '#0B7A68',
  onBtn: '#FFFFFF',
  disBg: '#E3EAE8',
  disFg: '#6B7A76',

  gold: '#D9A441',
  goldTint: '#FBF3E2',
  goldText: '#7A5410',
  goldBorder: '#F0DDB4',

  danger: '#C93A3F',
  dangerTint: '#FDECEC',
  dangerText: '#C2363B',
  success: '#1FA971',
  okBg: '#E3F6EC',
  okFg: '#157A50',

  hdr1: '#0A6E5E',
  hdr2: '#07564A',
  onHeader: '#FFFFFF',
  onHeaderChip: 'rgba(255,255,255,0.16)',
  hlBg: '#FFFFFF',
  hlFg: '#0B7A68',
  ramadan1: '#0A544C',
  ramadan2: '#14324D',
  headerGold: '#F3D58E',
  cardRaised: '#FFFFFF',

  skel1: '#E8EEEC',
  skel2: '#F3F7F6',
  toast: '#16221F',
  onToast: '#FFFFFF',
  overlay: 'rgba(4,14,12,0.48)',
  knobOff: '#FFFFFF',
  mutedDot: '#8A9894',

  illoInk: '#1A1F1E',
  illoGlow: '#FCEFC9',
  illoGoldEdge: '#B98A2E',
};

const dark: Palette = {
  bg: '#0B1412',
  surface: '#121E1B',
  surface2: '#182A26',
  edge: '#243733',
  border: '#243733',
  ctl: '#5E7570',

  primary: '#2BC4A8',
  primaryDark: '#22A891',
  tint: '#14332D',

  text: '#E8F1EF',
  text2: '#9DB2AD',
  link: '#2BC4A8',

  btn: '#2BC4A8',
  onBtn: '#05211C',
  disBg: '#1E2E2A',
  disFg: '#7F938E',

  gold: '#E3B55A',
  goldTint: '#2A2414',
  goldText: '#E3B55A',
  goldBorder: '#4A3D1E',

  danger: '#FF6B6B',
  dangerTint: '#3A1A1B',
  dangerText: '#FF8A8A',
  success: '#2BC48A',
  okBg: '#12301F',
  okFg: '#2BC48A',

  hdr1: '#0F3B34',
  hdr2: '#0B2A25',
  onHeader: '#FFFFFF',
  onHeaderChip: 'rgba(255,255,255,0.14)',
  hlBg: '#2BC4A8',
  hlFg: '#05211C',
  ramadan1: '#0B2F2B',
  ramadan2: '#0C1A2B',
  headerGold: '#E3B55A',
  cardRaised: '#182A26',

  skel1: '#182623',
  skel2: '#20322E',
  toast: '#E8F1EF',
  onToast: '#0B1412',
  overlay: 'rgba(4,14,12,0.48)',
  knobOff: '#FFFFFF',
  mutedDot: '#6F817C',

  illoInk: '#1A1F1E',
  illoGlow: '#FCEFC9',
  illoGoldEdge: '#B98A2E',
};

export const palettes: Record<ColorScheme, Palette> = { light, dark };

/** Mode-independent brand colours (logo mark). */
export const brand = {
  teal: '#14A38B',
  tealDark: '#0B7A68',
  gold: '#D9A441',
  white: '#FFFFFF',
} as const;

/**
 * Shadows as CSS box-shadow strings (supported by React Native's New Architecture).
 * Dark mode uses the `edge` border instead of shadows, as in the design.
 */
export type Shadows = {
  card: string | undefined;
  sheet: string | undefined;
  player: string | undefined;
  sticky: string | undefined;
  toast: string;
  segment: string | undefined;
  knob: string;
  /** Lifted item on a gradient header (current prayer). */
  highlight: string;
  /** Qibla dial: soft lift in light, hairline ring in dark. */
  dial: string;
  /** Green glow around the dial when facing the Qibla. */
  glow: string;
};

export const shadows: Record<ColorScheme, Shadows> = {
  light: {
    card: '0px 1px 2px rgba(15,31,28,0.04), 0px 8px 24px rgba(15,31,28,0.06)',
    sheet: '0px -10px 30px rgba(10,40,34,0.10)',
    player: '0px -6px 24px rgba(15,31,28,0.08)',
    sticky: '0px 8px 16px -8px rgba(15,31,28,0.12)',
    toast: '0px 10px 30px rgba(0,0,0,0.2)',
    segment: '0px 1px 3px rgba(15,31,28,0.12)',
    knob: '0px 1px 3px rgba(0,0,0,0.2)',
    highlight: '0px 6px 16px rgba(0,0,0,0.12)',
    dial: '0px 2px 4px rgba(15,31,28,0.04), 0px 18px 40px rgba(15,31,28,0.10)',
    glow: '0px 0px 0px 8px rgba(31,169,113,0.14), 0px 0px 56px 8px rgba(31,169,113,0.38)',
  },
  dark: {
    card: undefined,
    sheet: undefined,
    player: undefined,
    sticky: undefined,
    toast: '0px 10px 30px rgba(0,0,0,0.2)',
    segment: undefined,
    knob: '0px 1px 3px rgba(0,0,0,0.2)',
    highlight: '0px 6px 16px rgba(0,0,0,0.12)',
    dial: '0px 0px 0px 1px #243733',
    glow: '0px 0px 0px 8px rgba(43,196,138,0.16), 0px 0px 64px 10px rgba(43,196,138,0.32)',
  },
};
