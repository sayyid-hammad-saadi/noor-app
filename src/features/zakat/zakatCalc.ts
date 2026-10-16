import type { Currency } from './money';

/** Nisab weights (Hanafi): 52.5 tola of silver, 7.5 tola of gold. */
export const NISAB_GRAMS = { silver: 612.36, gold: 87.48 } as const;
export const NISAB_TOLA = { silver: 52.5, gold: 7.5 } as const;
export const ZAKAT_RATE = 0.025;
/** One lunar year (hawl) in days. */
export const HAWL_DAYS = 354;

export type Metal = 'silver' | 'gold';

export const ASSET_KEYS = [
  'cash',
  'gold',
  'silver',
  'business',
  'receivables',
  'investments',
] as const;
export type AssetKey = (typeof ASSET_KEYS)[number];
export const LIABILITY_KEYS = ['debts', 'bills', 'payables'] as const;
export type LiabilityKey = (typeof LIABILITY_KEYS)[number];

/** Gold and silver are entered in grams; everything else in money. */
export const GRAM_ASSETS: readonly AssetKey[] = ['gold', 'silver'];

export type ZakatInput = {
  basis: Metal;
  /** Price per gram (22K gold) in `currency`. */
  rates: Record<Metal, number>;
  assets: Record<AssetKey, number>;
  liabilities: Record<LiabilityKey, number>;
  currency: Currency;
};

export type ZakatResult = {
  assetValues: Record<AssetKey, number>;
  totalAssets: number;
  totalLiabilities: number;
  net: number;
  nisab: number;
  due: boolean;
  zakat: number;
};

export function nisabValue(input: Pick<ZakatInput, 'basis' | 'rates'>): number {
  return NISAB_GRAMS[input.basis] * input.rates[input.basis];
}

export function assetValues(input: Pick<ZakatInput, 'assets' | 'rates'>): Record<AssetKey, number> {
  const { assets, rates } = input;
  return {
    cash: assets.cash,
    gold: assets.gold * rates.gold,
    silver: assets.silver * rates.silver,
    business: assets.business,
    receivables: assets.receivables,
    investments: assets.investments,
  };
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

export function calculateZakat(input: ZakatInput): ZakatResult {
  const values = assetValues(input);
  const totalAssets = sum(ASSET_KEYS.map((k) => values[k]));
  const totalLiabilities = sum(LIABILITY_KEYS.map((k) => input.liabilities[k]));
  const net = Math.max(0, totalAssets - totalLiabilities);
  const nisab = nisabValue(input);
  const due = nisab > 0 && net >= nisab;
  return {
    assetValues: values,
    totalAssets,
    totalLiabilities,
    net,
    nisab,
    due,
    zakat: due ? Math.round(net * ZAKAT_RATE) : 0,
  };
}
