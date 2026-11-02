import { createPersistedStore } from '@/lib/persistedStore';
import { StorageKeys } from '@/lib/storage';

import { type Madhhab, MADHHABS } from './masail';

/** The school answers open in (22a chip). */
export const madhhabPref = createPersistedStore<Madhhab>(
  StorageKeys.masailMadhhab,
  'hanafi',
  (raw) => (MADHHABS.includes(raw as Madhhab) ? (raw as Madhhab) : 'hanafi'),
);
