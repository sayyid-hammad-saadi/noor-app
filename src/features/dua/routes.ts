export const duaListRoute = '/dua' as const;

export function duaRoute(id: string) {
  return { pathname: '/dua/[id]' as const, params: { id } };
}
