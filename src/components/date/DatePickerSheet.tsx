import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/feedback/BottomSheet';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Text } from '@/components/ui/Text';
import { Touchable } from '@/components/ui/Touchable';
import { useLanguage } from '@/i18n';
import { isSameDay, monthYearLabel } from '@/lib/dateLabels';
import { makeStyles } from '@/theme';

/** Month grid in a bottom sheet. Weeks start on Saturday, as in Bangladesh. */
export function DatePickerSheet({
  visible,
  value,
  onClose,
  onSelect,
}: {
  visible: boolean;
  value: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { language, localizeDigits } = useLanguage();
  const [cursor, setCursor] = useState({ year: value.getFullYear(), month: value.getMonth() });
  const today = new Date();

  const weekdays = t('date.weekdaysShort', { returnObjects: true }) as string[];
  const order = [6, 0, 1, 2, 3, 4, 5];
  const first = new Date(cursor.year, cursor.month, 1);
  const lead = (first.getDay() + 1) % 7;
  const days = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);

  const shift = (n: number) =>
    setCursor(({ year, month }) => {
      const d = new Date(year, month + n, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.head}>
        <IconButton
          icon={ChevronLeft}
          flipInRTL
          accessibilityLabel={t('timetable.previous')}
          onPress={() => shift(-1)}
        />
        <Text variant="title" align="center" style={styles.title} accessibilityRole="header">
          {monthYearLabel(cursor.year, cursor.month, t, language)}
        </Text>
        <IconButton
          icon={ChevronRight}
          flipInRTL
          accessibilityLabel={t('timetable.next')}
          onPress={() => shift(1)}
        />
      </View>
      <View style={styles.row}>
        {order.map((d) => (
          <Text
            key={d}
            variant="micro"
            color="text2"
            align="center"
            numberOfLines={1}
            style={styles.cell}
          >
            {weekdays[d] ?? ''}
          </Text>
        ))}
      </View>
      {Array.from({ length: cells.length / 7 }, (_, w) => (
        <View key={w} style={styles.row}>
          {cells.slice(w * 7, w * 7 + 7).map((day, i) => {
            if (!day) return <View key={i} style={styles.cell} />;
            const date = new Date(cursor.year, cursor.month, day);
            const selected = isSameDay(date, value);
            const isToday = isSameDay(date, today);
            return (
              <Touchable
                key={i}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onSelect(date)}
                style={styles.cell}
              >
                <View style={[styles.day, isToday && styles.today, selected && styles.selected]}>
                  <Text
                    variant="bodyStrong"
                    color={selected ? 'onBtn' : isToday ? 'link' : 'text'}
                    tabular
                  >
                    {localizeDigits(day)}
                  </Text>
                </View>
              </Touchable>
            );
          })}
        </View>
      ))}
      <Button
        variant="ghost"
        size="sm"
        label={t('prayerTimes.backToToday')}
        onPress={() => onSelect(new Date())}
      />
    </BottomSheet>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    head: { flexDirection: 'row', alignItems: 'center' },
    title: { flex: 1 },
    row: { flexDirection: 'row' },
    cell: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: t.size.touch },
    day: {
      width: 40,
      height: 40,
      borderRadius: t.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    today: { borderWidth: 1.5, borderColor: t.colors.primary },
    selected: { backgroundColor: t.colors.btn, borderColor: t.colors.btn },
  }),
);
