import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import {
  Ban,
  Bell,
  BellOff,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  MapPin,
  SlidersHorizontal,
  Sun,
  Sunrise,
  Sunset,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DatePickerSheet } from '@/components/date/DatePickerSheet';
import { useToast } from '@/components/feedback';
import { TopBar } from '@/components/layout';
import { Icon, IconButton, Text, Touchable } from '@/components/ui';
import { PRAYER_ICONS } from './prayerIcons';
import { CityPickerSheet } from '@/features/location/CityPickerSheet';
import { useLocation } from '@/features/location/LocationProvider';
import { useLanguage } from '@/i18n';
import { dayMonthLabel, hijriLocalized, isSameDay } from '@/lib/dateLabels';
import { routes } from '@/lib/routes';
import { makeStyles, useTheme } from '@/theme';

import { setAdhan, useAdhanPrefs } from './adhanPrefs';
import { clockLabel, untilParts } from './formatTime';
import { dayDetails, methodFor, PRAYERS, type PrayerName, prayerState } from './prayerTimes';
import { useNow } from './usePrayerTimes';

/** 06 Prayer Times: start/end for each prayer, Adhan toggles and makruh times. */
export default function PrayerTimesScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const { language } = useLanguage();
  const { place, saved, setLocation } = useLocation();
  const now = useNow();
  const [date, setDate] = useState(() => new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const isToday = isSameDay(date, now);
  const day = dayDetails(place.latitude, place.longitude, date, place.countryCode);
  const current = isToday
    ? prayerState(place.latitude, place.longitude, now, place.countryCode).current
    : null;
  const { method, madhab } = methodFor(place.countryCode);
  const methodLabel = `${t(`prayerTimes.methods.${method}`)} · ${t(`prayerTimes.madhabs.${madhab}`)}`;
  const fmt = (d: Date) => clockLabel(d, language, place.timeZone, t);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        title={t('prayerTimes.title')}
        subtitle={`${dayMonthLabel(date, t, language)} · ${hijriLocalized(date, t, language)}`}
        right={
          <IconButton
            icon={CalendarDays}
            size={22}
            accessibilityLabel={t('prayerTimes.pickDate')}
            onPress={() => setPickerOpen(true)}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.chips}>
          <Touchable
            accessibilityRole="button"
            accessibilityLabel={t('prayerTimes.method', { method: methodLabel })}
            onPress={() => toast.show({ message: t('prayerTimes.methodSoon') })}
            style={[styles.chip, styles.chipTint]}
          >
            <Icon icon={SlidersHorizontal} size={16} color="link" />
            <Text variant="label" weight="600" color="link" numberOfLines={1} style={styles.shrink}>
              {methodLabel}
            </Text>
            <Icon icon={ChevronDown} size={14} color="link" />
          </Touchable>
          <Touchable
            accessibilityRole="button"
            accessibilityLabel={t('location.change', { place: place.label ?? '' })}
            onPress={() => setCityOpen(true)}
            style={[styles.chip, styles.chipPlain]}
          >
            <Icon icon={MapPin} size={16} color="primary" />
            <Text variant="label" weight="600" numberOfLines={1} style={styles.shrink}>
              {place.shortLabel ?? t('location.setLocation')}
            </Text>
          </Touchable>
        </View>

        <View style={styles.list}>
          {PRAYERS.map((p) => (
            <PrayerRow
              key={p}
              prayer={p}
              start={fmt(day.times[p])}
              end={fmt(day.ends[p])}
              isCurrent={current === p}
              progress={
                current === p
                  ? {
                      startMs: day.times[p].getTime(),
                      endMs: day.ends[p].getTime(),
                      now,
                    }
                  : null
              }
            />
          ))}
        </View>

        <ForbiddenTimes
          rows={[
            { key: 'sunrise', icon: Sunrise, range: day.makruh.sunrise },
            { key: 'zawal', icon: Sun, range: day.makruh.zawal },
            { key: 'sunset', icon: Sunset, range: day.makruh.sunset },
          ]}
          fmt={fmt}
        />

        <Touchable
          accessibilityRole="link"
          onPress={() => router.push(routes.timetable)}
          style={styles.monthly}
        >
          <Icon icon={CalendarDays} size={20} color="primary" />
          <Text variant="bodyStrong" style={styles.grow}>
            {t('prayerTimes.monthly')}
          </Text>
          <Icon icon={ChevronRight} size={18} color="text2" flipInRTL />
        </Touchable>
      </ScrollView>

      <DatePickerSheet
        key={`${pickerOpen}-${date.toDateString()}`}
        visible={pickerOpen}
        value={date}
        onClose={() => setPickerOpen(false)}
        onSelect={(d) => {
          setDate(d);
          setPickerOpen(false);
        }}
      />
      <CityPickerSheet
        visible={cityOpen}
        onClose={() => setCityOpen(false)}
        selectedId={saved?.source === 'city' ? saved.cityId : undefined}
        onSelect={async (city) => {
          setCityOpen(false);
          await setLocation({ source: 'city', cityId: city.id });
        }}
      />
    </SafeAreaView>
  );
}

