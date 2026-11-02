import { stripTashkeel, toAsciiDigits } from '@/features/quran/data/digits';

/** Lower-cases, drops Arabic diacritics and normalises digits so typed queries match. */
export function normalize(text: string): string {
  return stripTashkeel(toAsciiDigits(text.toLowerCase()));
}

/** True when any of the texts contains the (already normalised) query. */
export function matchesAny(query: string, texts: readonly string[]): boolean {
  return texts.some((s) => normalize(s).includes(query));
}

/**
 * A short excerpt around the first match, split so the match can be highlighted.
 * Searches the raw text case-insensitively; returns the start of the text when the
 * match is only found after normalising (diacritics, digits).
 */
export function snippet(
  text: string,
  query: string,
  radius = 60,
): { before: string; match: string; after: string } {
  const at = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (at < 0) {
    const cut = text.length > radius * 2 ? `${text.slice(0, radius * 2).trimEnd()}…` : text;
    return { before: cut, match: '', after: '' };
  }
  const start = Math.max(0, at - radius);
  const end = Math.min(text.length, at + query.length + radius);
  return {
    before: (start > 0 ? '…' : '') + text.slice(start, at).trimStart(),
    match: text.slice(at, at + query.length),
    after: text.slice(at + query.length, end).trimEnd() + (end < text.length ? '…' : ''),
  };
}
