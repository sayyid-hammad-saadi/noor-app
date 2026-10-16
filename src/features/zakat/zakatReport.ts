import type { TFunction } from 'i18next';

import { formatNumber, type Language, languageMeta } from '@/i18n';
import { hijriLocalized } from '@/lib/dateLabels';
import type { Palette } from '@/theme';

import { formatMoney } from './money';
import { ASSET_KEYS, GRAM_ASSETS, LIABILITY_KEYS, NISAB_GRAMS } from './zakatCalc';
import type { ZakatRecord } from './zakatStore';

export type ReportLine = { label: string; value: string };

/** Everything the report shows, already formatted; used by the preview and the PDF. */
export type ReportModel = {
  heading: string;
  ref: string;
  meta: ReportLine[];
  assetsTitle: string;
  assets: ReportLine[];
  totalAssets: ReportLine;
  liabilitiesTitle: string;
  liabilities: ReportLine[];
  totalLiabilities: ReportLine;
  net: ReportLine;
  above: ReportLine & { yes: boolean };
  payable: ReportLine;
  footer: string;
  page: string;
};

function longDate(date: Date, t: TFunction, language: Language): string {
  const months = t('date.months', { returnObjects: true }) as string[];
  return `${formatNumber(date.getDate(), language)} ${months[date.getMonth()] ?? ''} ${formatNumber(date.getFullYear(), language, { grouping: false })}`;
}

export function reportModel(record: ZakatRecord, t: TFunction, language: Language): ReportModel {
  const { input, result } = record;
  const money = (v: number) => formatMoney(v, language, input.currency);
  const grams = (g: number) => formatNumber(g, language);
  const created = new Date(record.createdAt);
  const mm = String(created.getMonth() + 1).padStart(2, '0');
  const dd = String(created.getDate()).padStart(2, '0');
  const metal = t(`zakat.metals.${input.basis}`);

  return {
    heading: t('zakat.report.heading'),
    ref: t('zakat.report.ref', { ref: `NZ-${record.year}-${mm}${dd}` }),
    meta: [
      {
        label: t('zakat.report.date'),
        value: t('zakat.report.dateValue', {
          date: longDate(created, t, language),
          hijri: hijriLocalized(created, t, language),
        }),
      },
      {
        label: t('zakat.report.basis'),
        value: t('zakat.report.basisValue', {
          metal,
          grams: grams(NISAB_GRAMS[input.basis]),
          rate: money(input.rates[input.basis]),
          nisab: money(result.nisab),
        }),
      },
    ],
    assetsTitle: t('zakat.report.assets'),
    assets: ASSET_KEYS.map((k) => ({
      label:
        k === 'cash'
          ? t('zakat.report.cash')
          : GRAM_ASSETS.includes(k) && input.assets[k] > 0
            ? t('zakat.report.gramLine', {
                metal: t(`zakat.assets.items.${k}.label`),
                grams: grams(input.assets[k]),
                rate: money(input.rates[k as 'gold' | 'silver']),
              })
            : t(`zakat.assets.items.${k}.label`),
      value: money(result.assetValues[k]),
    })),
    totalAssets: { label: t('zakat.result.totalAssets'), value: money(result.totalAssets) },
    liabilitiesTitle: t('zakat.report.liabilities'),
    liabilities: LIABILITY_KEYS.map((k) => ({
      label: t(`zakat.liabilities.items.${k}.label`),
      value: money(input.liabilities[k]),
    })),
    totalLiabilities: {
      label: t('zakat.liabilities.total'),
      value: money(result.totalLiabilities),
    },
    net: { label: t('zakat.result.net'), value: money(result.net) },
    above: {
      label: t('zakat.report.aboveNisab', { nisab: money(result.nisab) }),
      value: t(result.due ? 'zakat.report.yes' : 'zakat.report.no'),
      yes: result.due,
    },
    payable: { label: t('zakat.report.payableLine'), value: money(result.zakat) },
    footer: t('zakat.report.footer'),
    page: t('zakat.report.page'),
  };
}

