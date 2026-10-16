import { formatNumber, type Language } from '@/i18n';

export type Currency = {
  code: string;
  symbol: string;
  /** Lakh/crore grouping (৳3,25,000). */
  lakh: boolean;
};

const CURRENCIES: Record<string, Currency> = {
  BD: { code: 'BDT', symbol: '৳', lakh: true },
  IN: { code: 'INR', symbol: '₹', lakh: true },
  PK: { code: 'PKR', symbol: 'Rs', lakh: true },
  SA: { code: 'SAR', symbol: 'SAR', lakh: false },
  AE: { code: 'AED', symbol: 'AED', lakh: false },
  MY: { code: 'MYR', symbol: 'RM', lakh: false },
  GB: { code: 'GBP', symbol: '£', lakh: false },
  US: { code: 'USD', symbol: '$', lakh: false },
};

/** Local currency for the saved location; Taka when the country is unknown. */
export function currencyFor(countryCode: string | null): Currency {
  return CURRENCIES[countryCode ?? 'BD'] ?? CURRENCIES.US!;
}

/** "৳3,25,000", "SAR 1,250": whole units, grouped, in the UI language's digits. */
export function formatMoney(value: number, language: Language, currency: Currency): string {
  const amount = formatNumber(Math.round(value), language, { lakh: currency.lakh });
  return currency.symbol.length > 1
    ? `${currency.symbol} ${amount}`
    : `${currency.symbol}${amount}`;
}

/** Grouped number without a currency sign, for inputs. */
export function formatAmount(value: number, language: Language, currency: Currency): string {
  return formatNumber(value, language, { lakh: currency.lakh });
}
