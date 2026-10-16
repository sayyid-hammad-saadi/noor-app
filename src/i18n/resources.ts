import arCommon from './locales/ar/common.json';
import bnCommon from './locales/bn/common.json';
import enCommon from './locales/en/common.json';

export const defaultNS = 'common';

/** English is the source of truth for keys; bn and ar must match its shape. */
export const resources = {
  en: { common: enCommon },
  bn: { common: bnCommon satisfies typeof enCommon },
  ar: { common: arCommon satisfies typeof enCommon },
} as const;
