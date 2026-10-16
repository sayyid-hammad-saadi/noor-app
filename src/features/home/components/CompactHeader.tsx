import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { GradientHeader } from '@/components/layout';
import { Icon, Text } from '@/components/ui';
import type { Place } from '@/features/location/LocationProvider';
import { clockParts } from '@/features/prayer/formatTime';
import type { PrayerState } from '@/features/prayer/prayerTimes';
import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

import { NotificationsButton } from './HeaderButton';
import { useCountdown } from './HomeHeader';
import { PRAYER_ICONS } from '@/features/prayer/prayerIcons';

/** 05b collapsed header shown once the sheet scrolls over the full header. */
export function CompactHeader({
  now,
  state,
  place,
  onBellPress,
}: {
  now: Date;
  state: PrayerState;
  place: Place;
  onBellPress: () => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const next = clockParts(state.next.time, language, place.timeZone, { padHour: true });
  const countdown = useCountdown(now, state.next.time);
  const sub = place.shortLabel
    ? t('home.compactSub', { duration: countdown, place: place.shortLabel })
    : t('home.countdown', { prayer: t(`prayers.${state.next.name}`), duration: countdown });

  return (
    <GradientHeader insetTop style={styles.root}>
      <View style={styles.row}>
        <View style={styles.badge}>
          <Icon icon={PRAYER_ICONS[state.next.name]} size={22} color="onHeader" />
        </View>
        <View style={styles.text}>
          <Text variant="title" color="onHeader" numberOfLines={1}>
            {`${t(`prayers.${state.next.name}`)} · ${next.time} ${t(`time.${next.period}`)}`}
          </Text>
          <Text variant="label" weight="500" color="onHeader" numberOfLines={1} style={styles.soft}>
            {sub}
          </Text>
        </View>
        <NotificationsButton onPress={onBellPress} />
      </View>
    </GradientHeader>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { paddingBottom: t.space.xl },
    row: {
      minHeight: 48,
      marginTop: t.space.xxs,
      paddingHorizontal: t.size.gutter,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    badge: {
      width: 40,
      height: 40,
      borderRadius: t.radius.md,
      backgroundColor: t.colors.onHeaderChip,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: { flex: 1, minWidth: 0 },
    soft: { opacity: 0.88 },
  }),
);
