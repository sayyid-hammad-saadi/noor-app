export function nameRoute(id: string) {
  return { pathname: '/names/[id]' as const, params: { id } };
}
