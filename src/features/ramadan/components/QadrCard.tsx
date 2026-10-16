import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { dayMonthLabel } from '@/lib/dateLabels';
import { makeStyles, useTheme } from '@/theme';

import { QADR_SOURCE } from '../content';
import { sourceLabel } from '../format';
import { qadrNights, type RamadanInfo } from '../ramadanCalendar';

const DAY_MS = 86_400_000;
const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Laylatul Qadr: the five odd nights with the next one highlighted. */
export function QadrCard({ now, info }: { now: Date; info: RamadanInfo }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { language, localizeDigits } = useLanguage();
  const nights = qadrNights(info);
  const today = midnight(now);
  const next = nights.find((n) => midnight(n.evening) >= today) ?? null;
  const days = next ? Math.round((midnight(next.evening) - today) / DAY_MS) : 0;
  const weekdays = t('date.weekdaysShort', { returnObjects: true }) as string[];

  const status = !next
    ? t('ramadan.qadr.over')
    : days === 0
      ? t('ramadan.qadr.tonight', { night: localizeDigits(next.night) })
      : t(next.night === 21 ? 'ramadan.qadr.firstIn' : 'ramadan.qadr.nextIn', {
          n: localizeDigits(days),
        });

  return (
    <View style={styles.card}>
      <Svg width={90} height={90} viewBox="0 0 90 90" style={styles.moon} opacity={0.5}>
        <Circle cx={45} cy={45} r={26} fill={colors.gold} />
        <Circle cx={56} cy={36} r={23} fill={colors.goldTint} />
      </Svg>
      <View style={styles.text}>
        <View style={styles.titleRow}>
          <Text variant="title" accessibilityRole="header">
            {t('ramadan.qadr.title')}
          </Text>
          {language !== 'ar' ? (
            <Text script="quran" size={17} color="goldText" maxFontSizeMultiplier={1.3}>
              لَيْلَةُ الْقَدْرِ
            </Text>
          ) : null}
        </View>
        <Text variant="label" weight="400">
          {`${t('ramadan.qadr.body')} ${status}`}
        </Text>
      </View>
      <View style={styles.nights}>
        {nights.map((n) => {
          const on = next?.night === n.night;
          const date = `${weekdays[n.evening.getDay()] ?? ''} ${localizeDigits(n.evening.getDate())}`;
          return (
            <View
              key={n.night}
              style={[styles.night, on && styles.nightOn]}
              accessible
              accessibilityLabel={t('ramadan.qadr.nightA11y', {
                night: localizeDigits(n.night),
                date: dayMonthLabel(n.evening, t, language),
              })}
            >
              <Text size={15} weight="700" color={on ? 'onGold' : 'text'} tabular>
                {localizeDigits(n.night)}
              </Text>
              <Text
                size={11}
                weight="500"
                color={on ? 'onGold' : 'text2'}
                numberOfLines={1}
                adjustsFontSizeToFit
                maxFontSizeMultiplier={1.2}
              >
                {date}
              </Text>
            </View>
          );
        })}
      </View>
      <Text size={11} weight="500" color="text2" style={styles.text}>
        {t('ramadan.qadr.note', { source: sourceLabel(QADR_SOURCE, t, localizeDigits) })}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    card: {
      overflow: 'hidden',
      padding: t.space.lg,
      gap: t.space.md,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.goldTint,
      borderWidth: 1,
      borderColor: t.colors.goldBorder,
    },
    moon: { position: 'absolute', end: -10, top: -14 },
    text: { gap: t.space.xxs },
    titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: t.space.sm, flexWrap: 'wrap' },
    nights: { flexDirection: 'row', gap: 6 },
    night: {
      flex: 1,
      minWidth: 0,
      minHeight: 56,
      paddingHorizontal: 2,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.goldBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nightOn: { backgroundColor: t.colors.gold, borderColor: t.colors.gold },
  }),
);
