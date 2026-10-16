import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ChevronLeft, ChevronRight, Share } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/feedback';
import { TopBar } from '@/components/layout';
import { Icon, IconButton, Text, Touchable } from '@/components/ui';
import { useLocation } from '@/features/location/LocationProvider';
import { useLanguage } from '@/i18n';
import { hijriSpan, isSameDay, monthYearLabel } from '@/lib/dateLabels';
import { makeStyles, palettes, useTheme } from '@/theme';

import { clockParts } from './formatTime';
import { monthTable } from './prayerTimes';
import { timetableHtml } from './timetablePdf';

const COLUMNS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

/** 07 Monthly Timetable with month navigation and PDF export. */
export default function TimetableScreen() {
  const styles = useStyles();
  const { t } = useTranslation();
  const toast = useToast();
  const { colors, shadows } = useTheme();
  const { language, localizeDigits } = useLanguage();
  const { place } = useLocation();
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [sharing, setSharing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const rows = useMemo(
    () => monthTable(place.latitude, place.longitude, cursor.year, cursor.month, place.countryCode),
    [place.latitude, place.longitude, place.countryCode, cursor.year, cursor.month],
  );
  const todayIndex = rows.findIndex((r) => isSameDay(r.date, today));
  const weekdays = t('date.weekdaysShort', { returnObjects: true }) as string[];
  const monthTitle = monthYearLabel(cursor.year, cursor.month, t, language);
  const subtitle = [hijriSpan(cursor.year, cursor.month, t, language), place.shortLabel]
    .filter(Boolean)
    .join(' · ');

  const shift = (n: number) =>
    setCursor(({ year, month }) => {
      const d = new Date(year, month + n, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const share = async () => {
    setSharing(true);
    try {
      const html = timetableHtml({
        title: t('timetable.pdfTitle', { month: monthTitle, place: place.label ?? '' }),
        subtitle,
        rows,
        todayIndex,
        t,
        language,
        timeZone: place.timeZone,
        colors: palettes.light,
      });
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf',
          dialogTitle: monthTitle,
        });
      }
    } catch {
      toast.show({ message: t('timetable.shareFailed') });
    } finally {
      setSharing(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={[styles.header, { boxShadow: shadows.sticky }]}>
        <TopBar
          title={t('timetable.title')}
          right={
            <IconButton
              icon={Share}
              size={22}
              accessibilityLabel={t('timetable.share')}
              disabled={sharing}
              onPress={() => void share()}
            />
          }
        />
        <View style={styles.monthRow}>
          <Touchable
            accessibilityRole="button"
            accessibilityLabel={t('timetable.previous')}
            onPress={() => shift(-1)}
            style={styles.monthBtn}
          >
            <Icon icon={ChevronLeft} size={20} flipInRTL />
          </Touchable>
          <View style={styles.monthText}>
            <Text variant="title" align="center" accessibilityRole="header">
              {monthTitle}
            </Text>
            <Text variant="caption" align="center" numberOfLines={2}>
              {subtitle}
            </Text>
          </View>
          <Touchable
            accessibilityRole="button"
            accessibilityLabel={t('timetable.next')}
            onPress={() => shift(1)}
            style={styles.monthBtn}
          >
            <Icon icon={ChevronRight} size={20} flipInRTL />
          </Touchable>
        </View>
        <View
          style={styles.colHead}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Text variant="micro" weight="700" color="text2" align="center" style={styles.dateCol}>
            {t('timetable.date')}
          </Text>
          {COLUMNS.map((c) => (
            <Text
              key={c}
              variant="micro"
              weight="700"
              color="text2"
              align="center"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              maxFontSizeMultiplier={1.2}
              style={styles.col}
            >
              {t(`prayers.${c}`)}
            </Text>
          ))}
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((r, i) => {
          const isToday = i === todayIndex;
          const isFriday = r.date.getDay() === 5;
          const label = isToday ? t('date.today') : (weekdays[r.date.getDay()] ?? '');
          return (
            <View
              key={i}
              style={[styles.row, isToday && styles.rowToday]}
              onLayout={
                isToday
                  ? (e) =>
                      scrollRef.current?.scrollTo({
                        y: Math.max(0, e.nativeEvent.layout.y - 160),
                        animated: false,
                      })
                  : undefined
              }
              accessible
              accessibilityLabel={`${localizeDigits(r.date.getDate())} ${label}: ${COLUMNS.map(
                (c) =>
                  `${t(`prayers.${c}`)} ${clockParts(r.times[c], language, place.timeZone).time}`,
              ).join(', ')}`}
            >
              <View style={styles.dateCol}>
                <Text
                  variant="label"
                  weight="700"
                  align="center"
                  tabular
                  maxFontSizeMultiplier={1.2}
                >
                  {localizeDigits(r.date.getDate())}
                </Text>
                <Text
                  size={10}
                  weight={isToday || isFriday ? '700' : '500'}
                  color={isToday || isFriday ? 'link' : 'text2'}
                  align="center"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  maxFontSizeMultiplier={1.2}
                >
                  {label}
                </Text>
              </View>
              {COLUMNS.map((c) => (
                <Text
                  key={c}
                  variant="label"
                  weight={isToday ? '700' : '400'}
                  color={c === 'sunrise' ? 'text2' : 'text'}
                  align="center"
                  tabular
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                  maxFontSizeMultiplier={1.2}
                  style={styles.col}
                >
                  {clockParts(r.times[c], language, place.timeZone).time}
                </Text>
              ))}
            </View>
          );
        })}
      </ScrollView>
      <LinearGradient
        pointerEvents="none"
        colors={[`${colors.bg}00`, colors.bg]}
        style={styles.fade}
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
    },
    monthRow: {
      minHeight: 48,
      paddingHorizontal: t.space.md,
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
    monthText: { flex: 1, alignItems: 'center' },
    colHead: {
      marginTop: t.space.sm,
      marginHorizontal: t.space.md,
      minHeight: 36,
      borderRadius: t.radius.sm,
      backgroundColor: t.colors.surface2,
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateCol: { width: 48, alignItems: 'center' },
    col: { flex: 1, minWidth: 0, paddingHorizontal: 1 },
    list: { paddingHorizontal: t.space.lg, paddingTop: t.space.xs, paddingBottom: 64, gap: 2 },
    row: {
      minHeight: 38,
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
      borderRadius: t.radius.sm,
    },
    fade: { position: 'absolute', start: 0, end: 0, bottom: 0, height: 64 },
  }),
);
