import { ChevronDown, Clock, MapPin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon, Text, Touchable } from '@/components/ui';
import { clockParts, untilParts } from '@/features/prayer/formatTime';
import { PRAYERS, type PrayerState } from '@/features/prayer/prayerTimes';
import type { Place } from '@/features/location/LocationProvider';
import { useLanguage } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';

import { banglaLabel, gregorianLabel, hijriLabel } from '@/lib/dateLabels';
import { NotificationsButton } from './HeaderButton';
import { PRAYER_ICONS } from '@/features/prayer/prayerIcons';

export function useCountdown(now: Date, target: Date): string {
  const { t } = useTranslation();
  const { localizeDigits } = useLanguage();
  const { hours, minutes } = untilParts(now, target);
  return hours > 0
    ? t('home.durationHM', {
        h: localizeDigits(hours),
        m: localizeDigits(String(minutes).padStart(2, '0')),
      })
    : t('home.durationM', { m: localizeDigits(minutes) });
}

/** 05a header content: dates, location, next prayer and today's five prayers. */
export function HomeHeader({
  now,
  state,
  place,
  onLocationPress,
  onBellPress,
  onPrayerTimesPress,
}: {
  now: Date;
  state: PrayerState;
  place: Place;
  onLocationPress: () => void;
  onBellPress: () => void;
  onPrayerTimesPress: () => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const next = clockParts(state.next.time, language, place.timeZone, { padHour: true });
  const nextName = t(`prayers.${state.next.name}`);
  const countdown = useCountdown(now, state.next.time);
  const placeLabel = place.label ?? t('location.setLocation');

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <View style={styles.dates}>
          <Text script="ar" size={19} weight="600" color="onHeader">
            {hijriLabel(now)}
          </Text>
          <View style={styles.subDates}>
            <Text script="bn" size={14} weight="500" color="onHeader">
              {banglaLabel(now)}
            </Text>
            <Text variant="label" weight="500" color="onHeader" importantForAccessibility="no">
              ·
            </Text>
            <Text variant="label" weight="500" color="onHeader" style={styles.shrink}>
              {gregorianLabel(now, t, language)}
            </Text>
          </View>
        </View>
        <NotificationsButton onPress={onBellPress} />
      </View>

      <Touchable
        accessibilityRole="button"
        accessibilityLabel={t('location.change', { place: placeLabel })}
        onPress={onLocationPress}
        style={styles.locationChip}
      >
        <Icon icon={MapPin} size={16} color="onHeader" />
        <Text variant="label" weight="600" color="onHeader" numberOfLines={1} style={styles.shrink}>
          {placeLabel}
        </Text>
        <Icon icon={ChevronDown} size={14} color="onHeader" />
      </Touchable>

      <View style={styles.next} accessible accessibilityRole="header">
        <Text variant="label" weight="500" color="onHeader" align="center" style={styles.soft}>
          {t('home.nextPrayer', { prayer: nextName })}
        </Text>
        <View style={styles.timeRow}>
          <Text
            script="latin"
            size={40}
            weight="700"
            color="onHeader"
            tabular
            style={styles.bigTime}
          >
            {next.time}
          </Text>
          <Text size={17} weight="600" color="onHeader" style={styles.period}>
            {t(`time.${next.period}`)}
          </Text>
        </View>
        <View style={styles.countdown}>
          <Icon icon={Clock} size={14} color="onHeader" />
          <Text variant="label" weight="600" color="onHeader">
            {t('home.countdown', { prayer: nextName, duration: countdown })}
          </Text>
        </View>
      </View>

      <PrayerStrip state={state} place={place} onPress={onPrayerTimesPress} />
    </View>
  );
}

function PrayerStrip({
  state,
  place,
  onPress,
}: {
  state: PrayerState;
  place: Place;
  onPress: () => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { shadows } = useTheme();
  return (
    <Touchable
      style={styles.strip}
      accessibilityRole="button"
      accessibilityLabel={t('home.prayerTimes')}
      onPress={onPress}
      pressedOpacity={0.85}
    >
      {PRAYERS.map((p) => {
        const current = state.current === p;
        const fg = current ? 'hlFg' : 'onHeader';
        const time = clockParts(state.today[p], language, place.timeZone).time;
        return (
          <View
            key={p}
            accessibilityLabel={
              current
                ? t('home.currentPrayer', { prayer: t(`prayers.${p}`), time })
                : `${t(`prayers.${p}`)}, ${time}`
            }
            style={[styles.cell, current && [styles.cellOn, { boxShadow: shadows.highlight }]]}
          >
            <Text
              variant="caption"
              weight={current ? '700' : '600'}
              color={fg}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              maxFontSizeMultiplier={1.3}
              style={current ? null : styles.soft}
            >
              {t(`prayers.${p}`)}
            </Text>
            <Icon icon={PRAYER_ICONS[p]} size={22} color={fg} filled={current && p === 'isha'} />
            <Text
              variant="label"
              weight={current ? '700' : '600'}
              color={fg}
              tabular
              numberOfLines={1}
              maxFontSizeMultiplier={1.3}
            >
              {time}
            </Text>
          </View>
        );
      })}
    </Touchable>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { paddingHorizontal: t.size.gutter, paddingTop: t.space.xs },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: t.space.md,
    },
    dates: { flex: 1, gap: t.space.xxs },
    subDates: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      opacity: 0.88,
      flexWrap: 'wrap',
    },
    shrink: { flexShrink: 1 },
    locationChip: {
      marginTop: 10,
      alignSelf: 'flex-start',
      maxWidth: '100%',
      minHeight: 36,
      paddingStart: 10,
      paddingEnd: t.space.md,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.onHeaderChip,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    next: { marginTop: 18, alignItems: 'center', gap: 6 },
    soft: { opacity: 0.88 },
    timeRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
    bigTime: { lineHeight: 46, letterSpacing: -0.8 },
    period: { opacity: 0.9 },
    countdown: {
      marginTop: t.space.xs,
      minHeight: 28,
      paddingHorizontal: t.space.md,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.onHeaderChip,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    strip: { marginTop: t.space.xl, flexDirection: 'row', gap: 6 },
    cell: {
      flex: 1,
      alignItems: 'center',
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 2,
      borderRadius: t.radius.card,
    },
    cellOn: { backgroundColor: t.colors.hlBg },
  }),
);
