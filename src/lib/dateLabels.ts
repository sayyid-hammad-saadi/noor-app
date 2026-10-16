import type { TFunction } from 'i18next';

import { type Language, localizeDigits } from '@/i18n';
import { BANGLA_MONTHS, HIJRI_MONTHS_AR, toBangla, toHijri } from '@/lib/calendars';

/** "٤ جمادى الأولى ١٤٤٨ هـ": the Hijri date is always shown in Arabic. */
export function hijriLabel(date: Date): string {
  const h = toHijri(date);
  const month = HIJRI_MONTHS_AR[h.month - 1] ?? '';
  return `${localizeDigits(h.day, 'ar')} ${month} ${localizeDigits(h.year, 'ar')} هـ`;
}

/** "৩১ আশ্বিন ১৪৩৩": the Bangla date is always shown in Bangla. */
export function banglaLabel(date: Date): string {
  const b = toBangla(date);
  const month = BANGLA_MONTHS[b.month - 1] ?? '';
  return `${localizeDigits(b.day, 'bn')} ${month} ${localizeDigits(b.year, 'bn')}`;
}

/** "Fri, 16 Oct 2026" in the UI language. */
export function gregorianLabel(date: Date, t: TFunction, language: Language): string {
  const weekdays = t('date.weekdaysShort', { returnObjects: true }) as string[];
  const months = t('date.monthsShort', { returnObjects: true }) as string[];
  return t('date.short', {
    weekday: weekdays[date.getDay()] ?? '',
    day: localizeDigits(date.getDate(), language),
    month: months[date.getMonth()] ?? '',
    year: localizeDigits(date.getFullYear(), language),
  });
}

export function weekdayName(date: Date, t: TFunction): string {
  const weekdays = t('date.weekdays', { returnObjects: true }) as string[];
  return weekdays[date.getDay()] ?? '';
}

/** Local calendar day, e.g. "2026-10-16"; used as a storage key. */
export function dayKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

/** "4 Jumada al-Ula 1448" with month names and digits in the UI language. */
export function hijriLocalized(date: Date, t: TFunction, language: Language): string {
  const h = toHijri(date);
  const months = t('date.hijriMonths', { returnObjects: true }) as string[];
  return t('date.hijri', {
    day: localizeDigits(h.day, language),
    month: months[h.month - 1] ?? '',
    year: localizeDigits(h.year, language),
  });
}

/** Hijri month name(s) covering a Gregorian month: "Rabi al-Thani – Jumada al-Ula 1448". */
export function hijriSpan(year: number, month: number, t: TFunction, language: Language): string {
  const months = t('date.hijriMonths', { returnObjects: true }) as string[];
  const first = toHijri(new Date(year, month, 1));
  const last = toHijri(new Date(year, month + 1, 0));
  const name = (m: number) => months[m - 1] ?? '';
  if (first.month === last.month)
    return `${name(first.month)} ${localizeDigits(first.year, language)}`;
  const start =
    first.year === last.year
      ? name(first.month)
      : `${name(first.month)} ${localizeDigits(first.year, language)}`;
  return `${start} – ${name(last.month)} ${localizeDigits(last.year, language)}`;
}

/** "Fri, 16 Oct" in the UI language. */
export function dayMonthLabel(date: Date, t: TFunction, language: Language): string {
  const weekdays = t('date.weekdaysShort', { returnObjects: true }) as string[];
  const months = t('date.monthsShort', { returnObjects: true }) as string[];
  return t('date.dayMonth', {
    weekday: weekdays[date.getDay()] ?? '',
    day: localizeDigits(date.getDate(), language),
    month: months[date.getMonth()] ?? '',
  });
}

/** "October 2026" in the UI language. */
export function monthYearLabel(
  year: number,
  month: number,
  t: TFunction,
  language: Language,
): string {
  const months = t('date.months', { returnObjects: true }) as string[];
  return t('date.monthYear', { month: months[month] ?? '', year: localizeDigits(year, language) });
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
