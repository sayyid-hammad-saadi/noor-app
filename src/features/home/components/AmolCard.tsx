import { Check, ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon, Text, Touchable } from '@/components/ui';
import type { Place } from '@/features/location/LocationProvider';
import { clockParts } from '@/features/prayer/formatTime';
import { computeDay } from '@/features/prayer/prayerTimes';
import { useLanguage } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';

import { dayKey, weekdayName } from '../dates';
import { type AmolItemId, SALAWAT_TARGET, useAmol } from '../useAmol';
import { ProgressRing } from './ProgressRing';

/** Start of the last third of the night that contains `now` (Maghrib → next Fajr). */
function lastThird(now: Date, place: Place): { start: Date; end: Date } {
  const day = (d: Date) => computeDay(place.latitude, place.longitude, d, place.countryCode);
  const today = day(now);
  const offset = (n: number) => {
    const d = new Date(now);
    d.setDate(now.getDate() + n);
    return d;
  };
  const [maghrib, fajr] =
    now < today.fajr ? [day(offset(-1)).maghrib, today.fajr] : [today.maghrib, day(offset(1)).fajr];
  const start = new Date(maghrib.getTime() + ((fajr.getTime() - maghrib.getTime()) * 2) / 3);
  return { start, end: fajr };
}

/** Today's Amol checklist (05b). */
export function AmolCard({
  now,
  place,
  onOpenSurah,
}: {
  now: Date;
  place: Place;
  onOpenSurah: () => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { language, localizeDigits } = useLanguage();
  const { done, salawat, toggle, addSalawat } = useAmol(dayKey(now));

  const isFriday = now.getDay() === 5;
  const surah: AmolItemId = isFriday ? 'kahf' : 'mulk';
  const items: AmolItemId[] = ['isha', 'witr', 'tahajjud', surah, 'salawat'];
  const doneCount = items.filter((id) => done[id]).length;
  const night = lastThird(now, place);
  const tahajjudNow = now >= night.start && now < night.end;
  const fmt = (d: Date) => {
    const c = clockParts(d, language, place.timeZone);
    return `${c.time} ${t(`time.${c.period}`)}`;
  };
  const percent = Math.round((doneCount / items.length) * 100);

  return (
    <View style={[styles.card, { boxShadow: shadows.card }]}>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text variant="title" accessibilityRole="header">
            {t('home.amol.title')}
          </Text>
          <Text variant="caption">
            {t('home.amol.progress', {
              day: weekdayName(now, t),
              done: localizeDigits(doneCount),
              total: localizeDigits(items.length),
            })}
          </Text>
        </View>
        <ProgressRing
          progress={doneCount / items.length}
          label={localizeDigits(`${doneCount}/${items.length}`)}
          accessibilityLabel={t('home.amol.ring', { percent: localizeDigits(percent) })}
        />
      </View>

      {items.map((id) => {
        const title = t(`home.amol.items.${id}`);
        const isDone = !!done[id];
        const doneAt = done[id];
        const highlight = id === 'tahajjud' && tahajjudNow && !isDone;

        let caption: string | null = null;
        if (!isDone && id === 'tahajjud')
          caption = tahajjudNow
            ? t('home.amol.items.tahajjudNow')
            : t('home.amol.items.tahajjudLater', { time: fmt(night.start) });
        if (!isDone && id === 'kahf') caption = t('home.amol.items.kahfCaption');
        if (!isDone && id === 'mulk') caption = t('home.amol.items.mulkCaption');

        let trailing: ReactNode = null;
        if (isDone && doneAt && id !== 'salawat') {
          trailing = <Text variant="caption">{fmt(new Date(doneAt))}</Text>;
        } else if (highlight) {
          trailing = (
            <View style={styles.nowChip}>
              <Text variant="caption" weight="700" color="link">
                {t('home.amol.now')}
              </Text>
            </View>
          );
        } else if (id === 'salawat') {
          trailing = (
            <Text variant="caption" weight="600" tabular>
              {localizeDigits(`${salawat}/${SALAWAT_TARGET}`)}
            </Text>
          );
        } else if ((id === 'kahf' || id === 'mulk') && !isDone) {
          trailing = <Icon icon={ChevronRight} size={18} color="text2" flipInRTL />;
        }

        const body = (
          <View style={styles.body}>
            <Text variant="body" weight={isDone ? '500' : '600'} color={isDone ? 'text2' : 'text'}>
              {title}
            </Text>
            {caption ? <Text variant="caption">{caption}</Text> : null}
            {id === 'salawat' ? (
              <View style={styles.bar}>
                <View style={[styles.barFill, { width: `${(salawat / SALAWAT_TARGET) * 100}%` }]} />
              </View>
            ) : null}
          </View>
        );

        return (
          <View key={id} style={styles.row}>
            <Touchable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isDone }}
              accessibilityLabel={
                isDone
                  ? t('home.amol.done', { item: title })
                  : t('home.amol.markDone', { item: title })
              }
              onPress={() => toggle(id)}
              style={styles.checkHit}
            >
              <View
                style={[styles.check, isDone ? styles.checkOn : highlight ? styles.checkNow : null]}
              >
                {isDone ? <Icon icon={Check} size={16} color="onBtn" strokeWidth={2.5} /> : null}
              </View>
            </Touchable>
            {id === 'salawat' && !isDone ? (
              <Touchable
                accessibilityRole="button"
                accessibilityLabel={t('home.amol.addOne', { item: title })}
                onPress={addSalawat}
                style={styles.bodyPress}
              >
                {body}
                {trailing}
              </Touchable>
            ) : (id === 'kahf' || id === 'mulk') && !isDone ? (
              <Touchable accessibilityRole="link" onPress={onOpenSurah} style={styles.bodyPress}>
                {body}
                {trailing}
              </Touchable>
            ) : (
              <View style={styles.bodyPress}>
                {body}
                {trailing}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    card: {
      borderRadius: t.radius.card,
      backgroundColor: t.colors.cardRaised,
      borderWidth: 1,
      borderColor: t.colors.border,
      paddingTop: t.space.lg,
      paddingHorizontal: t.space.lg,
      paddingBottom: t.space.sm,
    },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: t.space.sm,
      gap: t.space.md,
    },
    headText: { flex: 1, gap: t.space.xxs },
    row: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.xs,
      borderTopWidth: 1,
      borderTopColor: t.colors.border,
    },
    checkHit: {
      width: t.size.touch,
      height: t.size.touch,
      marginStart: -t.space.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    check: {
      width: 26,
      height: 26,
      borderRadius: t.radius.pill,
      borderWidth: 2,
      borderColor: t.colors.ctl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkOn: { backgroundColor: t.colors.primary, borderColor: t.colors.primary },
    checkNow: { borderColor: t.colors.primary },
    bodyPress: {
      flex: 1,
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
      paddingVertical: t.space.xs,
    },
    body: { flex: 1, minWidth: 0, gap: 3 },
    nowChip: {
      minHeight: 24,
      paddingHorizontal: 10,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.tint,
      justifyContent: 'center',
    },
    bar: {
      height: 4,
      marginTop: 3,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.surface2,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    barFill: { borderRadius: t.radius.pill, backgroundColor: t.colors.primary },
  }),
);
