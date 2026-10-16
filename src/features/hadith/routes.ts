import type { BookId } from './data/types';

/** Which list a detail screen pages through: a topic, a downloaded chapter, or saved hadith. */
export type ListKey = `topic:${string}` | `chapter:${number}` | 'saved';

export const hadithRoutes = { list: '/hadith', books: '/hadith/books' } as const;

export function bookRoute(book: BookId) {
  return { pathname: '/hadith/book/[book]' as const, params: { book } };
}

export function chapterRoute(book: BookId, section: number) {
  return {
    pathname: '/hadith/chapter/[book]/[section]' as const,
    params: { book, section: String(section) },
  };
}

export function hadithRoute(book: BookId, n: number, list: ListKey) {
  return { pathname: '/hadith/[book]/[n]' as const, params: { book, n: String(n), list } };
}
