import { useSyncExternalStore } from 'react';

import { getItem, setItem, type StorageKeys } from './storage';

type Key = (typeof StorageKeys)[keyof typeof StorageKeys];

export type PersistedStore<T> = {
  get: () => T;
  set: (next: T | ((current: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
  /** React hook returning the current value. */
  use: () => T;
};

/**
 * A tiny global store persisted to AsyncStorage as JSON. Starts with `initial`,
 * then merges the stored value when it loads. `normalize` guards against old or
 * corrupt data.
 */
export function createPersistedStore<T>(
  key: Key,
  initial: T,
  normalize: (raw: unknown) => T = (raw) => raw as T,
): PersistedStore<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  void getItem(key).then((raw) => {
    if (!raw) return;
    try {
      value = normalize(JSON.parse(raw));
      emit();
    } catch {
      // Keep the initial value.
    }
  });

  const store: PersistedStore<T> = {
    get: () => value,
    set: (next) => {
      value = typeof next === 'function' ? (next as (c: T) => T)(value) : next;
      void setItem(key, JSON.stringify(value));
      emit();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    use: () => useSyncExternalStore(store.subscribe, store.get),
  };
  return store;
}
