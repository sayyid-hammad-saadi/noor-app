import { CURATED } from './curated.generated';
import { loadSection } from './hadithApi';
import { toHadith } from './text';
import type { BookId, Hadith, Topic } from './types';

let curated: Hadith[] | null = null;

/** The bundled, hand-picked hadith, parsed once. */
export function curatedHadith(): Hadith[] {
  curated ??= CURATED.map(toHadith);
  return curated;
}

export function curatedByTopic(topic: Topic | 'all'): Hadith[] {
  const all = curatedHadith();
  return topic === 'all' ? all : all.filter((h) => h.topic === topic);
}

export const hadithKey = (h: Pick<Hadith, 'book' | 'n'>) => `${h.book}:${h.n}`;

export async function chapterHadith(book: BookId, section: number): Promise<Hadith[]> {
  return (await loadSection(book, section)).map(toHadith);
}

/** Finds one hadith: bundled first, then its chapter (cached or downloaded). */
export async function findHadith(
  book: BookId,
  n: number,
  section: number | null,
): Promise<Hadith | null> {
  const local = curatedHadith().find((h) => h.book === book && h.n === n);
  if (local) return local;
  if (section === null) return null;
  return (await chapterHadith(book, section)).find((h) => h.n === n) ?? null;
}
