import { Bell, BellOff, BellRing, MoonStar, Star, UtensilsCrossed } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { SourceLine } from '@/components/content';
import { useToast } from '@/components/feedback';
import { Icon, IconButton, Text, type ColorToken } from '@/components/ui';
import type { Place } from '@/features/location/LocationProvider';
import { useLanguage } from '@/i18n';
import { dayMonthLabel } from '@/lib/dateLabels';
import { ensureNotificationPermission } from '@/lib/notifications';
import { makeStyles } from '@/theme';

import { calendarReminders, reminderKey, reminderTime, setEventReminder } from '../calendarStore';
import { type CalendarEvent, eveningOf } from '../events';

const LOOK = {
  night: { icon: MoonStar, tile: 'gold', fg: 'onGold', bell: 'goldText' },
  fast: { icon: UtensilsCrossed, tile: 'primary', fg: 'onBtn', bell: 'link' },
  holiday: { icon: Star, tile: 'text2', fg: 'surface', bell: 'text2' },
} as const satisfies Record<
  string,
  { icon: unknown; tile: ColorToken; fg: ColorToken; bell: ColorToken }
>;

/** One event on the selected day, with a reminder bell while it is still ahead. */
export function EventCard({
  event,
  date,
  now,
  place,
}: {
  event: CalendarEvent;
  date: Date;
  now: Date;
  place: Place;
}) {
  const styles = useStyles();
  const toast = useToast();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const look = LOOK[event.kind];
  const title = t(`calendar.events.${event.id}.title`);
  const key = reminderKey(date, event);
  const isSet = calendarReminders.use().includes(key);
  const at = reminderTime(date, event, place);
  const upcoming = at > now;

  const toggle = async () => {
    if (isSet) {
      await setEventReminder(key, null);
      toast.show({ message: t('calendar.reminderRemoved'), icon: BellOff });
      return;
    }
    const granted = await ensureNotificationPermission(
      t('permissions.notifications.channelName'),
    ).catch(() => false);
    if (!granted) {
      toast.show({ message: t('calendar.reminderDenied'), icon: BellOff });
      return;
    }
    await setEventReminder(key, at, {
      title,
      body: t(`calendar.events.${event.id}.body`),
    }).catch(() => undefined);
    toast.show({ message: t('calendar.reminderSet'), icon: BellRing });
  };

  return (
    <View style={[styles.card, styles[event.kind]]}>
      <View style={[styles.tile, styles[`tile_${event.kind}`]]}>
        <Icon icon={look.icon} size={18} color={look.fg} />
      </View>
      <View style={styles.body}>
        <Text variant="bodyStrong" weight="700">
          {title}
        </Text>
        <Text variant="label" weight="400">
          {t(`calendar.events.${event.id}.body`)}
          {event.kind === 'night' && event.nightBefore
            ? ` ${t('calendar.nightFrom', { date: dayMonthLabel(eveningOf(date), t, language) })}`
            : ''}
        </Text>
        {event.source ? <SourceLine source={event.source} /> : null}
      </View>
      {upcoming ? (
        <IconButton
          icon={isSet ? BellRing : Bell}
          size={20}
          color={look.bell}
          accessibilityLabel={t(isSet ? 'calendar.unremind' : 'calendar.remind', { event: title })}
          onPress={() => void toggle()}
          style={styles.bell}
        />
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    card: {
      padding: 14,
      borderRadius: t.radius.card,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: t.space.md,
    },
    night: { backgroundColor: t.colors.goldTint },
    fast: { backgroundColor: t.colors.tint },
    holiday: { backgroundColor: t.colors.surface2 },
    tile: {
      width: 36,
      height: 36,
      borderRadius: t.radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tile_night: { backgroundColor: t.colors.gold },
    tile_fast: { backgroundColor: t.colors.primary },
    tile_holiday: { backgroundColor: t.colors.text2 },
    body: { flex: 1, gap: 3 },
    bell: { marginTop: -6, marginEnd: -6 },
  }),
);
