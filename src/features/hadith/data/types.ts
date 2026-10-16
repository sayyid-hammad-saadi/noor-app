import type { HadithGrade } from '@/components/ui';

export type BookId = 'bukhari' | 'muslim' | 'abudawud' | 'tirmidhi' | 'nasai' | 'ibnmajah';
export const BOOK_IDS: readonly BookId[] = [
  'bukhari',
  'muslim',
  'abudawud',
  'tirmidhi',
  'nasai',
  'ibnmajah',
];

export type Topic = 'iman' | 'salah' | 'sawm' | 'zakat' | 'hajj' | 'akhlaq';
export const TOPICS: readonly Topic[] = ['iman', 'salah', 'sawm', 'zakat', 'hajj', 'akhlaq'];

/** One hadith as stored: dataset texts plus [grader, grade] pairs. */
export type RawHadith = {
  topic?: Topic;
  book: BookId;
  /** Standard reference number (Abdul Baqi for Muslim). */
  ref: number | string;
  /** The dataset's own sequential number, used for fetching. */
  n: number;
  section: number;
  ar: string;
  en: string;
  bn: string;
  grades: [string, string][];
};

export type Hadith = RawHadith & {
  grade: HadithGrade;
  /** Words of the Prophet ﷺ, when the Arabic marks them with quotes. */
  matn: string | null;
  narrator: string | null;
  enBody: string;
  bnBody: string;
};
