import type { HadithGrade } from '@/components/ui';

import type { BookId, Hadith, RawHadith } from './types';

/**
 * Collapses the many grade wordings in the dataset into the app's three chips.
 * Al-Albani's grade is preferred when given. Bukhari and Muslim are sahih by consensus.
 */
export function gradeOf(book: BookId, grades: [string, string][]): HadithGrade {
  if (book === 'bukhari' || book === 'muslim') return 'sahih';
  const pick = grades.find(([name]) => /albani/i.test(name)) ?? grades[0];
  if (!pick) return 'hasan';
  const g = pick[1].toLowerCase().replace(/[^a-z ]/g, '');
  if (g.startsWith('sahih') || g.startsWith('hasan sahih') || g.includes('isnaad sahih'))
    return 'sahih';
  if (g.startsWith('hasan') || g.includes('isnaad hasan')) return 'hasan';
  return 'daif';
}

/** The quoted words of the Prophet ﷺ in the Arabic, if marked. */
function extractMatn(ar: string): string | null {
  const clean = ar.replace(/[\u200f\u200e]/g, '');
  const first = clean.indexOf('"');
  if (first < 0) return null;
  const last = clean.lastIndexOf('"');
  // Some narrations open the quote and never close it.
  const inner = clean.slice(first + 1, last > first ? last : undefined).trim();
  return inner.length > 8 ? inner : null;
}

/** "Narrated Anas: The Prophet said…" → narrator "Anas". */
function splitNarrator(en: string): { narrator: string | null; body: string } {
  const m = /^\s*Narrated\s+([^:]{2,80}):\s*/.exec(en);
  return m
    ? { narrator: m[1]!.trim(), body: en.slice(m[0].length) }
    : { narrator: null, body: en.trim() };
}

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

/**
 * Removes the chapter heading some Bangla editions prepend (it ends right before the
 * hadith's own number, e.g. "৬৪৫. ") and the trailing publisher notes.
 */
function cleanBangla(bn: string, n: number): string {
  let s = bn.replace(/^[\s।.]+/, '');
  const marker = `${String(Math.floor(n)).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)] ?? d)}. `;
  const at = s.indexOf(marker);
  if (at >= 0) s = s.slice(at + marker.length);
  return s
    .replace(/(\s*\(\s*(আধুনিক প্রকাশনী|ইসলামিক ফাউন্ডেশন|ইসলামিক সেন্টার)[^)]*\))+\s*$/, '')
    .trim();
}

export function toHadith(raw: RawHadith): Hadith {
  const { narrator, body } = splitNarrator(raw.en);
  return {
    ...raw,
    grade: gradeOf(raw.book, raw.grades),
    matn: extractMatn(raw.ar),
    narrator,
    enBody: body,
    bnBody: cleanBangla(raw.bn, raw.n),
  };
}
