import type { Source } from '@/lib/sources';

/**
 * When an added practice shows on Home's Today's Amol card.
 * daily: every day of the month · monThu: Mondays and Thursdays · days: these Hijri days.
 * null: guidance only, nothing to tick off.
 */
export type Schedule =
  { kind: 'daily' } | { kind: 'monThu' } | { kind: 'days'; days: number[] } | null;

export type MonthPractice = {
  /** Unique id; month-specific ones are prefixed with the month key. i18n: calendar.practices.<id>. */
  id: PracticeId;
  source: Source;
  schedule: Schedule;
  /** Arabic text shown with the practice (a dua). */
  arabic?: string;
};

export type MonthContent = {
  sacred: boolean;
  /** Arabic of the Quran verse or hadith quoted in the fazilat card. */
  arabic?: string;
  /** i18n: calendar.months.<key>.fazilat; sources listed under it. */
  sources: Source[];
  practices: MonthPractice[];
};

export const MONTH_KEYS = [
  'muharram',
  'safar',
  'rabiAwwal',
  'rabiAkhir',
  'jumadaUla',
  'jumadaAkhirah',
  'rajab',
  'shaban',
  'ramadan',
  'shawwal',
  'dhulQadah',
  'dhulHijjah',
] as const;
export type MonthKey = (typeof MONTH_KEYS)[number];

export type PracticeId =
  | 'monThu'
  | 'bid'
  | 'guard'
  | 'muharramFast'
  | 'ashura'
  | 'tasua'
  | 'mondayBirth'
  | 'salawat'
  | 'rajabDua'
  | 'sacredFasts'
  | 'shabanFast'
  | 'barat'
  | 'makeUp'
  | 'ramadanFast'
  | 'taraweeh'
  | 'qadr'
  | 'shawwalSix'
  | 'fitrah'
  | 'eidDates'
  | 'tenDays'
  | 'arafah'
  | 'udhiyah'
  | 'tashreeq';

const MON_THU: MonthPractice = {
  id: 'monThu',
  source: { ref: 'tirmidhi:747', grade: 'sahih' },
  schedule: { kind: 'monThu' },
};
const BID: MonthPractice = {
  id: 'bid',
  source: { ref: 'tirmidhi:761', grade: 'hasan' },
  schedule: { kind: 'days', days: [13, 14, 15] },
};
const GUARD: MonthPractice = {
  id: 'guard',
  source: { ref: 'bukhari:4662', grade: 'sahih' },
  schedule: { kind: 'daily' },
};
const SACRED_VERSE = 'مِنْهَآ أَرْبَعَةٌ حُرُمٌ';
const SACRED_SOURCES: Source[] = [{ ref: 'quran:9:36' }, { ref: 'bukhari:4662', grade: 'sahih' }];

