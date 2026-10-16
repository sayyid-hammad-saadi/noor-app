export const zakatRoutes = {
  nisab: '/zakat',
  assets: '/zakat/assets',
  liabilities: '/zakat/liabilities',
  result: '/zakat/result',
  history: '/zakat/history',
} as const;

export function reportRoute(year: number) {
  return { pathname: '/zakat/report' as const, params: { year: String(year) } };
}
