import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { getSurah } from './surahs';

export type Ayah = {
  /** Number within the surah, from 1. */
  number: number;
  /** Global number (1–6236), used for audio. */
  id: number;
  arabic: string;
  transliteration: string;
  en: string;
  bn: string;
  juz: number;
  page: number;
};

export type SurahContent = { surah: number; ayahs: Ayah[] };

/**
 * AlQuran.cloud editions: Tanzil Uthmani text, Saheeh International, Muhiuddin Khan
 * (Bangla) and the Latin transliteration.
 */
const EDITIONS = ['quran-uthmani', 'en.transliteration', 'en.sahih', 'bn.bengali'] as const;
const API = 'https://api.alquran.cloud/v1';
const CACHE_VERSION = 1;

type ApiAyah = { number: number; numberInSurah: number; text: string; juz: number; page: number };
type ApiResponse = { code: number; data: { edition: { identifier: string }; ayahs: ApiAyah[] }[] };

const memory = new Map<number, SurahContent>();

function cacheFile(surah: number): File | null {
  if (Platform.OS === 'web') return null;
  const dir = new Directory(Paths.document, 'quran', `text-v${CACHE_VERSION}`);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return new File(dir, `${surah}.json`);
}

/**
 * The Uthmani edition prefixes ayah 1 of every surah except Al-Fatihah and At-Tawbah
 * with the Bismillah; the reader shows it separately, so strip it here.
 */
function stripBismillah(text: string, surah: number, ayah: number): string {
  if (ayah !== 1 || surah === 1 || surah === 9) return text;
  const clean = text.replace(/^﻿/, '');
  const words = clean.split(' ');
  return words.length > 4 && words[0]?.startsWith('بِسْمِ') ? words.slice(4).join(' ') : clean;
}

async function download(surah: number): Promise<SurahContent> {
  const res = await fetch(`${API}/surah/${surah}/editions/${EDITIONS.join(',')}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as ApiResponse;
  const byEdition = new Map(json.data.map((d) => [d.edition.identifier, d.ayahs]));
  const uthmani = byEdition.get('quran-uthmani') ?? [];
  if (uthmani.length !== getSurah(surah).ayahCount) throw new Error('Incomplete surah');
  const at = (edition: string, i: number) => byEdition.get(edition)?.[i]?.text ?? '';
  return {
    surah,
    ayahs: uthmani.map((a, i) => ({
      number: a.numberInSurah,
      id: a.number,
      arabic: stripBismillah(a.text, surah, a.numberInSurah),
      transliteration: at('en.transliteration', i),
      en: at('en.sahih', i),
      bn: at('bn.bengali', i),
      juz: a.juz,
      page: a.page,
    })),
  };
}

/** Surah content from memory or the device cache only; null when not downloaded. */
export async function cachedSurah(surah: number): Promise<SurahContent | null> {
  const hit = memory.get(surah);
  if (hit) return hit;
  const file = cacheFile(surah);
  if (!file?.exists) return null;
  try {
    const cached = JSON.parse(await file.text()) as SurahContent;
    memory.set(surah, cached);
    return cached;
  } catch {
    return null;
  }
}

/** Surah text and translations: memory → device cache → network (then cached). */
export async function loadSurah(surah: number): Promise<SurahContent> {
  const cached = await cachedSurah(surah);
  if (cached) return cached;

  const content = await download(surah);
  memory.set(surah, content);
  try {
    cacheFile(surah)?.write(JSON.stringify(content));
  } catch {
    // Caching is best-effort.
  }
  return content;
}

export type AyahHit = { surah: number; ayah: number; text: string };
export type QuranSearchResult = { total: number; hits: AyahHit[] };

type SearchResponse = {
  code: number;
  data?: {
    count: number;
    matches: { text: string; numberInSurah: number; surah: { number: number } }[];
  };
};

/**
 * Full-text search through AlQuran.cloud in one edition (a translation, or the plain
 * Arabic text). The API answers 404 when nothing matches.
 */
export async function searchQuran(
  query: string,
  edition: 'en.sahih' | 'bn.bengali' | 'quran-simple-clean',
  signal?: AbortSignal,
): Promise<QuranSearchResult> {
  const res = await fetch(`${API}/search/${encodeURIComponent(query)}/all/${edition}`, { signal });
  if (res.status === 404) return { total: 0, hits: [] };
  if (!res.ok) throw new Error(`Quran search failed: ${res.status}`);
  const json = (await res.json()) as SearchResponse;
  if (json.code === 404 || !json.data) return { total: 0, hits: [] };
  return {
    total: json.data.count,
    hits: json.data.matches.map((m) => ({
      surah: m.surah.number,
      ayah: m.numberInSurah,
      text: m.text,
    })),
  };
}
