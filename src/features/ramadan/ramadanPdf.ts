import { languageMeta, type Language } from '@/i18n';
import type { Palette } from '@/theme';

export type PdfRow = {
  day: string;
  date: string;
  sehri: string;
  iftar: string;
  fajr: string;
  maghrib: string;
  today: boolean;
  /** Section heading shown above this row (ashra name). */
  section?: string;
};

function escape(s: string): string {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c,
  );
}

/** Printable HTML for the Ramadan timetable, coloured from the light palette. */
export function ramadanTimetableHtml({
  title,
  subtitle,
  note,
  head,
  rows,
  language,
  colors,
}: {
  title: string;
  subtitle: string;
  note: string;
  head: [string, string, string, string, string];
  rows: PdfRow[];
  language: Language;
  colors: Palette;
}): string {
  const dir = languageMeta[language].rtl ? 'rtl' : 'ltr';
  const th = head.map((h) => `<th>${escape(h)}</th>`).join('');
  const body = rows
    .map((r) => {
      const section = r.section
        ? `<tr class="section"><td colspan="5">${escape(r.section)}</td></tr>`
        : '';
      const cells = [r.sehri, r.iftar, r.fajr, r.maghrib]
        .map((c, i) => `<td${i < 2 ? ' class="em"' : ''}>${escape(c)}</td>`)
        .join('');
      return `${section}<tr class="${r.today ? 'today' : ''}"><td><b>${escape(r.day)}</b> <span>${escape(r.date)}</span></td>${cells}</tr>`;
    })
    .join('');

  return `<!doctype html><html dir="${dir}"><head><meta charset="utf-8"><style>
    body{font-family:-apple-system,Roboto,"Noto Sans","Noto Sans Bengali","Noto Naskh Arabic",sans-serif;color:${colors.text};margin:24px}
    h1{font-size:20px;margin:0 0 4px}p{margin:0 0 16px;color:${colors.text2};font-size:12px}
    table{width:100%;border-collapse:collapse;font-size:12px;font-variant-numeric:tabular-nums}
    th{background:${colors.surface2};color:${colors.text2};font-size:11px;padding:8px 4px}
    td{text-align:center;padding:6px 4px;border-bottom:1px solid ${colors.border}}
    td:first-child{text-align:start}td span{color:${colors.text2};font-size:11px}
    td.em{font-weight:700}
    tr.section td{background:${colors.surface2};color:${colors.link};font-weight:700;text-align:start}
    tr.today td{background:${colors.tint};font-weight:700}
    .note{margin-top:12px}
  </style></head><body>
    <h1>${escape(title)}</h1><p>${escape(subtitle)}</p>
    <table><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table>
    <p class="note">${escape(note)}</p>
  </body></html>`;
}
