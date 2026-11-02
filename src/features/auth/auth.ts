import { createPersistedStore } from '@/lib/persistedStore';
import { StorageKeys } from '@/lib/storage';

/**
 * Optional account for backup and sync. Everything in Noor works without one.
 *
 * No auth backend is connected yet: `AUTH_AVAILABLE` is false and every sign-in
 * method resolves to `unavailable`. To add one (Supabase, Firebase, your own API),
 * implement the three functions below and flip the flag; screens only use this module.
 */
export const AUTH_AVAILABLE = false;

export type Account = {
  name: string;
  email: string;
  /** Last successful sync (ms), when sync exists. */
  syncedAt: number | null;
};

export type SignInResult = { status: 'ok' } | { status: 'unavailable' } | { status: 'error' };

/** The signed-in account, or null for guest mode. */
export const account = createPersistedStore<Account | null>(StorageKeys.account, null, (raw) => {
  const a = raw as Partial<Account> | null;
  return a && typeof a.email === 'string'
    ? { name: String(a.name ?? ''), email: a.email, syncedAt: Number(a.syncedAt) || null }
    : null;
});

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

/** Emails a 6-digit sign-in code. */
export async function sendEmailCode(_email: string): Promise<SignInResult> {
  return { status: 'unavailable' };
}

export async function signInWithGoogle(): Promise<SignInResult> {
  return { status: 'unavailable' };
}

export async function signInWithApple(): Promise<SignInResult> {
  return { status: 'unavailable' };
}

export function signOut() {
  account.set(null);
}
