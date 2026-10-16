import type { TFunction } from 'i18next';

import { type Language, languageMeta, localizeDigits } from '@/i18n';
import type { Palette } from '@/theme';

import { clockParts } from './formatTime';
import type { DayTimes } from './prayerTimes';

const COLUMNS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

function escape(s: string): string {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c,
  );
}

/** Printable HTML for one month, coloured from the light palette. */
export function timetableHtml({
  title,
  subtitle,
  rows,
  todayIndex,
  t,
  language,
  timeZone,
  colors,
}: {
  title: string;
  subtitle: string;
  rows: { date: Date; times: DayTimes }[];
  todayIndex: number;
  t: TFunction;
  language: Language;
  timeZone: string | null;
  colors: Palette;
}): string {
  const weekdays = t('date.weekdaysShort', { returnObjects: true }) as string[];
  const dir = languageMeta[language].rtl ? 'rtl' : 'ltr';
  const head = [t('timetable.date'), ...COLUMNS.map((c) => t(`prayers.${c}`))]
    .map((h) => `<th>${escape(h)}</th>`)
    .join('');
  const body = rows
    .map((r, i) => {
      const cls = i === todayIndex ? 'today' : r.date.getDay() === 5 ? 'fri' : '';
      const cells = COLUMNS.map(
        (c) => `<td>${escape(clockParts(r.times[c], language, timeZone).time)}</td>`,
      ).join('');
      const day = escape(localizeDigits(r.date.getDate(), language));
      const weekday = escape(weekdays[r.date.getDay()] ?? '');
      return `<tr class="${cls}"><td><b>${day}</b> <span>${weekday}</span></td>${cells}</tr>`;
    })
    .join('');

  return `<!doctype html><html dir="${dir}"><head><meta charset="utf-8"><style>
    body{font-family:-apple-system,Roboto,"Noto Sans","Noto Sans Bengali","Noto Naskh Arabic",sans-serif;color:${colors.text};margin:24px}
    h1{font-size:20px;margin:0 0 4px}p{margin:0 0 16px;color:${colors.text2};font-size:12px}
    table{width:100%;border-collapse:collapse;font-size:12px;font-variant-numeric:tabular-nums}
    th{background:${colors.surface2};color:${colors.text2};font-size:11px;padding:8px 4px}
    td{text-align:center;padding:6px 4px;border-bottom:1px solid ${colors.border}}
    td span{color:${colors.text2};font-size:10px}
    tr.fri td span{color:${colors.link};font-weight:700}
    tr.today td{background:${colors.tint};font-weight:700}
  </style></head><body><h1>${escape(title)}</h1><p>${escape(subtitle)}</p>
  <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
}
