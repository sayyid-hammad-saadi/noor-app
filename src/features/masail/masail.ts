import type { Source } from '@/lib/sources';

/**
 * Starter set of everyday fiqh questions. Text lives in i18n under
 * masail.items.<id>: q (question), and either `shared` (the four schools agree)
 * or one answer per school. All answers need review by a qualified scholar.
 */
export type Madhhab = 'hanafi' | 'shafii' | 'maliki' | 'hanbali';
export const MADHHABS: readonly Madhhab[] = ['hanafi', 'shafii', 'maliki', 'hanbali'];

export type Category =
  'taharah' | 'salah' | 'sawm' | 'zakat' | 'hajj' | 'family' | 'money' | 'daily';
export const CATEGORIES: readonly Category[] = [
  'taharah',
  'salah',
  'sawm',
  'zakat',
  'hajj',
  'family',
  'money',
  'daily',
];

/** Standard reference works of each school. */
export type FiqhBook = 'hidayah' | 'majmu' | 'mudawwanah' | 'mughni';

export type Reference = Source | { book: FiqhBook };

export type Masalah = {
  id: string;
  category: Category;
  /** Sub-topic for the filter chips (i18n masail.tags.<tag>). */
  tag: string;
  /** shared: one answer for all four schools; split: one per school. */
  schools: 'shared' | 'split';
  refs: Reference[];
};

const H: Reference = { book: 'hidayah' };
const ALL_BOOKS: Reference[] = [
  { book: 'hidayah' },
  { book: 'majmu' },
  { book: 'mudawwanah' },
  { book: 'mughni' },
];

export const MASAIL: readonly Masalah[] = [
  // Taharah
  { id: 'bleeding', category: 'taharah', tag: 'wudu', schools: 'split', refs: ALL_BOOKS },
  {
    id: 'khuff',
    category: 'taharah',
    tag: 'wudu',
    schools: 'split',
    refs: [{ ref: 'muslim:276', grade: 'sahih' }, H, { book: 'mudawwanah' }],
  },
  {
    id: 'touchQuran',
    category: 'taharah',
    tag: 'quran',
    schools: 'shared',
    refs: [{ ref: 'quran:56:79' }, ...ALL_BOOKS],
  },
  // Salah
  {
    id: 'combine',
    category: 'salah',
    tag: 'travel',
    schools: 'split',
    refs: [{ ref: 'quran:4:103' }, { ref: 'bukhari:1107', grade: 'sahih' }, H],
  },
  {
    id: 'witr',
    category: 'salah',
    tag: 'witr',
    schools: 'split',
    refs: [{ ref: 'bukhari:990', grade: 'sahih' }, ...ALL_BOOKS],
  },
  {
    id: 'lateJoin',
    category: 'salah',
    tag: 'jamaah',
    schools: 'shared',
    refs: [{ ref: 'bukhari:636', grade: 'sahih' }, H],
  },
  // Sawm
  {
    id: 'forgetEat',
    category: 'sawm',
    tag: 'breaking',
    schools: 'split',
    refs: [{ ref: 'bukhari:1933', grade: 'sahih' }, { book: 'mudawwanah' }],
  },
  {
    id: 'miswak',
    category: 'sawm',
    tag: 'breaking',
    schools: 'split',
    refs: [{ ref: 'bukhari:887', grade: 'sahih' }, ...ALL_BOOKS],
  },
  {
    id: 'exempt',
    category: 'sawm',
    tag: 'exemptions',
    schools: 'shared',
    refs: [{ ref: 'quran:2:184' }, H],
  },
  // Zakat
  {
    id: 'jewellery',
    category: 'zakat',
    tag: 'gold',
    schools: 'split',
    refs: [{ ref: 'abuDawud:1563', grade: 'hasan' }, ...ALL_BOOKS],
  },
  {
    id: 'family',
    category: 'zakat',
    tag: 'recipients',
    schools: 'shared',
    refs: [{ ref: 'quran:9:60' }, H, { book: 'mughni' }],
  },
  {
    id: 'fitr',
    category: 'zakat',
    tag: 'fitr',
    schools: 'split',
    refs: [{ ref: 'bukhari:1503', grade: 'sahih' }, ...ALL_BOOKS],
  },
  // Hajj
  {
    id: 'immediate',
    category: 'hajj',
    tag: 'obligation',
    schools: 'split',
    refs: [{ ref: 'quran:3:97' }, ...ALL_BOOKS],
  },
  {
    id: 'mahram',
    category: 'hajj',
    tag: 'women',
    schools: 'split',
    refs: [{ ref: 'bukhari:1862', grade: 'sahih' }, ...ALL_BOOKS],
  },
  {
    id: 'umrah',
    category: 'hajj',
    tag: 'obligation',
    schools: 'split',
    refs: [{ ref: 'quran:2:196' }, ...ALL_BOOKS],
  },
  // Family
  {
    id: 'wali',
    category: 'family',
    tag: 'marriage',
    schools: 'split',
    refs: [{ ref: 'abuDawud:2085', grade: 'sahih' }, ...ALL_BOOKS],
  },
  {
    id: 'mahr',
    category: 'family',
    tag: 'marriage',
    schools: 'split',
    refs: [{ ref: 'quran:4:4' }, ...ALL_BOOKS],
  },
  {
    id: 'tripleTalaq',
    category: 'family',
    tag: 'divorce',
    schools: 'shared',
    refs: [{ ref: 'quran:2:230' }, ...ALL_BOOKS],
  },
  // Money
  {
    id: 'interest',
    category: 'money',
    tag: 'riba',
    schools: 'shared',
    refs: [{ ref: 'quran:2:275' }, { ref: 'muslim:1598', grade: 'sahih' }],
  },
  {
    id: 'instalments',
    category: 'money',
    tag: 'trade',
    schools: 'shared',
    refs: [{ ref: 'quran:2:275' }, { book: 'mughni' }],
  },
  {
    id: 'notOwned',
    category: 'money',
    tag: 'trade',
    schools: 'shared',
    refs: [{ ref: 'abuDawud:3503', grade: 'sahih' }, { book: 'mughni' }],
  },
  // Daily life
  {
    id: 'seafood',
    category: 'daily',
    tag: 'food',
    schools: 'split',
    refs: [{ ref: 'quran:5:96' }, { ref: 'abuDawud:83', grade: 'sahih' }, ...ALL_BOOKS],
  },
  {
    id: 'ahlKitab',
    category: 'daily',
    tag: 'food',
    schools: 'shared',
    refs: [{ ref: 'quran:5:5' }, H, { book: 'mughni' }],
  },
  { id: 'awrah', category: 'daily', tag: 'dress', schools: 'split', refs: ALL_BOOKS },
];

export const POPULAR: readonly string[] = ['combine', 'forgetEat', 'jewellery'];

export function getMasalah(id: string): Masalah | undefined {
  return MASAIL.find((m) => m.id === id);
}

export function byCategory(category: Category): Masalah[] {
  return MASAIL.filter((m) => m.category === category);
}
