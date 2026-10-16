import { Check, MoonStar, Sunset } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { useCountdown } from '@/features/home/components/HomeHeader';
import type { Place } from '@/features/location/LocationProvider';
import { clockLabel } from '@/features/prayer/formatTime';
import { useLanguage } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';

import type { FastPhase } from '../fastTimes';

/** Sehri ends / Iftar cards under the header. The next target gets the gold outline. */
export function FastCards({
  now,
  fast,
  place,
  inRamadan,
}: {
  now: Date;
  fast: FastPhase;
  place: Place;
  inRamadan: boolean;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { language } = useLanguage();
  const countdown = useCountdown(now, fast.target.time);
  const time = (d: Date) => clockLabel(d, language, place.timeZone, t);

  const sehriTime = fast.phase === 'done' ? fast.target.time : fast.today.sehri;
  const sehriStatus =
    fast.phase === 'fasting'
      ? { text: inRamadan ? t('ramadan.cards.endedFasting') : t('ramadan.cards.ended'), done: true }
      : fast.phase === 'done'
        ? { text: t('ramadan.cards.tomorrow', { duration: countdown }), done: false }
        : { text: t('ramadan.cards.in', { duration: countdown }), done: false };
  const iftarStatus =
    fast.phase === 'done'
      ? { text: inRamadan ? t('ramadan.cards.done') : t('ramadan.cards.ended'), done: true }
      : { text: t('ramadan.cards.in', { duration: countdown }), done: false };

  const cards = [
    {
      key: 'sehri',
      icon: MoonStar,
      tone: 'primary' as const,
      title: t('ramadan.cards.sehriEnds'),
      time: time(sehriTime),
      status: sehriStatus,
      target: fast.target.kind === 'sehri',
    },
    {
      key: 'iftar',
      icon: Sunset,
      tone: 'gold' as const,
      title: t('ramadan.cards.iftar'),
      time: time(fast.today.iftar),
      status: fast.phase === 'beforeSehri' ? null : iftarStatus,
      target: fast.target.kind === 'iftar',
    },
  ];

  return (
    <View style={styles.row}>
      {cards.map((c) => (
        <View
          key={c.key}
          style={[styles.card, c.target && styles.cardTarget, { boxShadow: shadows.card }]}
          accessible
        >
          <View style={styles.title}>
            <Icon icon={c.icon} size={18} color={c.tone} />
            <Text variant="label" weight="600" style={styles.shrink}>
              {c.title}
            </Text>
          </View>
          <Text size={24} weight="700" tabular numberOfLines={1} adjustsFontSizeToFit>
            {c.time}
          </Text>
          {c.status ? (
            <View style={styles.status}>
              {c.status.done ? (
                <Icon icon={Check} size={14} color="link" strokeWidth={2.5} />
              ) : null}
              <Text
                variant="caption"
                weight="700"
                color={c.status.done ? 'link' : 'goldText'}
                style={styles.shrink}
              >
                {c.status.text}
              </Text>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: t.space.md },
    card: {
      flex: 1,
      padding: 14,
      gap: t.space.xs,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
    cardTarget: { borderWidth: 1.5, borderColor: t.colors.gold },
    title: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
    status: { flexDirection: 'row', alignItems: 'center', gap: t.space.xs },
    shrink: { flexShrink: 1 },
  }),
);
