import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, MapPin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon, Text, Touchable } from '@/components/ui';
import { NotificationsButton } from '@/features/home/components/HeaderButton';
import type { Place } from '@/features/location/LocationProvider';
import { clockLabel } from '@/features/prayer/formatTime';
import { useLanguage } from '@/i18n';
import { banglaLabel, gregorianLabel, hijriLabel } from '@/lib/dateLabels';
import { makeStyles, useTheme } from '@/theme';

import type { FastPhase } from '../fastTimes';
import type { RamadanInfo } from '../ramadanCalendar';
import { LiveCountdown } from './LiveCountdown';

/** 13a header content: dates, location, day chip, countdown and today's fast progress. */
export function RamadanHeader({
  now,
  info,
  fast,
  place,
  onLocationPress,
  onRemindersPress,
}: {
  now: Date;
  info: RamadanInfo;
  fast: FastPhase;
  place: Place;
  onLocationPress: () => void;
  onRemindersPress: () => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { language, localizeDigits } = useLanguage();
  const placeLabel = place.shortLabel ?? place.label ?? t('location.setLocation');
  const inRamadan = info.day !== null;
  const time = (d: Date) => clockLabel(d, language, place.timeZone, t);

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <View style={styles.dates}>
          <Text variant="caption" weight="700" color="headerGold" style={styles.eyebrow}>
            {inRamadan
              ? t('ramadan.mubarak').toUpperCase()
              : t('ramadan.upcoming', { year: localizeDigits(info.year) }).toUpperCase()}
          </Text>
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
        <NotificationsButton
          onPress={onRemindersPress}
          accessibilityLabel={t('ramadan.remindersButton')}
        />
      </View>

      <View style={styles.chips}>
        <Touchable
          accessibilityRole="button"
          accessibilityLabel={t('location.change', { place: placeLabel })}
          onPress={onLocationPress}
          style={styles.locationChip}
        >
          <Icon icon={MapPin} size={16} color="onHeader" />
          <Text
            variant="label"
            weight="600"
            color="onHeader"
            numberOfLines={1}
            style={styles.shrink}
          >
            {placeLabel}
          </Text>
          <Icon icon={ChevronDown} size={14} color="onHeader" />
        </Touchable>
        <View style={styles.dayChip}>
          <Text variant="label" weight="700" color="headerGold" numberOfLines={1}>
            {inRamadan
              ? t('ramadan.dayOf', {
                  day: localizeDigits(info.day ?? 1),
                  total: localizeDigits(info.length),
                })
              : info.daysUntil === 1
                ? t('ramadan.startsTomorrow')
                : t('ramadan.startsIn', { n: localizeDigits(info.daysUntil) })}
          </Text>
        </View>
      </View>

      {inRamadan ? (
        <FastCountdown fast={fast} time={time} />
      ) : (
        <View style={styles.center}>
          <Text variant="label" weight="500" color="onHeader" align="center" style={styles.soft}>
            {t('ramadan.beginsIn')}
          </Text>
          <Text
            script="latin"
            size={40}
            weight="700"
            color="onHeader"
            align="center"
            style={styles.big}
          >
            {info.daysUntil === 1
              ? t('ramadan.startsTomorrow')
              : t('ramadan.days', { n: localizeDigits(info.daysUntil) })}
          </Text>
          <Text variant="label" weight="500" color="onHeader" align="center" style={styles.soft}>
            {t('ramadan.expected', { date: gregorianLabel(info.start, t, language) })}
          </Text>
          <Text variant="caption" color="onHeader" align="center" style={styles.soft}>
            {t('ramadan.moonNote')}
          </Text>
        </View>
      )}
    </View>
  );
}

function FastCountdown({ fast, time }: { fast: FastPhase; time: (d: Date) => string }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { localizeDigits } = useLanguage();
  const isIftar = fast.target.kind === 'iftar';
  const label = isIftar ? t('ramadan.iftarIn') : t('ramadan.sehriEndsIn');
  const percent = Math.round(fast.progress * 100);
  const middle =
    fast.phase === 'fasting'
      ? t('ramadan.fastPercent', { percent: localizeDigits(percent) })
      : fast.phase === 'done'
        ? t('ramadan.fastComplete')
        : t('ramadan.beforeSehri');

  return (
    <>
      <View style={styles.center}>
        <Text variant="label" weight="500" color="onHeader" align="center" style={styles.soft}>
          {label}
        </Text>
        <LiveCountdown
          target={fast.target.time}
          label={label}
          script="latin"
          size={40}
          weight="700"
          color="onHeader"
          align="center"
          style={styles.big}
        />
        <Text variant="label" weight="500" color="onHeader" align="center" style={styles.soft}>
          {isIftar
            ? t('ramadan.iftarAt', { time: time(fast.target.time) })
            : t('ramadan.sehriAt', { time: time(fast.target.time) })}
        </Text>
      </View>

      <View style={styles.progress}>
        <View
          style={styles.track}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={t('ramadan.fastProgress')}
          accessibilityValue={{ min: 0, max: 100, now: percent }}
        >
          {percent > 0 ? (
            <LinearGradient
              colors={[`${colors.gold}99`, colors.gold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.fill, { width: `${percent}%` }]}
            />
          ) : null}
          <View
            style={[styles.knob, { start: `${percent}%`, boxShadow: `0 0 0 4px ${colors.gold}40` }]}
          />
        </View>
        <View style={styles.legend}>
          <Text variant="caption" weight="600" color="onHeader" style={styles.soft}>
            {t('ramadan.sehriShort', { time: time(fast.today.sehri) })}
          </Text>
          <Text
            variant="caption"
            weight="600"
            color="onHeader"
            align="center"
            style={[styles.soft, styles.legendMid]}
          >
            {middle}
          </Text>
          <Text variant="caption" weight="600" color="onHeader" style={styles.soft}>
            {t('ramadan.iftarShort', { time: time(fast.today.iftar) })}
          </Text>
        </View>
      </View>
    </>
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
    eyebrow: { letterSpacing: 0.9 },
    subDates: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      opacity: 0.88,
      flexWrap: 'wrap',
    },
    shrink: { flexShrink: 1 },
    chips: { marginTop: t.space.md, flexDirection: 'row', gap: t.space.sm, flexWrap: 'wrap' },
    locationChip: {
      maxWidth: '60%',
      minHeight: 36,
      paddingStart: 10,
      paddingEnd: t.space.md,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.onHeaderChip,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dayChip: {
      minHeight: 36,
      paddingHorizontal: t.space.md,
      borderRadius: t.radius.pill,
      borderWidth: 1,
      borderColor: t.colors.headerGold,
      justifyContent: 'center',
    },
    center: { marginTop: 22, alignItems: 'center', gap: 6 },
    soft: { opacity: 0.85 },
    big: { lineHeight: 46, letterSpacing: -0.4 },
    progress: { marginTop: t.space.xl, gap: 10 },
    track: {
      height: 8,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.onHeaderChip,
      flexDirection: 'row',
    },
    fill: { height: 8, borderRadius: t.radius.pill },
    knob: {
      position: 'absolute',
      top: -5,
      marginStart: -9,
      width: 18,
      height: 18,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.gold,
    },
    legend: { flexDirection: 'row', justifyContent: 'space-between', gap: t.space.sm },
    legendMid: { flex: 1 },
  }),
);
