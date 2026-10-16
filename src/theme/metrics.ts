/** Spacing, radii and sizes from the design's shared stylesheet. */

export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  xs: 8,
  sm: 10,
  md: 12,
  lg: 14,
  card: 16,
  sheet: 28,
  pill: 999,
} as const;

export const size = {
  /** Minimum touch target. */
  touch: 44,
  buttonLg: 56,
  button: 52,
  buttonSm: 44,
  input: 52,
  search: 44,
  segment: 44,
  topBar: 52,
  tabBar: 84,
  listRow: 56,
  iconTile: 40,
  iconTileSm: 34,
  avatar: 40,
  icon: 24,
  iconSm: 18,
  /** Horizontal screen gutter. */
  gutter: 20,
} as const;

export const metrics = { space, radius, size } as const;
export type Metrics = typeof metrics;
