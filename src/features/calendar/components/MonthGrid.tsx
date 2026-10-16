import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Text, Touchable } from '@/components/ui';
import { localizeDigits, useLanguage } from '@/i18n';
import { BANGLA_MONTHS, toBangla } from '@/lib/calendars';
import { isSameDay } from '@/lib/dateLabels';
import { makeStyles, useTheme } from '@/theme';

import { type EventKind, eventsOn } from '../events';
import { addDays, hijriMonthStart, type HijriMonth, hijriOf, monthLength } from '../hijriMonth';

/** Saturday-first week, as printed calendars in Bangladesh. Indices into Sun-first arrays. */
export const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5] as const;

export type Cell = {
  date: Date;
  hijriDay: number;
  out: boolean;
  kinds: EventKind[];
};

export function monthCells(month: HijriMonth, countryCode: string | null): Cell[] {
  const start = hijriMonthStart(month);
  const length = monthLength(month);
  const leading = (start.getDay() + 1) % 7; // Saturday → 0
  const total = Math.ceil((leading + length) / 7) * 7;
  return Array.from({ length: total }, (_, i) => {
    const date = addDays(start, i - leading);
    const out = i < leading || i >= leading + length;
    const kinds = out ? [] : [...new Set(eventsOn(date, countryCode).map((e) => e.kind))];
    return { date, hijriDay: hijriOf(date).day, out, kinds };
  });
}

const DOT_ORDER: readonly EventKind[] = ['night', 'fast', 'holiday'];

/** 7-column month of Hijri days with Bangla and Gregorian dates and event dots. */
export const MonthGrid = memo(function MonthGrid({
  cells,
  selected,
  today,
  onSelect,
  monthName,
}: {
  cells: Cell[];
  selected: Date;
  today: Date;
  onSelect: (cell: Cell) => void;
  monthName: (month: number) => string;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const weekdays = t('date.weekdaysShort', { returnObjects: true }) as string[];
  const months = t('date.monthsShort', { returnObjects: true }) as string[];
  const dot = { night: colors.gold, fast: colors.primary, holiday: colors.mutedDot } as const;

  return (
    <View>
      <View
        style={styles.week}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {WEEK_ORDER.map((d) => (
          <Text
            key={d}
            variant="micro"
            weight="700"
            color={d === 5 ? 'link' : 'text2'}
            align="center"
            numberOfLines={1}
            style={styles.col}
          >
            {weekdays[d] ?? ''}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((c) => {
          const isSel = isSameDay(c.date, selected);
          const isToday = isSameDay(c.date, today);
          const bangla = toBangla(c.date);
          const bn =
            bangla.day === 1
              ? `${localizeDigits(1, 'bn')} ${BANGLA_MONTHS[bangla.month - 1] ?? ''}`
              : localizeDigits(bangla.day, 'bn');
          const g = c.date.getDate();
          const en =
            g === 1
              ? `${localizeDigits(1, language)} ${months[c.date.getMonth()] ?? ''}`
              : localizeDigits(g, language);
          const fri = c.date.getDay() === 5;
          const fg = isSel ? 'onBtn' : undefined;
          const h = hijriOf(c.date);
          return (
            <Touchable
              key={c.date.getTime()}
              accessibilityRole="button"
              accessibilityState={{ selected: isSel }}
              accessibilityLabel={`${localizeDigits(h.day, language)} ${monthName(h.month)}, ${weekdays[c.date.getDay()] ?? ''} ${localizeDigits(g, language)} ${months[c.date.getMonth()] ?? ''}${isToday ? `, ${t('calendar.cellToday')}` : ''}`}
              onPress={() => onSelect(c)}
              style={[
                styles.cell,
                c.out && styles.out,
                isSel ? styles.sel : isToday ? styles.today : null,
              ]}
            >
              <Text
                size={17}
                weight="700"
                tabular
                color={fg ?? (fri ? 'link' : 'text')}
                maxFontSizeMultiplier={1.15}
                style={styles.hijri}
              >
                {localizeDigits(c.hijriDay, language)}
              </Text>
              <Text
                script="bn"
                size={10}
                color={fg ?? 'text2'}
                numberOfLines={1}
                maxFontSizeMultiplier={1}
                style={styles.small}
              >
                {bn}
              </Text>
              <Text
                size={9.5}
                weight="500"
                color={fg ?? 'text2'}
                numberOfLines={1}
                maxFontSizeMultiplier={1}
                style={styles.small}
              >
                {en}
              </Text>
              <View style={styles.dots}>
                {DOT_ORDER.filter((k) => c.kinds.includes(k)).map((k) => (
                  <View
                    key={k}
                    style={[
                      styles.dot,
                      { backgroundColor: isSel && k === 'fast' ? colors.onBtn : dot[k] },
                    ]}
                  />
                ))}
              </View>
            </Touchable>
          );
        })}
      </View>
    </View>
  );
});

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    week: { minHeight: 22, flexDirection: 'row', alignItems: 'center' },
    col: { flex: 1 },
    grid: { marginTop: t.space.xs, flexDirection: 'row', flexWrap: 'wrap', rowGap: 3 },
    cell: {
      width: `${100 / 7}%`,
      minHeight: 58,
      paddingVertical: 3,
      borderRadius: t.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    out: { opacity: 0.38 },
    sel: { backgroundColor: t.colors.btn },
    today: { borderColor: t.colors.primary },
    hijri: { lineHeight: 20 },
    small: { lineHeight: 13 },
    dots: { height: 5, marginTop: 2, flexDirection: 'row', gap: 2 },
    dot: { width: 5, height: 5, borderRadius: t.radius.pill },
  }),
);