function escape(s: string): string {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c,
  );
}

/** A4 HTML for expo-print, coloured from the light palette. */
export function reportHtml(model: ReportModel, language: Language, colors: Palette): string {
  const dir = languageMeta[language].rtl ? 'rtl' : 'ltr';
  const rows = (lines: ReportLine[]) =>
    lines.map((l) => `<tr><td>${escape(l.label)}</td><td>${escape(l.value)}</td></tr>`).join('');
  const sub = (l: ReportLine) =>
    `<tr class="sub"><td>${escape(l.label)}</td><td>${escape(l.value)}</td></tr>`;
  return `<!doctype html><html dir="${dir}"><head><meta charset="utf-8"><style>
    @page{size:A4;margin:0}
    body{font-family:-apple-system,Roboto,"Noto Sans","Noto Sans Bengali","Noto Naskh Arabic",sans-serif;color:${colors.text};margin:0;font-variant-numeric:tabular-nums}
    .bar{height:8px;background:${colors.primary}}
    .page{padding:36px 48px;min-height:calc(297mm - 8px);box-sizing:border-box;display:flex;flex-direction:column}
    .head{display:flex;justify-content:space-between;align-items:flex-start}
    .brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:20px}
    .mark{width:36px;height:36px;border-radius:9px;background:${colors.primary}}
    .title{text-align:end}.title b{display:block;font-size:20px}.title span{font-size:12px;color:${colors.text2}}
    .meta{margin-top:20px;padding:12px 14px;border-radius:6px;background:${colors.bg};display:grid;grid-template-columns:110px 1fr;row-gap:4px;font-size:12px}
    .meta span:nth-child(odd){color:${colors.text2}}.meta span:nth-child(even){font-weight:600}
    h3{font-size:12px;letter-spacing:.06em;color:${colors.link};margin:22px 0 6px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    td{padding:6px 0;border-bottom:1px solid ${colors.border}}td:last-child{text-align:end}
    td:first-child{color:${colors.text2}}
    tr.sub td{font-weight:700;color:${colors.text};border-bottom:0}
    .totals{margin-top:18px;border-top:2px solid ${colors.text};padding-top:6px}
    .totals td{border-bottom:0}
    .yes{color:${colors.okFg};font-weight:600}
    .pay{margin-top:8px;padding:12px 14px;border-radius:6px;background:${colors.tint};display:flex;justify-content:space-between;align-items:baseline}
    .pay b{font-size:15px}.pay span{font-size:22px;font-weight:700;color:${colors.link}}
    .grow{flex:1}
    .foot{border-top:1px solid ${colors.border};padding-top:10px;display:flex;justify-content:space-between;gap:24px;font-size:10px;color:${colors.text2}}
  </style></head><body><div class="bar"></div><div class="page">
    <div class="head"><div class="brand"><div class="mark"></div>Noor</div>
      <div class="title"><b>${escape(model.heading)}</b><span>${escape(model.ref)}</span></div></div>
    <div class="meta">${model.meta.map((m) => `<span>${escape(m.label)}</span><span>${escape(m.value)}</span>`).join('')}</div>
    <h3>${escape(model.assetsTitle)}</h3>
    <table>${rows(model.assets)}${sub(model.totalAssets)}</table>
    <h3>${escape(model.liabilitiesTitle)}</h3>
    <table>${rows(model.liabilities)}${sub(model.totalLiabilities)}</table>
    <div class="totals"><table>
      <tr><td>${escape(model.net.label)}</td><td><b>${escape(model.net.value)}</b></td></tr>
      <tr><td>${escape(model.above.label)}</td><td class="${model.above.yes ? 'yes' : ''}">${escape(model.above.value)}</td></tr>
    </table>
    <div class="pay"><b>${escape(model.payable.label)}</b><span>${escape(model.payable.value)}</span></div></div>
    <div class="grow"></div>
    <div class="foot"><span>${escape(model.footer)}</span><span>${escape(model.page)}</span></div>
  </div></body></html>`;
}
