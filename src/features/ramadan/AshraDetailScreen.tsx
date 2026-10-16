import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Check, ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SourceLine } from '@/components/content';
import { GradientHeader } from '@/components/layout';
import { Icon, IconButton, Text, Touchable } from '@/components/ui';
import { useNow } from '@/features/prayer/usePrayerTimes';
import { useLanguage } from '@/i18n';
import { dayKey, gregorianLabel } from '@/lib/dateLabels';
import { routes } from '@/lib/routes';
import { makeStyles, useTheme } from '@/theme';

import { DuaCard } from './components/DuaCard';
import { ASHRA_AMOL, ASHRA_AR, ASHRA_DUAS, ASHRA_HADITH, type AmolItem } from './content';
import { ASHRAS, type AshraKey, ashraDays, ramadanDate, ramadanInfo } from './ramadanCalendar';
import { EMPTY_DAY, ramadanAmol, updateAmolDay } from './ramadanStore';

/** How far the content sheet overlaps the header. */
const OVERLAP = 18;

/** 15 Ashra detail: fazilat, today's amol checklist and three duas. */
export default function AshraDetailScreen() {
  const styles = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { language, localizeDigits } = useLanguage();
  const params = useLocalSearchParams<{ ashra: string }>();
  const key: AshraKey = ASHRAS.includes(params.ashra as AshraKey)
    ? (params.ashra as AshraKey)
    : 'rahmat';
  const now = useNow();
  const info = ramadanInfo(now);
  const [from, to] = ashraDays(key, info.length);
  const total = to - from + 1;
  const position =
    info.day === null || info.day < from ? 'upcoming' : info.day > to ? 'past' : 'current';
  const n = position === 'current' && info.day !== null ? info.day - from + 1 : 0;
  const days = t('ramadan.ashraDays', { from: localizeDigits(from), to: localizeDigits(to) });

  const today = dayKey(now);
  const amolDay = ramadanAmol.use()[today] ?? EMPTY_DAY;
  const amol = ASHRA_AMOL[key];
  const doneCount = amol.filter((a) => amolDay.done[a.id]).length;
  const duas = ASHRA_DUAS[key];

  const back = () => (router.canGoBack() ? router.back() : router.navigate(routes.ramadan));

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        <GradientHeader tone="ramadan" style={[styles.header, { paddingTop: insets.top }]}>
          <Text
            script="ar"
            size={64}
            weight="600"
            color="headerGold"
            style={[styles.watermark, { top: insets.top + 36 }]}
            importantForAccessibility="no"
            accessibilityElementsHidden
          >
            {ASHRA_AR[key]}
          </Text>
          <View style={styles.topBar}>
            <IconButton
              icon={ChevronLeft}
              color="onHeader"
              flipInRTL
              accessibilityLabel={t('actions.back')}
              onPress={back}
            />
          </View>
          <View style={styles.headText}>
            <Text variant="caption" weight="700" color="headerGold" style={styles.eyebrow}>
              {t('ramadan.detail.eyebrow', {
                ordinal: t(`ramadan.ashra.${key}.ordinal`),
                days,
              }).toUpperCase()}
            </Text>
            <View style={styles.titleRow}>
              <Text size={24} weight="700" color="onHeader" accessibilityRole="header">
                {t(`ramadan.ashra.${key}.name`)}
              </Text>
              {language !== 'ar' ? (
                <Text script="ar" size={20} weight="500" color="onHeader" style={styles.soft}>
                  {ASHRA_AR[key]}
                </Text>
              ) : null}
            </View>
            <Text variant="label" weight="500" color="onHeader" style={styles.soft}>
              {t(`ramadan.ashra.${key}.long`)}
            </Text>
            <View
              style={styles.segments}
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel={
                position === 'current'
                  ? t('ramadan.detail.progressA11y', {
                      n: localizeDigits(n),
                      total: localizeDigits(total),
                    })
                  : undefined
              }
            >
              {Array.from({ length: total }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.segment,
                    position === 'past' || i + 1 < n
                      ? styles.segDone
                      : i + 1 === n
                        ? styles.segNow
                        : null,
                  ]}
                />
              ))}
            </View>
            <Text
              variant="caption"
              weight="600"
              color="onHeader"
              style={[styles.soft, styles.caption]}
            >
              {position === 'current' && info.day !== null
                ? t('ramadan.detail.today', {
                    day: localizeDigits(info.day),
                    n: localizeDigits(n),
                    total: localizeDigits(total),
                  })
                : position === 'past'
                  ? t('ramadan.detail.past')
                  : t('ramadan.detail.upcoming', {
                      from: localizeDigits(from),
                      date: gregorianLabel(ramadanDate(info, from), t, language),
                    })}
            </Text>
          </View>
        </GradientHeader>

        <View style={styles.sheet}>
          <View style={[styles.card, { boxShadow: shadows.card }]}>
            <Text variant="caption" weight="700" style={styles.eyebrow}>
              {t('ramadan.detail.fazilat')}
            </Text>
            <Text>{t('ramadan.detail.hadith')}</Text>
            <SourceLine source={ASHRA_HADITH} />
            <Text variant="caption" weight="400">
              {t('ramadan.detail.caution')}
            </Text>
          </View>

          <View style={[styles.card, styles.amolCard, { boxShadow: shadows.card }]}>
            <View style={styles.amolHead}>
              <Text variant="title" accessibilityRole="header" style={styles.shrink}>
                {t('ramadan.detail.amolTitle')}
              </Text>
              <Text variant="caption" weight="600">
                {t('ramadan.detail.amolProgress', {
                  done: localizeDigits(doneCount),
                  total: localizeDigits(amol.length),
                })}
              </Text>
            </View>
            {amol.map((item, i) => (
              <AmolRow
                key={item.id}
                item={item}
                first={i === 0}
                done={!!amolDay.done[item.id]}
                count={amolDay.counts[item.id] ?? 0}
                day={today}
              />
            ))}
          </View>

          {duas.map((dua, i) => (
            <DuaCard
              key={dua.id}
              dua={dua}
              eyebrow={t('ramadan.detail.duaOf', {
                n: localizeDigits(i + 1),
                total: localizeDigits(duas.length),
              })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function AmolRow({
  item,
  first,
  done,
  count,
  day,
}: {
  item: AmolItem;
  first: boolean;
  done: boolean;
  count: number;
  day: string;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { localizeDigits } = useLanguage();
  const title = t(`ramadan.content.${item.id as 'taraweeh'}`);
  const target = item.count;

  const toggle = () =>
    updateAmolDay(day, (d) => {
      const nextDone = { ...d.done };
      if (nextDone[item.id]) delete nextDone[item.id];
      else nextDone[item.id] = true;
      const counts = target ? { ...d.counts, [item.id]: nextDone[item.id] ? target : 0 } : d.counts;
      return { done: nextDone, counts };
    });

  const addOne = () =>
    updateAmolDay(day, (d) => {
      const value = Math.min(target ?? 0, (d.counts[item.id] ?? 0) + 1);
      const nextDone = { ...d.done };
      if (target && value >= target) nextDone[item.id] = true;
      return { done: nextDone, counts: { ...d.counts, [item.id]: value } };
    });

  const body = (
    <>
      <View style={styles.amolBody}>
        <Text variant="body" weight="600" color={done ? 'text2' : 'text'}>
          {title}
        </Text>
        <SourceLine source={item.source} />
      </View>
      {target ? (
        <Text variant="caption" weight="700" color="link" tabular>
          {localizeDigits(`${count}/${target}`)}
        </Text>
      ) : null}
    </>
  );

  return (
    <View style={[styles.amolRow, !first && styles.amolRule]}>
      <Touchable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={
          done ? t('home.amol.done', { item: title }) : t('home.amol.markDone', { item: title })
        }
        onPress={toggle}
        style={styles.checkHit}
      >
        <View style={[styles.check, done && styles.checkOn]}>
          {done ? <Icon icon={Check} size={15} color="onBtn" strokeWidth={2.5} /> : null}
        </View>
      </Touchable>
      {target && !done ? (
        <Touchable
          accessibilityRole="button"
          accessibilityLabel={t('ramadan.detail.count', { item: title })}
          onPress={addOne}
          style={styles.amolPress}
        >
          {body}
        </Touchable>
      ) : (
        <View style={styles.amolPress}>{body}</View>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    scroll: { flexGrow: 1 },
    header: { paddingBottom: OVERLAP + t.space.xl },
    watermark: { position: 'absolute', end: 18, opacity: 0.22 },
    topBar: { minHeight: t.size.topBar, justifyContent: 'center', paddingStart: 10 },
    headText: { paddingHorizontal: t.size.gutter },
    eyebrow: { letterSpacing: 0.6 },
    titleRow: {
      marginTop: t.space.xxs,
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: t.space.sm,
      flexWrap: 'wrap',
    },
    soft: { opacity: 0.85 },
    caption: { marginTop: 6 },
    shrink: { flexShrink: 1 },
    segments: { marginTop: 14, flexDirection: 'row', gap: t.space.xs },
    segment: {
      flex: 1,
      height: 6,
      borderRadius: 9,
      backgroundColor: t.colors.onHeaderChip,
    },
    segDone: { backgroundColor: t.colors.onHeader },
    segNow: { backgroundColor: t.colors.gold },
    sheet: {
      flex: 1,
      marginTop: -OVERLAP,
      paddingTop: t.space.lg,
      paddingHorizontal: t.space.lg,
      gap: t.space.md,
      backgroundColor: t.colors.bg,
      borderTopStartRadius: 24,
      borderTopEndRadius: 24,
    },
    card: {
      paddingVertical: 14,
      paddingHorizontal: t.space.lg,
      gap: t.space.sm,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
    amolCard: { paddingTop: t.space.md, paddingBottom: t.space.xs, paddingEnd: t.space.md, gap: 0 },
    amolHead: {
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.space.sm,
    },
    amolRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: t.space.xs },
    amolRule: { borderTopWidth: 1, borderTopColor: t.colors.border },
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
    amolPress: {
      flex: 1,
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
      paddingVertical: t.space.sm,
    },
    amolBody: { flex: 1, minWidth: 0, gap: 3 },
  }),
);
