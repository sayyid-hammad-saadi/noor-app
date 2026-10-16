import { useCallback, useEffect, useState } from 'react';

import { sectionOf } from './data/books';
import {
  chapterHadith,
  curatedByTopic,
  curatedHadith,
  findHadith,
  hadithKey,
} from './data/collection';
import { BOOK_IDS, type BookId, type Hadith, type Topic } from './data/types';
import { hadithBookmarks } from './library';
import type { ListKey } from './routes';

export type ListState =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; items: Hadith[] };

/** Saved keys resolved to hadith (bundled ones instantly, others from their chapters). */
async function savedHadith(keys: string[]): Promise<Hadith[]> {
  const out: Hadith[] = [];
  for (const key of keys) {
    const [book, n] = key.split(':') as [BookId, string];
    if (!BOOK_IDS.includes(book)) continue;
    const h = await findHadith(book, Number(n), sectionOf(book, Number(n))?.n ?? null).catch(
      () => null,
    );
    if (h) out.push(h);
  }
  return out;
}

/**
 * Loads the list a screen shows. Topic lists are bundled; chapters and saved items
 * may need the network. State is keyed so a new list never shows the old one.
 */
export function useHadithList(book: BookId | null, list: ListKey) {
  const key = `${book}:${list}`;
  const [entry, setEntry] = useState<{ key: string; attempt: number; state: ListState }>(() => ({
    key,
    attempt: 0,
    state: initial(list),
  }));
  const [attempt, setAttempt] = useState(0);
  const current = entry.key === key && entry.attempt === attempt ? entry.state : initial(list);

  useEffect(() => {
    if (list.startsWith('topic:')) return;
    let cancelled = false;
    const run =
      list === 'saved'
        ? savedHadith(hadithBookmarks.get())
        : chapterHadith(book ?? 'bukhari', Number(list.slice('chapter:'.length)));
    run.then(
      (items) => !cancelled && setEntry({ key, attempt, state: { status: 'ready', items } }),
      () => !cancelled && setEntry({ key, attempt, state: { status: 'error' } }),
    );
    return () => {
      cancelled = true;
    };
  }, [key, attempt, book, list]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { state: current, retry };
}

function initial(list: ListKey): ListState {
  if (list.startsWith('topic:')) {
    return { status: 'ready', items: curatedByTopic(list.slice('topic:'.length) as Topic | 'all') };
  }
  return { status: 'loading' };
}

export { curatedHadith, hadithKey };
