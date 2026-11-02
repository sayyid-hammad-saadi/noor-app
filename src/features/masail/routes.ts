import type { Category } from './masail';

export function masailCategoryRoute(category: Category) {
  return { pathname: '/masail/[category]' as const, params: { category } };
}

export function masalahRoute(id: string) {
  return { pathname: '/masail/q/[id]' as const, params: { id } };
}
