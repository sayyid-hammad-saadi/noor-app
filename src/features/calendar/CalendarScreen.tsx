import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TopBar } from '@/components/layout';
import { Icon, Text, Touchable } from '@/components/ui';
import { useLocation } from '@/features/location/LocationProvider';
import { useNow } from '@/features/prayer/usePrayerTimes';
import { localizeDigits as digitsIn, useLanguage } from '@/i18n';
import { BANGLA_MONTHS, HIJRI_MONTHS_AR, toBangla } from '@/lib/calendars';
import { banglaLabel, hijriLocalized, isSameDay } from '@/lib/dateLabels';
import { makeStyles, useTheme } from '@/theme';

import { EventCard } from './components/EventCard';
import { type Cell, MonthGrid, monthCells } from './components/MonthGrid';
import { eventsOn } from './events';
import {
  addDays,
  hijriMonthStart,
  type HijriMonth,
  hijriOf,
  monthLength,
  shiftMonth,
} from './hijriMonth';
import { monthAmolRoute } from './routes';

/** 18 Islamic Calendar: Hijri month grid with Bangla and Gregorian dates and events. */
export default function CalendarScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { language, localizeDigits } = useLanguage();
  const { place } = useLocation();
  const now = useNow(60_000);
  const todayH = hijriOf(now);
  const [cursor, setCursor] = useState<HijriMonth>({ year: todayH.year, month: todayH.month });
  const [selected, setSelected] = useState<Date>(() => new Date());

  const hijriMonths = t('date.hijriMonths', { returnObjects: true }) as string[];
  const months = t('date.monthsShort', { returnObjects: true }) as string[];
  const weekdays = t('date.weekdays', { returnObjects: true }) as string[];
  const monthsLong = t('date.months', { returnObjects: true }) as string[];
  const monthName = (m: number) => hijriMonths[m - 1] ?? '';

  const cells = useMemo(() => monthCells(cursor, place.countryCode), [cursor, place.countryCode]);

  const start = hijriMonthStart(cursor);
  const end = addDays(start, monthLength(cursor) - 1);
  const gSpan =
    start.getFullYear() === end.getFullYear()
      ? start.getMonth() === end.getMonth()
        ? `${months[start.getMonth()]} ${localizeDigits(start.getFullYear())}`
        : `${months[start.getMonth()]} – ${months[end.getMonth()]} ${localizeDigits(end.getFullYear())}`
      : `${months[start.getMonth()]} ${localizeDigits(start.getFullYear())} – ${months[end.getMonth()]} ${localizeDigits(end.getFullYear())}`;
  const b1 = toBangla(start);
  const b2 = toBangla(end);
  // The Bangla date is always written in Bangla.
  const bSpan =
    b1.month === b2.month
      ? `${BANGLA_MONTHS[b1.month - 1]} ${digitsIn(b2.year, 'bn')}`
      : `${BANGLA_MONTHS[b1.month - 1]}–${BANGLA_MONTHS[b2.month - 1]} ${digitsIn(b2.year, 'bn')}`;

  const go = (n: number) => setCursor((c) => shiftMonth(c, n));
  const onSelect = (cell: Cell) => {
    setSelected(cell.date);
    if (cell.out) {
      const h = hijriOf(cell.date);
      setCursor({ year: h.year, month: h.month });
    }
  };
  const goToday = () => {
    setCursor({ year: todayH.year, month: todayH.month });
    setSelected(new Date());
  };

  const events = eventsOn(selected, place.countryCode);
  const selH = hijriOf(selected);
  const isCurrent = cursor.year === todayH.year && cursor.month === todayH.month;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        title={t('calendar.title')}
        right={
          <Touchable
            accessibilityRole="button"
            onPress={goToday}
            disabled={isCurrent && isSameDay(selected, now)}
            style={styles.todayPill}
          >
            <Text variant="label" weight="700" color="link">
              {t('calendar.today')}
            </Text>
          </Touchable>
        }
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.monthRow}>
          <Touchable
            accessibilityRole="button"
            accessibilityLabel={t('calendar.previous', {
              month: monthName(shiftMonth(cursor, -1).month),
            })}
            onPress={() => go(-1)}
            style={styles.monthBtn}
          >
            <Icon icon={ChevronLeft} size={20} flipInRTL />
          </Touchable>
          <View style={styles.monthText} accessible accessibilityRole="header">
            <View style={styles.monthTitle}>
              <Text size={20} weight="700">
                {`${monthName(cursor.month)} ${localizeDigits(cursor.year)}`}
              </Text>
              {language !== 'ar' ? (
                <Text script="ar" size={15} color="text2">
                  {HIJRI_MONTHS_AR[cursor.month - 1]}
                </Text>
              ) : null}
            </View>
            <View style={styles.spanRow}>
              <Text variant="caption">{`${gSpan} · `}</Text>
              <Text variant="caption" script="bn">
                {bSpan}
              </Text>
            </View>
          </View>
          <Touchable
            accessibilityRole="button"
            accessibilityLabel={t('calendar.next', {
              month: monthName(shiftMonth(cursor, 1).month),
            })}
            onPress={() => go(1)}
            style={styles.monthBtn}
          >
            <Icon icon={ChevronRight} size={20} flipInRTL />
          </Touchable>
        </View>

        <View style={[styles.gridCard, { boxShadow: shadows.card }]}>
          <MonthGrid
            cells={cells}
            selected={selected}
            today={now}
            onSelect={onSelect}
            monthName={monthName}
          />
        </View>

        <View style={styles.legend}>
          {(['night', 'fast', 'holiday'] as const).map((k) => (
            <View key={k} style={styles.legendItem}>
              <View style={[styles.legendDot, styles[`dot_${k}`]]} />
              <Text variant="micro" weight="600" color="text2">
                {t(`calendar.legend.${k}`)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.dayHead} accessible accessibilityRole="header">
          <Text variant="bodyStrong" weight="700">
            {`${weekdays[selected.getDay()] ?? ''}, ${localizeDigits(selected.getDate())} ${monthsLong[selected.getMonth()] ?? ''} ${localizeDigits(selected.getFullYear())}`}
          </Text>
          <View style={styles.spanRow}>
            <Text variant="caption">{`${hijriLocalized(selected, t, language)} · `}</Text>
            <Text variant="caption" script="bn">
              {banglaLabel(selected)}
            </Text>
          </View>
        </View>

        <View style={styles.events}>
          {events.length ? (
            events.map((e) => (
              <EventCard key={e.id} event={e} date={selected} now={now} place={place} />
            ))
          ) : (
            <Text variant="label" weight="400" style={styles.none}>
              {t('calendar.noEvents')}
            </Text>
          )}
          <Touchable
            accessibilityRole="link"
            onPress={() => router.push(monthAmolRoute(selH.year, selH.month))}
            style={[styles.link, { boxShadow: shadows.card }]}
          >
            <View style={styles.linkTile}>
              <Text
                script="ar"
                size={13}
                weight="600"
                color="link"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {HIJRI_MONTHS_AR[selH.month - 1]}
              </Text>
            </View>
            <View style={styles.grow}>
              <Text variant="bodyStrong">
                {t('calendar.monthLink', { month: monthName(selH.month) })}
              </Text>
              <Text variant="caption">{t('calendar.monthLinkSub')}</Text>
            </View>
            <Icon icon={ChevronRight} size={18} color="text2" flipInRTL />
          </Touchable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    body: { paddingHorizontal: t.space.lg, paddingBottom: t.space.xxl },
    todayPill: {
      minHeight: 32,
      paddingHorizontal: t.space.md,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.tint,
      justifyContent: 'center',
      marginEnd: t.space.xs,
    },
    monthRow: {
      marginTop: 6,
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.sm,
    },
    monthBtn: {
      width: t.size.touch,
      height: t.size.touch,
      borderRadius: t.radius.md,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    monthText: { flex: 1, alignItems: 'center', gap: 1 },
    monthTitle: { flexDirection: 'row', alignItems: 'baseline', gap: t.space.sm },
    spanRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'baseline',
    },
    gridCard: {
      marginTop: 10,
      paddingTop: t.space.sm,
      paddingHorizontal: 6,
      paddingBottom: 6,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
    legend: {
      marginTop: 10,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      columnGap: 14,
      rowGap: t.space.xs,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    legendDot: { width: 7, height: 7, borderRadius: t.radius.pill },
    dot_night: { backgroundColor: t.colors.gold },
    dot_fast: { backgroundColor: t.colors.primary },
    dot_holiday: { backgroundColor: t.colors.mutedDot },
    dayHead: { marginTop: t.space.lg, alignItems: 'flex-start' },
    events: { marginTop: 10, gap: 10 },
    none: { paddingVertical: t.space.xs },
    link: {
      minHeight: 56,
      paddingStart: 14,
      paddingEnd: t.space.md,
      paddingVertical: t.space.sm,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    linkTile: {
      width: 40,
      height: 36,
      borderRadius: t.radius.sm,
      backgroundColor: t.colors.tint,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 2,
    },
    grow: { flex: 1 },
  }),
);
