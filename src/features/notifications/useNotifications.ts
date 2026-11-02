import type { Href } from 'expo-router';
import {
  BookOpen,
  CalendarDays,
  Clock,
  ListChecks,
  type LucideIcon,
  Moon,
  Users,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import type { IconTileTone } from '@/components/ui';
import { myAmol, practicesOn, reminderTime } from '@/features/calendar/calendarStore';
import { eventsOn } from '@/features/calendar/events';
import { addDays } from '@/features/calendar/hijriMonth';
import { calendarRoute } from '@/features/calendar/routes';
import { useAmol } from '@/features/home/useAmol';
import { useLocation } from '@/features/location/LocationProvider';
import { useAdhanPrefs } from '@/features/prayer/adhanPrefs';
import { clockLabel } from '@/features/prayer/formatTime';
import { computeDay, PRAYERS } from '@/features/prayer/prayerTimes';
import { useNow } from '@/features/prayer/usePrayerTimes';
import { useLanguage } from '@/i18n';
import { dayKey, dayMonthLabel } from '@/lib/dateLabels';
import { routes } from '@/lib/routes';

import { isUnread, notificationsRead } from './readStore';

export type NoticeKind = 'prayer' | 'event' | 'reminder';

export type Notice = {
  id: string;
  kind: NoticeKind;
  at: Date;
  title: string;
  body: string;
  icon: LucideIcon;
  tone: IconTileTone;
  to: Href;
  unread: boolean;
};

const WEEK = 7;
const at = (day: Date, h: number, m = 0) => {
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
};

/**
 * The in-app inbox (27). Built on the device from what Noor reminds about: Adhan times
 * the user kept on (today and yesterday), the daily ayah, Jumu'ah, last night's amol
 * summary and calendar events whose reminder time has passed this week. Nothing is
 * fetched; read state is stored locally.
 */
export function useNotifications(): { notices: Notice[]; unread: number } {
  const { t } = useTranslation();
  const { language, localizeDigits } = useLanguage();
  const { place } = useLocation();
  const prefs = useAdhanPrefs();
  const read = notificationsRead.use();
  const added = myAmol.use();
  const now = useNow(60_000);
  const today = at(now, 0);
  const yesterday = addDays(today, -1);
  const amol = useAmol(dayKey(yesterday));
  const notices: Omit<Notice, 'unread'>[] = [];
  const fmt = (d: Date) => clockLabel(d, language, place.timeZone, t);

  // Adhan, today and yesterday.
  for (const day of [today, yesterday]) {
    const times = computeDay(place.latitude, place.longitude, day, place.countryCode);
    for (const p of PRAYERS) {
      const time = times[p];
      if (!prefs[p] || time > now) continue;
      const prayer = t(`prayers.${p}`);
      notices.push({
        id: `prayer:${dayKey(day)}:${p}`,
        kind: 'prayer',
        at: time,
        title: t('prayerTimes.adhanTitle', { prayer, time: fmt(time) }),
        body: place.shortLabel
          ? t('notifications.prayerBodyIn', { prayer, place: place.shortLabel })
          : t('prayerTimes.adhanBody', { prayer }),
        icon: Clock,
        tone: 'tint',
        to: routes.prayerTimes,
      });
    }
  }

  // Daily ayah at 7 AM.
  const ayahAt = at(today, 7);
  if (ayahAt <= now) {
    notices.push({
      id: `ayah:${dayKey(today)}`,
      kind: 'reminder',
      at: ayahAt,
      title: t('home.daily.ayah'),
      body: `${t('home.daily.ayahRef')} · ${t('home.daily.ayahTranslation')}`,
      icon: BookOpen,
      tone: 'tint',
      to: routes.home,
    });
  }

  // Jumu'ah mornings this week.
  for (let i = 0; i < WEEK; i++) {
    const day = addDays(today, -i);
    const time = at(day, 8);
    if (day.getDay() !== 5 || time > now) continue;
    notices.push({
      id: `jumuah:${dayKey(day)}`,
      kind: 'event',
      at: time,
      title: t('notifications.jumuah'),
      body: t('notifications.jumuahBody'),
      icon: Users,
      tone: 'gold',
      to: routes.home,
    });
  }

  // Last night's amol summary at 9 PM.
  const base = 5;
  const extras = practicesOn(yesterday, added).map((p) => `cal:${p.id}`);
  const total = base + extras.length;
  const done = [
    'isha',
    'witr',
    'tahajjud',
    yesterday.getDay() === 5 ? 'kahf' : 'mulk',
    'salawat',
    ...extras,
  ].filter((id) => amol.done[id]).length;
  notices.push({
    id: `amol:${dayKey(yesterday)}`,
    kind: 'reminder',
    at: at(yesterday, 21),
    title: t('notifications.amol'),
    body: t('notifications.amolBody', {
      done: localizeDigits(done),
      total: localizeDigits(total),
    }),
    icon: ListChecks,
    tone: 'neutral',
    to: routes.home,
  });

  // Calendar events whose reminder time passed in the last week (first day of each).
  const seen = new Set<string>();
  for (let i = -WEEK; i <= WEEK; i++) {
    const day = addDays(today, i);
    for (const e of eventsOn(day, place.countryCode)) {
      if (seen.has(e.id)) continue;
      const time = reminderTime(day, e, place);
      if (time > now || now.getTime() - time.getTime() > WEEK * 86_400_000) continue;
      seen.add(e.id);
      notices.push({
        id: `event:${dayKey(day)}:${e.id}`,
        kind: 'event',
        at: time,
        title: t(`calendar.events.${e.id}.title`),
        body: t('notifications.eventBody', { date: dayMonthLabel(day, t, language) }),
        icon: e.kind === 'holiday' ? CalendarDays : Moon,
        tone: e.kind === 'holiday' ? 'neutral' : 'gold',
        to: calendarRoute,
      });
    }
  }

  const list = notices
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .map((n) => ({ ...n, unread: isUnread(read, n) }));
  return { notices: list, unread: list.filter((n) => n.unread).length };
}
