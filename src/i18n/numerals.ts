import { type Language, languageMeta, type NumeralSystem } from './languages';

const DIGITS: Record<NumeralSystem, readonly string[]> = {
  latn: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  beng: ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'],
  arab: ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'],
};

/** Arabic uses its own decimal and group separators. */
const SEPARATORS: Record<NumeralSystem, { group: string; decimal: string }> = {
  latn: { group: ',', decimal: '.' },
  beng: { group: ',', decimal: '.' },
  arab: { group: '٬', decimal: '٫' },
};

/** Replaces ASCII digits in any string (times, dates, counts) with the language's digits. */
export function localizeDigits(input: string | number, language: Language): string {
  const digits = DIGITS[languageMeta[language].numerals];
  return String(input).replace(/[0-9]/g, (d) => digits[Number(d)] ?? d);
}

/** Groups an integer string: 3-digit groups, or lakh/crore (3,25,000) for Bangla. */
function groupInteger(int: string, lakh: boolean, sep: string): string {
  if (int.length <= 3) return int;
  const last3 = int.slice(-3);
  const rest = int.slice(0, -3);
  const size = lakh ? 2 : 3;
  const parts: string[] = [];
  for (let end = rest.length; end > 0; end -= size) {
    parts.unshift(rest.slice(Math.max(0, end - size), end));
  }
  return `${parts.join(sep)}${sep}${last3}`;
}

export type NumberFormatOptions = {
  /** Fixed number of decimals; defaults to as many as needed, up to 2. */
  decimals?: number;
  grouping?: boolean;
  /** Lakh/crore grouping (3,25,000); defaults to on for Bangla. Taka and rupee amounts use it in every language. */
  lakh?: boolean;
};

/** Formats a number with grouping and the language's digits, without relying on Intl. */
export function formatNumber(
  value: number,
  language: Language,
  { decimals, grouping = true, lakh = language === 'bn' }: NumberFormatOptions = {},
): string {
  const system = languageMeta[language].numerals;
  const { group, decimal } = SEPARATORS[system];
  const fixed =
    decimals === undefined ? String(Math.round(value * 100) / 100) : value.toFixed(decimals);
  const negative = fixed.startsWith('-');
  const [int = '0', frac] = (negative ? fixed.slice(1) : fixed).split('.');
  const grouped = grouping ? groupInteger(int, lakh, group) : int;
  const out = `${negative ? '-' : ''}${grouped}${frac ? decimal + frac : ''}`;
  return localizeDigits(out, language);
}
