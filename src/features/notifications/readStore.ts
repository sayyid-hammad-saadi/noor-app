import { createPersistedStore } from '@/lib/persistedStore';
import { StorageKeys } from '@/lib/storage';

type ReadState = {
  /** Everything at or before this time (ms) counts as read ("Mark all read"). */
  allBefore: number;
  /** Notices opened individually after that. */
  ids: string[];
};

export const notificationsRead = createPersistedStore<ReadState>(
  StorageKeys.notificationsRead,
  { allBefore: 0, ids: [] },
  (raw) => {
    const r = (raw ?? {}) as Partial<ReadState>;
    return {
      allBefore: Number(r.allBefore) || 0,
      ids: Array.isArray(r.ids) ? r.ids.filter((x): x is string => typeof x === 'string') : [],
    };
  },
);

export function markRead(id: string) {
  notificationsRead.set((s) =>
    s.ids.includes(id) ? s : { ...s, ids: [...s.ids, id].slice(-200) },
  );
}

export function markAllRead(now = Date.now()) {
  notificationsRead.set({ allBefore: now, ids: [] });
}

export function isUnread(state: ReadState, notice: { id: string; at: Date }) {
  return notice.at.getTime() > state.allBefore && !state.ids.includes(notice.id);
}