function PrayerRow({
  prayer,
  start,
  end,
  isCurrent,
  progress,
}: {
  prayer: PrayerName;
  start: string;
  end: string;
  isCurrent: boolean;
  progress: { startMs: number; endMs: number; now: Date } | null;
}) {
  const styles = useStyles();
  const { t, i18n } = useTranslation();
  const { localizeDigits } = useLanguage();
  const { shadows } = useTheme();
  const toast = useToast();
  const prefs = useAdhanPrefs();
  const on = prefs[prayer];
  const name = t(`prayers.${prayer}`);
  // The Arabic name is shown under the UI name, except when the UI is already Arabic.
  const arabicName = i18n.language === 'ar' ? null : i18n.getFixedT('ar')(`prayers.${prayer}`);

  const toggle = async () => {
    const next = !on;
    setAdhan(prayer, next);
    if (next && Platform.OS !== 'web') {
      const permission = await Notifications.getPermissionsAsync().catch(() => null);
      if (permission && !permission.granted)
        toast.show({ message: t('prayerTimes.notificationsOff') });
    }
  };

  let elapsed = 0;
  let remaining = '';
  if (progress) {
    const total = progress.endMs - progress.startMs;
    elapsed = Math.min(1, Math.max(0, (progress.now.getTime() - progress.startMs) / total));
    const { hours, minutes } = untilParts(progress.now, new Date(progress.endMs));
    remaining =
      hours > 0
        ? t('home.durationHM', {
            h: localizeDigits(hours),
            m: localizeDigits(String(minutes).padStart(2, '0')),
          })
        : t('home.durationM', { m: localizeDigits(minutes) });
  }

  return (
    <View
      style={[
        styles.row,
        isCurrent ? styles.rowCurrent : [styles.rowPlain, { boxShadow: shadows.card }],
      ]}
    >
      <View style={styles.rowMain}>
        <View style={[styles.tile, isCurrent && styles.tileCurrent]}>
          <Icon
            icon={PRAYER_ICONS[prayer]}
            size={22}
            color={isCurrent ? 'onBtn' : 'primary'}
            filled={isCurrent && prayer === 'isha'}
          />
        </View>
        <View style={styles.names}>
          <View style={styles.nameRow}>
            <Text
              size={17}
              weight={isCurrent ? '700' : '600'}
              numberOfLines={1}
              style={styles.shrink}
            >
              {name}
            </Text>
            {isCurrent ? (
              <View style={styles.nowBadge}>
                <Text variant="micro" weight="700" color="onBtn">
                  {t('prayerTimes.now')}
                </Text>
              </View>
            ) : null}
          </View>
          {arabicName ? (
            <Text script="ar" variant="caption" weight="400">
              {arabicName}
            </Text>
          ) : null}
        </View>
        <View style={styles.times}>
          <Text variant="label" weight="400" color="text" tabular numberOfLines={1}>
            <Text variant="label" weight="400" color="text2">
              {t('prayerTimes.start')}{' '}
            </Text>
            <Text variant="label" weight="700" tabular>
              {start}
            </Text>
          </Text>
          <Text variant="label" weight="400" color="text" tabular numberOfLines={1}>
            <Text variant="label" weight="400" color="text2">
              {t('prayerTimes.end')}{' '}
            </Text>
            <Text variant="label" weight="600" tabular>
              {end}
            </Text>
          </Text>
        </View>
        <Touchable
          accessibilityRole="switch"
          accessibilityState={{ checked: on }}
          accessibilityLabel={t(on ? 'prayerTimes.adhanOn' : 'prayerTimes.adhanOff', {
            prayer: name,
          })}
          onPress={() => void toggle()}
          style={styles.bell}
        >
          <Icon icon={on ? Bell : BellOff} size={20} color={on ? 'primary' : 'text2'} filled={on} />
        </Touchable>
      </View>

      {progress ? (
        <View style={styles.progress}>
          <View
            style={styles.track}
            accessibilityRole="progressbar"
            accessibilityLabel={t('prayerTimes.elapsed', { prayer: name })}
            accessibilityValue={{ min: 0, max: 100, now: Math.round(elapsed * 100) }}
          >
            <View style={[styles.fill, { width: `${elapsed * 100}%` }]} />
          </View>
          <View style={styles.progressText}>
            <Text variant="caption" weight="600">
              {t('prayerTimes.endsIn', { duration: remaining })}
            </Text>
            <Text variant="caption" weight="600" tabular>
              {`${localizeDigits(Math.round(elapsed * 100))}%`}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function ForbiddenTimes({
  rows,
  fmt,
}: {
  rows: { key: 'sunrise' | 'zawal' | 'sunset'; icon: LucideIcon; range: [Date, Date] }[];
  fmt: (d: Date) => string;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  return (
    <View
      style={[styles.forbidden, { boxShadow: shadows.card }]}
      accessibilityLabel={t('prayerTimes.forbidden')}
    >
      <View style={styles.forbiddenHead}>
        <View style={styles.banTile}>
          <Icon icon={Ban} size={16} color="dangerText" />
        </View>
        <Text variant="bodyStrong" weight="700" accessibilityRole="header" style={styles.grow}>
          {t('prayerTimes.forbidden')}
        </Text>
      </View>
      {rows.map((r) => (
        <View key={r.key} style={styles.forbiddenRow} accessible>
          <Icon icon={r.icon} size={18} color="text2" />
          <Text variant="body" style={styles.grow}>
            {t(`prayerTimes.${r.key}`)}
          </Text>
          <Text variant="label" weight="600" tabular>
            {`${fmt(r.range[0])} – ${fmt(r.range[1])}`}
          </Text>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    content: { paddingHorizontal: t.size.gutter, paddingBottom: t.space.xxxl },
    grow: { flex: 1 },
    shrink: { flexShrink: 1 },
    chips: { marginTop: t.space.sm, flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm },
    chip: {
      minHeight: 36,
      maxWidth: '100%',
      paddingHorizontal: t.space.md,
      borderRadius: t.radius.pill,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    chipTint: { backgroundColor: t.colors.tint },
    chipPlain: { backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border },
    list: { marginTop: t.space.md, gap: t.space.sm },
    row: { borderRadius: t.radius.card, paddingStart: t.space.md, paddingEnd: 6 },
    rowPlain: {
      minHeight: 64,
      justifyContent: 'center',
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
    rowCurrent: {
      paddingTop: t.space.md,
      paddingBottom: 14,
      gap: 10,
      backgroundColor: t.colors.tint,
      borderWidth: 1.5,
      borderColor: t.colors.primary,
    },
    rowMain: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
      paddingVertical: t.space.xs,
    },
    tile: {
      width: 40,
      height: 40,
      borderRadius: t.radius.md,
      backgroundColor: t.colors.tint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tileCurrent: { backgroundColor: t.colors.btn },
    names: { flex: 1, minWidth: 0 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    nowBadge: {
      minHeight: 20,
      paddingHorizontal: t.space.sm,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.btn,
      justifyContent: 'center',
    },
    times: { alignItems: 'flex-end', gap: 2 },
    bell: {
      width: t.size.touch,
      height: t.size.touch,
      alignItems: 'center',
      justifyContent: 'center',
    },
    progress: { paddingEnd: 10, gap: 6 },
    track: {
      height: 6,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.surface,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    fill: { borderRadius: t.radius.pill, backgroundColor: t.colors.primary },
    progressText: { flexDirection: 'row', justifyContent: 'space-between' },
    forbidden: {
      marginTop: t.space.lg,
      paddingTop: t.space.md,
      paddingHorizontal: t.space.lg,
      paddingBottom: 6,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
    forbiddenHead: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 10 },
    banTile: {
      width: 28,
      height: 28,
      borderRadius: t.radius.xs,
      backgroundColor: t.colors.dangerTint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    forbiddenRow: {
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: t.colors.border,
      paddingVertical: t.space.xs,
    },
    monthly: {
      marginTop: t.space.lg,
      minHeight: 52,
      paddingStart: t.space.lg,
      paddingEnd: t.space.md,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.surface,
      borderWidth: 1.5,
      borderColor: t.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
  }),
);
