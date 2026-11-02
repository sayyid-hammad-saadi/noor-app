/**
 * Hijri and Bangla (Bangabda) calendar conversions. Pure functions on local
 * calendar dates; no Intl dependency, so results are identical on every device.
 */

export type DateParts = { year: number; month: number; day: number };

/** Julian Day Number for a Gregorian date (month 1–12). */
function julianDay(year: number, month: number, day: number): number {
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000) + 2440588;
}

let userOffset = 0;

/** The user's Hijri date offset (Settings), applied by every conversion below. */
export function setHijriOffset(days: number) {
  userOffset = days;
}

/**
 * Tabular (civil) Islamic calendar. Bangladesh usually follows local moon sighting,
 * which tends to match this (and lag Umm al-Qura by a day); the user can shift it by
 * ±1–2 days in Settings.
 */
export function toHijri(date: Date, adjustDays = userOffset): DateParts {
  const jd = julianDay(date.getFullYear(), date.getMonth() + 1, date.getDate()) + adjustDays;
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}

export const HIJRI_MONTHS_AR = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
] as const;

export const BANGLA_MONTHS = [
  'বৈশাখ',
  'জ্যৈষ্ঠ',
  'আষাঢ়',
  'শ্রাবণ',
  'ভাদ্র',
  'আশ্বিন',
  'কার্তিক',
  'অগ্রহায়ণ',
  'পৌষ',
  'মাঘ',
  'ফাল্গুন',
  'চৈত্র',
] as const;

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Bangladesh's revised Bangla calendar (2019): 1 Boishakh is 14 April; Boishakh–Ashwin
 * have 31 days, Kartik–Magh and Chaitra 30, Falgun 29 (30 when the Gregorian year it
 * falls in is a leap year).
 */
export function toBangla(date: Date): DateParts {
  const y = date.getFullYear();
  const beforeNewYear =
    date.getMonth() + 1 < 4 || (date.getMonth() + 1 === 4 && date.getDate() < 14);
  const startYear = beforeNewYear ? y - 1 : y;
  let remaining = julianDay(y, date.getMonth() + 1, date.getDate()) - julianDay(startYear, 4, 14);
  const lengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, isLeapYear(startYear + 1) ? 30 : 29, 30];
  let month = 0;
  while (month < 11 && remaining >= (lengths[month] ?? 30)) {
    remaining -= lengths[month] ?? 30;
    month += 1;
  }
  return { year: startYear - 593, month: month + 1, day: remaining + 1 };
}
