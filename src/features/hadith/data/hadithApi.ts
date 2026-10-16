import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import type { BookId, RawHadith } from './types';

const CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';
const MIRROR = 'https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions';

type Entry = {
  hadithnumber: number;
  arabicnumber: number | string;
  text: string;
  grades?: { name: string; grade: string }[];
};
type SectionFile = { hadiths: Entry[] };

const memory = new Map<string, RawHadith[]>();

function cacheFile(book: BookId, section: number): File | null {
  if (Platform.OS === 'web') return null;
  const dir = new Directory(Paths.document, 'hadith', 'v1', book);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return new File(dir, `${section}.json`);
}

async function fetchJson(path: string): Promise<SectionFile> {
  for (const base of [CDN, MIRROR]) {
    try {
      const res = await fetch(`${base}/${path}`);
      if (res.ok) return (await res.json()) as SectionFile;
    } catch {
      // Try the mirror.
    }
  }
  throw new Error(`Couldn't load ${path}`);
}

/**
 * All hadith of one chapter in Arabic, English and Bangla. Memory, then the
 * on-device cache, then the network (jsDelivr with a GitHub mirror).
 */
export async function loadSection(book: BookId, section: number): Promise<RawHadith[]> {
  const key = `${book}:${section}`;
  const hit = memory.get(key);
  if (hit) return hit;

  const file = cacheFile(book, section);
  if (file?.exists) {
    try {
      const cached = JSON.parse(await file.text()) as RawHadith[];
      memory.set(key, cached);
      return cached;
    } catch {
      // Re-download a corrupt cache.
    }
  }

  const path = (lang: string) => `${lang}-${book}/sections/${section}.json`;
  const [ar, en, bn] = await Promise.all([
    fetchJson(path('ara')),
    fetchJson(path('eng')),
    fetchJson(path('ben')),
  ]);
  const byNumber = (f: SectionFile) => new Map(f.hadiths.map((h) => [h.hadithnumber, h]));
  const enMap = byNumber(en);
  const bnMap = byNumber(bn);
  const list: RawHadith[] = ar.hadiths
    .filter((h) => h.text.trim())
    .map((h) => {
      const e = enMap.get(h.hadithnumber);
      return {
        book,
        ref: book === 'muslim' ? h.arabicnumber : h.hadithnumber,
        n: h.hadithnumber,
        section,
        ar: h.text,
        en: e?.text ?? '',
        bn: bnMap.get(h.hadithnumber)?.text ?? '',
        grades: (e?.grades ?? []).map((g) => [g.name, g.grade] as [string, string]),
      };
    });
  memory.set(key, list);
  file?.write(JSON.stringify(list));
  return list;
}