/** Fazilat and practices for each Hijri month (index 0 = Muharram). */
export const MONTHS: Record<MonthKey, MonthContent> = {
  muharram: {
    sacred: true,
    arabic: SACRED_VERSE,
    sources: [...SACRED_SOURCES, { ref: 'muslim:1163', grade: 'sahih' }],
    practices: [
      {
        id: 'ashura',
        source: { ref: 'muslim:1162', grade: 'sahih' },
        schedule: { kind: 'days', days: [10] },
      },
      {
        id: 'tasua',
        source: { ref: 'muslim:1134', grade: 'sahih' },
        schedule: { kind: 'days', days: [9] },
      },
      { id: 'muharramFast', source: { ref: 'muslim:1163', grade: 'sahih' }, schedule: null },
      GUARD,
      MON_THU,
      BID,
    ],
  },
  safar: {
    sacred: false,
    sources: [{ ref: 'bukhari:5757', grade: 'sahih' }],
    practices: [MON_THU, BID],
  },
  rabiAwwal: {
    sacred: false,
    sources: [{ ref: 'muslim:1162', grade: 'sahih' }],
    practices: [
      {
        id: 'mondayBirth',
        source: { ref: 'muslim:1162', grade: 'sahih' },
        schedule: { kind: 'monThu' },
      },
      { id: 'salawat', source: { ref: 'muslim:408', grade: 'sahih' }, schedule: { kind: 'daily' } },
      BID,
    ],
  },
  rabiAkhir: { sacred: false, sources: [], practices: [MON_THU, BID] },
  jumadaUla: { sacred: false, sources: [], practices: [MON_THU, BID] },
  jumadaAkhirah: { sacred: false, sources: [], practices: [MON_THU, BID] },
  rajab: {
    sacred: true,
    arabic: SACRED_VERSE,
    sources: SACRED_SOURCES,
    practices: [
      GUARD,
      MON_THU,
      BID,
      {
        id: 'rajabDua',
        source: { ref: 'ahmad:2346', grade: 'daif' },
        schedule: { kind: 'daily' },
        arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِي رَجَبٍ وَشَعْبَانَ وَبَلِّغْنَا رَمَضَانَ',
      },
      { id: 'sacredFasts', source: { ref: 'abuDawud:2428', grade: 'daif' }, schedule: null },
    ],
  },
  shaban: {
    sacred: false,
    sources: [
      { ref: 'bukhari:1969', grade: 'sahih' },
      { ref: 'nasai:2357', grade: 'hasan' },
    ],
    practices: [
      { id: 'shabanFast', source: { ref: 'bukhari:1969', grade: 'sahih' }, schedule: null },
      {
        id: 'barat',
        source: { ref: 'ibnMajah:1390', grade: 'hasan' },
        schedule: { kind: 'days', days: [14] },
      },
      { id: 'makeUp', source: { ref: 'bukhari:1950', grade: 'sahih' }, schedule: null },
      MON_THU,
      BID,
    ],
  },
  ramadan: {
    sacred: false,
    arabic: 'شَهْرُ رَمَضَانَ ٱلَّذِىٓ أُنزِلَ فِيهِ ٱلْقُرْءَانُ',
    sources: [{ ref: 'quran:2:185' }, { ref: 'bukhari:38', grade: 'sahih' }],
    practices: [
      {
        id: 'ramadanFast',
        source: { ref: 'bukhari:38', grade: 'sahih' },
        schedule: { kind: 'daily' },
      },
      {
        id: 'taraweeh',
        source: { ref: 'bukhari:37', grade: 'sahih' },
        schedule: { kind: 'daily' },
      },
      {
        id: 'qadr',
        source: { ref: 'bukhari:2017', grade: 'sahih' },
        schedule: { kind: 'days', days: [20, 22, 24, 26, 28] },
      },
    ],
  },
  shawwal: {
    sacred: false,
    sources: [{ ref: 'muslim:1164', grade: 'sahih' }],
    practices: [
      { id: 'shawwalSix', source: { ref: 'muslim:1164', grade: 'sahih' }, schedule: null },
      {
        id: 'fitrah',
        source: { ref: 'bukhari:1503', grade: 'sahih' },
        schedule: { kind: 'days', days: [1] },
      },
      {
        id: 'eidDates',
        source: { ref: 'bukhari:953', grade: 'sahih' },
        schedule: { kind: 'days', days: [1] },
      },
      MON_THU,
      BID,
    ],
  },
  dhulQadah: {
    sacred: true,
    arabic: SACRED_VERSE,
    sources: [...SACRED_SOURCES, { ref: 'bukhari:1778', grade: 'sahih' }],
    practices: [GUARD, MON_THU, BID],
  },
  dhulHijjah: {
    sacred: true,
    sources: [{ ref: 'bukhari:969', grade: 'sahih' }],
    practices: [
      {
        id: 'tenDays',
        source: { ref: 'bukhari:969', grade: 'sahih' },
        schedule: { kind: 'days', days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
      },
      {
        id: 'arafah',
        source: { ref: 'muslim:1162', grade: 'sahih' },
        schedule: { kind: 'days', days: [9] },
      },
      {
        id: 'udhiyah',
        source: { ref: 'bukhari:5558', grade: 'sahih' },
        schedule: { kind: 'days', days: [10] },
      },
      { id: 'tashreeq', source: { ref: 'muslim:1141', grade: 'sahih' }, schedule: null },
      MON_THU,
    ],
  },
};

export function monthKey(month: number): MonthKey {
  return MONTH_KEYS[(month - 1 + 12) % 12] ?? 'muharram';
}
