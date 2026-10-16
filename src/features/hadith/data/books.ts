import { BOOK_META, type SectionRow } from './books.generated';
import type { BookId } from './types';

export type Section = { n: number; name: string; first: number; last: number; count: number };

export function bookTotal(book: BookId): number {
  return BOOK_META[book].total;
}

export function sections(book: BookId): Section[] {
  return BOOK_META[book].sections.map(([n, name, first, last]: SectionRow) => ({
    n,
    name,
    first,
    last,
    count: Math.floor(last) - Math.ceil(first) + 1,
  }));
}

export function sectionOf(book: BookId, n: number): Section | null {
  return sections(book).find((s) => n >= s.first && n <= s.last) ?? null;
}

export const TOTAL_HADITH = (Object.keys(BOOK_META) as BookId[]).reduce(
  (sum, b) => sum + BOOK_META[b].total,
  0,
);
