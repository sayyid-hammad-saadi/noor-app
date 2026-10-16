import { toHijri } from '@/lib/calendars';
import { createPersistedStore } from '@/lib/persistedStore';
import { StorageKeys } from '@/lib/storage';

import { type Currency, currencyFor } from './money';
import {
  ASSET_KEYS,
  type AssetKey,
  calculateZakat,
  LIABILITY_KEYS,
  type LiabilityKey,
  type Metal,
  type ZakatInput,
  type ZakatResult,
} from './zakatCalc';

const zeros = <K extends string>(keys: readonly K[]) =>
  Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0);

function normalizeInput(raw: unknown, fallbackCurrency: Currency): ZakatInput {
  const r = (raw ?? {}) as Partial<ZakatInput>;
  const pick = <K extends string>(keys: readonly K[], src: unknown) =>
    Object.fromEntries(keys.map((k) => [k, num((src as Record<string, unknown>)?.[k])])) as Record<
      K,
      number
    >;
  return {
    basis: r.basis === 'gold' ? 'gold' : 'silver',
    rates: pick(['silver', 'gold'] as const, r.rates),
    assets: pick(ASSET_KEYS, r.assets),
    liabilities: pick(LIABILITY_KEYS, r.liabilities),
    currency: r.currency?.code ? r.currency : fallbackCurrency,
  };
}

export const EMPTY_INPUT: ZakatInput = {
  basis: 'silver',
  rates: { silver: 0, gold: 0 },
  assets: zeros(ASSET_KEYS),
  liabilities: zeros(LIABILITY_KEYS),
  currency: currencyFor('BD'),
};

/** The calculation in progress; kept so the user can leave and come back. */
export const zakatDraft = createPersistedStore<ZakatInput>(
  StorageKeys.zakatDraft,
  EMPTY_INPUT,
  (raw) => normalizeInput(raw, EMPTY_INPUT.currency),
);

export const setBasis = (basis: Metal) => zakatDraft.set((d) => ({ ...d, basis }));
export const setRate = (metal: Metal, value: number) =>
  zakatDraft.set((d) => ({ ...d, rates: { ...d.rates, [metal]: value } }));
export const setAsset = (key: AssetKey, value: number) =>
  zakatDraft.set((d) => ({ ...d, assets: { ...d.assets, [key]: value } }));
export const setLiability = (key: LiabilityKey, value: number) =>
  zakatDraft.set((d) => ({ ...d, liabilities: { ...d.liabilities, [key]: value } }));

/** Clears amounts but keeps today's rates and the chosen basis. */
export const resetDraft = () =>
  zakatDraft.set((d) => ({ ...EMPTY_INPUT, basis: d.basis, rates: d.rates, currency: d.currency }));

export type ZakatRecord = {
  /** Hijri year the calculation belongs to. */
  year: number;
  createdAt: number;
  input: ZakatInput;
  result: ZakatResult;
  paidAt: number | null;
  remind: boolean;
};

export const zakatRecords = createPersistedStore<Record<string, ZakatRecord>>(
  StorageKeys.zakatRecords,
  {},
  (raw) => {
    if (!raw || typeof raw !== 'object') return {};
    const out: Record<string, ZakatRecord> = {};
    for (const [k, v] of Object.entries(raw as Record<string, Partial<ZakatRecord>>)) {
      if (!v || typeof v.year !== 'number') continue;
      const input = normalizeInput(v.input, EMPTY_INPUT.currency);
      out[k] = {
        year: v.year,
        createdAt: num(v.createdAt),
        input,
        result: calculateZakat(input),
        paidAt: typeof v.paidAt === 'number' ? v.paidAt : null,
        remind: !!v.remind,
      };
    }
    return out;
  },
);

/** Saves this year's calculation, keeping its paid and reminder state. */
export function saveRecord(input: ZakatInput, now = new Date()): ZakatRecord {
  const year = toHijri(now).year;
  let saved!: ZakatRecord;
  zakatRecords.set((all) => {
    const previous = all[year];
    saved = {
      year,
      createdAt: now.getTime(),
      input,
      result: calculateZakat(input),
      paidAt: previous?.paidAt ?? null,
      remind: previous?.remind ?? false,
    };
    return { ...all, [year]: saved };
  });
  return saved;
}

export function updateRecord(year: number, patch: Partial<Pick<ZakatRecord, 'paidAt' | 'remind'>>) {
  zakatRecords.set((all) => {
    const r = all[year];
    return r ? { ...all, [year]: { ...r, ...patch } } : all;
  });
}
