import { LinearGradient } from 'expo-linear-gradient';
import type { TFunction } from 'i18next';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ChevronDown, MapPin, Share } from 'lucide-react-native';
import { Fragment, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/feedback';
import { TopBar } from '@/components/layout';
import { Icon, IconButton, Text, Touchable } from '@/components/ui';
import { CityPickerSheet } from '@/features/location/CityPickerSheet';
import { requestDeviceLocation } from '@/features/location/deviceLocation';
import { useLocation } from '@/features/location/LocationProvider';
import { clockParts } from '@/features/prayer/formatTime';
import { useNow } from '@/features/prayer/usePrayerTimes';
import { useLanguage } from '@/i18n';
import { isSameDay } from '@/lib/dateLabels';
import { makeStyles, palettes, useTheme } from '@/theme';

import { ASHRA_AR } from './content';
import { fastTimes, SEHRI_MARGIN_MIN } from './fastTimes';
import { ramadanTimetableHtml } from './ramadanPdf';
import { ASHRAS, ashraDays, ramadanDate, ramadanInfo } from './ramadanCalendar';

/** "Feb – Mar 2027" for the Gregorian months a Ramadan spans. */
function gregorianSpan(
  first: Date,
  last: Date,
  t: TFunction,
  digits: (n: number) => string,
): string {
  const months = t('date.monthsShort', { returnObjects: true }) as string[];
  const m = (d: Date) => months[d.getMonth()] ?? '';
  if (first.getFullYear() !== last.getFullYear())
    return `${m(first)} ${digits(first.getFullYear())} – ${m(last)} ${digits(last.getFullYear())}`;
  if (first.getMonth() === last.getMonth()) return `${m(first)} ${digits(first.getFullYear())}`;
  return `${m(first)} – ${m(last)} ${digits(last.getFullYear())}`;
}

/** 14 Ramadan Timetable: Sehri, Iftar, Fajr and Maghrib for every day, grouped by ashra. */
export default function RamadanTimetableScreen() {
  const styles = useStyles();
  const { t } = useTranslation();
  const toast = useToast();
  const { colors, shadows } = useTheme();
  const { language, localizeDigits } = useLanguage();
  const { place, saved, setLocation } = useLocation();
  const now = useNow(60_000);
  const info = ramadanInfo(now);
  const [sharing, setSharing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const rows = Array.from({ length: info.length }, (_, i) => {
    const date = ramadanDate(info, i + 1);
    return { day: i + 1, date, times: fastTimes(place, date) };
  });

  const weekdays = t('date.weekdaysShort', { returnObjects: true }) as string[];
  const months = t('date.monthsShort', { returnObjects: true }) as string[];
  const first = rows[0]?.date ?? info.start;
  const last = rows[rows.length - 1]?.date ?? info.start;
  const subtitle = t('ramadan.timetable.subtitle', {
    year: localizeDigits(info.year),
    span: gregorianSpan(first, last, t, (n) => localizeDigits(n)),
  });
  const time = (d: Date) => clockParts(d, language, place.timeZone).time;
  const dateLabel = (d: Date) => `${localizeDigits(d.getDate())} ${months[d.getMonth()] ?? ''}`;
  const sectionTitle = (day: number) => {
    const key = ASHRAS.find((k) => ashraDays(k, info.length)[0] === day);
    if (!key) return null;
    const [from, to] = ashraDays(key, info.length);
    return {
      key,
      name: t('ramadan.timetable.ashraHead', {
        name: t(`ramadan.ashra.${key}.name`),
        meaning: t(`ramadan.ashra.${key}.meaning`),
      }),
      days: t('ramadan.ashraDays', { from: localizeDigits(from), to: localizeDigits(to) }),
    };
  };

  const share = async () => {
    setSharing(true);
    try {
      const html = ramadanTimetableHtml({
        title: t('ramadan.timetable.pdfTitle', {
          year: localizeDigits(info.year),
          place: place.label ?? '',
        }),
        subtitle,
        note: `${t('ramadan.timetable.margin', { n: localizeDigits(SEHRI_MARGIN_MIN) })} · ${t('ramadan.moonNote')}`,
        head: [
          t('ramadan.timetable.day'),
          t('ramadan.timetable.sehri'),
          t('ramadan.timetable.iftar'),
          t('prayers.fajr'),
          t('prayers.maghrib'),
        ],
        rows: rows.map((r) => {
          const section = sectionTitle(r.day);
          return {
            day: localizeDigits(r.day),
            date: `${weekdays[r.date.getDay()] ?? ''} ${dateLabel(r.date)}`,
            sehri: time(r.times.sehri),
            iftar: time(r.times.iftar),
            fajr: time(r.times.fajr),
            maghrib: time(r.times.maghrib),
            today: isSameDay(r.date, now),
            section: section ? `${section.name} · ${section.days}` : undefined,
          };
        }),
        language,
        colors: palettes.light,
      });
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf',
          dialogTitle: t('ramadan.timetable.title'),
        });
      }
    } catch {
      toast.show({ message: t('timetable.shareFailed') });
    } finally {
      setSharing(false);
    }
  };

  const locateDevice = async () => {
    setPickerOpen(false);
    const result = await requestDeviceLocation();
    if (result.status === 'ok') await setLocation(result.location);
    else toast.show({ message: t(`permissions.location.${result.status}`) });
  };

  const placeLabel = place.shortLabel ?? place.label ?? t('location.setLocation');

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={[styles.header, { boxShadow: shadows.sticky }]}>
        <TopBar
          title={t('ramadan.timetable.title')}
          subtitle={subtitle}
          right={
            <IconButton
              icon={Share}
              size={22}
              accessibilityLabel={t('ramadan.timetable.share')}
              disabled={sharing}
              onPress={() => void share()}
            />
          }
        />
        <View style={styles.chips}>
          <Touchable
            accessibilityRole="button"
            accessibilityLabel={t('location.change', { place: placeLabel })}
            onPress={() => setPickerOpen(true)}
            style={styles.placeChip}
          >
            <Icon icon={MapPin} size={16} color="primary" />
            <Text variant="label" weight="600" color="text" numberOfLines={1} style={styles.shrink}>
              {placeLabel}
            </Text>
            <Icon icon={ChevronDown} size={14} color="text2" />
          </Touchable>
          <View style={styles.noteChip}>
            <Text variant="label" weight="600" color="link" numberOfLines={2}>
              {t('ramadan.timetable.margin', { n: localizeDigits(SEHRI_MARGIN_MIN) })}
            </Text>
          </View>
        </View>
        <View
          style={styles.colHead}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Text variant="micro" weight="700" color="text2" style={styles.dayCol}>
            {t('ramadan.timetable.day')}
          </Text>
          {(
            [
              [t('ramadan.timetable.sehri'), 'text'],
              [t('ramadan.timetable.iftar'), 'text'],
              [t('prayers.fajr'), 'text2'],
              [t('prayers.maghrib'), 'text2'],
            ] as const
          ).map(([label, color]) => (
            <Text
              key={label}
              variant="micro"
              weight="700"
              color={color}
              align="center"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              maxFontSizeMultiplier={1.2}
              style={styles.col}
            >
              {label}
            </Text>
          ))}
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((r) => {
          const isToday = isSameDay(r.date, now);
          const isPast = !isToday && r.date < now;
          const qadr = r.day >= 20 && r.day % 2 === 0 && r.day < info.length;
          const section = sectionTitle(r.day);
          const tone = isPast ? 'text2' : 'text';
          return (
            <Fragment key={r.day}>
              {section ? (
                <View style={styles.section} accessibilityRole="header">
                  <View style={styles.sectionName}>
                    {language !== 'ar' ? (
                      <Text script="ar" size={14} color="link">
                        {ASHRA_AR[section.key]}
                      </Text>
                    ) : null}
                    <Text variant="caption" weight="700" color="text" style={styles.shrink}>
                      {section.name}
                    </Text>
                  </View>
                  <Text variant="caption" weight="700">
                    {section.days}
                  </Text>
                </View>
              ) : null}
              <View
                style={[styles.row, isToday && styles.rowToday]}
                onLayout={
                  isToday
                    ? (e) =>
                        scrollRef.current?.scrollTo({
                          y: Math.max(0, e.nativeEvent.layout.y - 120),
                          animated: false,
                        })
                    : undefined
                }
                accessible
                accessibilityLabel={`${t('ramadan.timetable.rowA11y', {
                  day: localizeDigits(r.day),
                  date: dateLabel(r.date),
                  sehri: time(r.times.sehri),
                  iftar: time(r.times.iftar),
                  fajr: time(r.times.fajr),
                  maghrib: time(r.times.maghrib),
                })}${qadr ? `. ${t('ramadan.timetable.qadrDot')}` : ''}`}
              >
                <View style={[styles.dayCol, styles.dayCell]}>
                  <Text size={15} weight="700" color={tone} tabular style={styles.dayNum}>
                    {localizeDigits(r.day)}
                  </Text>
                  <View style={styles.shrink}>
                    <Text
                      size={11}
                      weight={isToday ? '700' : '500'}
                      color={isToday ? 'link' : 'text2'}
                      numberOfLines={1}
                      maxFontSizeMultiplier={1.2}
                    >
                      {isToday ? t('date.today') : (weekdays[r.date.getDay()] ?? '')}
                    </Text>
                    <Text
                      size={11}
                      weight="500"
                      color="text2"
                      numberOfLines={1}
                      maxFontSizeMultiplier={1.2}
                    >
                      {dateLabel(r.date)}
                    </Text>
                  </View>
                </View>
                {(['sehri', 'iftar', 'fajr', 'maghrib'] as const).map((c) => (
                  <View key={c} style={[styles.col, styles.cell]}>
                    <Text
                      variant="label"
                      size={14}
                      weight={c === 'sehri' || c === 'iftar' || isToday ? '700' : '400'}
                      color={tone}
                      tabular
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                      maxFontSizeMultiplier={1.2}
                    >
                      {time(r.times[c])}
                    </Text>
                    {c === 'iftar' && qadr ? <View style={styles.qadrDot} /> : null}
                  </View>
                ))}
              </View>
            </Fragment>
          );
        })}
        <Text variant="caption" align="center" style={styles.footnote}>
          {t('ramadan.moonNote')}
        </Text>
      </ScrollView>
      <LinearGradient
        pointerEvents="none"
        colors={[`${colors.bg}00`, colors.bg]}
        style={styles.fade}
      />

      <CityPickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedId={saved?.source === 'city' ? saved.cityId : undefined}
        onUseDevice={() => void locateDevice()}
        onSelect={async (city) => {
          setPickerOpen(false);
          await setLocation({ source: 'city', cityId: city.id });
        }}
      />
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    header: {
      backgroundColor: t.colors.bg,
      paddingHorizontal: t.space.xs,
      paddingBottom: t.space.sm,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.edge,
      zIndex: 2,
      gap: t.space.sm,
    },
    chips: { paddingHorizontal: t.space.md, flexDirection: 'row', gap: t.space.sm },
    shrink: { flexShrink: 1 },
    placeChip: {
      maxWidth: '45%',
      minHeight: 36,
      paddingHorizontal: t.space.md,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    noteChip: {
      flexShrink: 1,
      minHeight: 36,
      paddingHorizontal: t.space.md,
      paddingVertical: t.space.xs,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.tint,
      justifyContent: 'center',
    },
    colHead: {
      marginHorizontal: t.space.md,
      minHeight: 36,
      borderRadius: t.radius.sm,
      backgroundColor: t.colors.surface2,
      flexDirection: 'row',
      alignItems: 'center',
    },
    dayCol: { width: 84, paddingStart: t.space.md },
    col: { flex: 1, minWidth: 0, paddingHorizontal: 1 },
    list: { paddingHorizontal: t.space.lg, paddingTop: t.space.xs, paddingBottom: 64, gap: 2 },
    section: {
      minHeight: 34,
      marginTop: t.space.sm,
      marginBottom: t.space.xxs,
      paddingHorizontal: 10,
      borderRadius: t.radius.sm,
      backgroundColor: t.colors.surface2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.space.sm,
    },
    sectionName: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm, flexShrink: 1 },
    row: {
      minHeight: 42,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
      paddingVertical: 2,
    },
    rowToday: {
      backgroundColor: t.colors.tint,
      borderWidth: 1.5,
      borderColor: t.colors.primary,
      borderRadius: t.radius.md,
    },
    dayCell: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm, paddingStart: 6 },
    dayNum: { minWidth: 26 },
    cell: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 },
    qadrDot: {
      width: 6,
      height: 6,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.gold,
    },
    footnote: { marginTop: t.space.lg },
    fade: { position: 'absolute', start: 0, end: 0, bottom: 0, height: 64 },
  }),
);
