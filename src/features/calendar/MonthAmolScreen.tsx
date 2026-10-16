import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, ChevronLeft, CirclePlus, MoonStar, Share2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SourceLine } from '@/components/content';
import { useToast } from '@/components/feedback';
import { GradientHeader } from '@/components/layout';
import { Button, GradeChip, Icon, IconButton, Text, Touchable } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { HIJRI_MONTHS_AR } from '@/lib/calendars';
import { dayMonthLabel } from '@/lib/dateLabels';
import { routes } from '@/lib/routes';
import { sourceLabel } from '@/lib/sources';
import { makeStyles, useTheme } from '@/theme';

import { amolKey, myAmol, toggleMyAmol } from './calendarStore';
import { addDays, hijriMonthStart, hijriOf, monthLength } from './hijriMonth';
import { MONTHS, monthKey, type MonthPractice } from './monthContent';
import { calendarRoute } from './routes';

/** 19 Month Amol: fazilat of a Hijri month and practices with hadith grades. */
export default function MonthAmolScreen() {
  const styles = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { language, localizeDigits } = useLanguage();
  const params = useLocalSearchParams<{ month: string; year?: string }>();
  const today = hijriOf(new Date());
  const month = Math.min(12, Math.max(1, Number(params.month) || today.month));
  const year = Number(params.year) || today.year;
  const key = monthKey(month);
  const content = MONTHS[key];
  const added = myAmol.use();

  const hijriMonths = t('date.hijriMonths', { returnObjects: true }) as string[];
  const ordinals = t('calendar.month.ordinals', { returnObjects: true }) as string[];
  const name = hijriMonths[month - 1] ?? '';
  const start = hijriMonthStart({ year, month });
  const length = monthLength({ year, month });
  const end = addDays(start, length - 1);
  const fazilat = t(`calendar.months.${key}`);
  const sources = content.sources.map((s) => sourceLabel(s, t, localizeDigits)).join(' · ');

  const back = () => (router.canGoBack() ? router.back() : router.replace(calendarRoute));

  const share = () =>
    void Share.share({
      message: [
        `${name} ${localizeDigits(year)}`,
        fazilat,
        sources,
        ...content.practices.map((p) => `• ${t(`calendar.practices.${p.id}.title`)}`),
      ]
        .filter(Boolean)
        .join('\n'),
    });

  const body = (p: MonthPractice) => {
    if (p.id !== 'bid') return t(`calendar.practices.${p.id}.body`);
    const dates = [13, 14, 15].map((d) => addDays(start, d - 1));
    return t('calendar.month.bidDates', {
      month: name,
      dates: `${dayMonthLabel(dates[0]!, t, language)} – ${dayMonthLabel(dates[2]!, t, language)}`,
    });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        <GradientHeader style={[styles.header, { paddingTop: insets.top }]}>
          <Text
            script="ar"
            size={72}
            weight="600"
            color="onHeader"
            style={[styles.watermark, { top: insets.top + 40 }]}
            importantForAccessibility="no"
          >
            {HIJRI_MONTHS_AR[month - 1]}
          </Text>
          <View style={styles.topBar}>
            <IconButton
              icon={ChevronLeft}
              color="onHeader"
              flipInRTL
              accessibilityLabel={t('calendar.month.back')}
              onPress={back}
            />
            <IconButton
              icon={Share2}
              size={20}
              color="onHeader"
              accessibilityLabel={t('calendar.month.share')}
              onPress={share}
            />
          </View>
          <View style={styles.headText}>
            <Text variant="caption" weight="700" color="onHeader" style={styles.eyebrow}>
              {[
                t('calendar.month.eyebrow', { ordinal: ordinals[month - 1] ?? '' }),
                content.sacred ? t('calendar.month.sacred') : null,
              ]
                .filter(Boolean)
                .join(' · ')
                .toUpperCase()}
            </Text>
            <Text size={24} weight="700" color="onHeader" accessibilityRole="header">
              {`${name} ${localizeDigits(year)}`}
            </Text>
            <Text variant="label" weight="500" color="onHeader" style={styles.soft}>
              {t('calendar.month.span', {
                n: localizeDigits(length),
                from: dayMonthLabel(start, t, language),
                to: dayMonthLabel(end, t, language),
              })}
            </Text>
          </View>
        </GradientHeader>

        <View style={styles.sheet}>
          <View style={[styles.card, { boxShadow: shadows.card }]}>
            <Text variant="caption" weight="700" style={styles.eyebrow}>
              {t('calendar.month.fazilat')}
            </Text>
            {content.arabic && language !== 'ar' ? (
              <Text script="quran" size={24} align="right">
                {content.arabic}
              </Text>
            ) : null}
            <Text>{fazilat}</Text>
            {sources ? <Text variant="caption">{sources}</Text> : null}
          </View>

          <View style={styles.legend} accessibilityLabel={t('calendar.month.grades')}>
            {(['sahih', 'hasan', 'daif'] as const).map((g) => (
              <View key={g} style={styles.legendItem}>
                <GradeChip grade={g} />
                <Text variant="micro" weight="400" color="text2">
                  {t(`calendar.month.gradeMeaning.${g}`)}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.card, styles.list, { boxShadow: shadows.card }]}>
            <Text variant="title" accessibilityRole="header" style={styles.listTitle}>
              {t('calendar.month.amolTitle', { month: name })}
            </Text>
            {content.practices.map((p) => {
              const title = t(`calendar.practices.${p.id}.title`);
              const isAdded = added.includes(amolKey(key, p.id));
              return (
                <View key={p.id} style={styles.item}>
                  <View style={styles.itemText}>
                    <Text variant="body" weight="600">
                      {title}
                    </Text>
                    {p.arabic ? (
                      <Text script="quran" size={18} align="right">
                        {p.arabic}
                      </Text>
                    ) : null}
                    <Text variant="label" weight="400">
                      {body(p)}
                    </Text>
                    <View style={styles.src}>
                      <SourceLine source={p.source} />
                    </View>
                  </View>
                  {p.schedule ? (
                    <Touchable
                      accessibilityRole="switch"
                      accessibilityState={{ checked: isAdded }}
                      accessibilityLabel={t(
                        isAdded ? 'calendar.month.remove' : 'calendar.month.add',
                        {
                          item: title,
                        },
                      )}
                      onPress={() => {
                        const nowAdded = toggleMyAmol(key, p.id);
                        toast.show({
                          message: t(
                            nowAdded ? 'calendar.month.addedToast' : 'calendar.month.removedToast',
                          ),
                        });
                      }}
                      style={styles.add}
                    >
                      {isAdded ? (
                        <View style={styles.addedDot}>
                          <Icon icon={Check} size={14} color="onBtn" strokeWidth={3} />
                        </View>
                      ) : (
                        <Icon icon={CirclePlus} size={22} color="link" />
                      )}
                    </Touchable>
                  ) : (
                    <View style={styles.add} />
                  )}
                </View>
              );
            })}
          </View>

          {key === 'ramadan' ? (
            <Button
              label={t('calendar.month.openRamadan')}
              icon={MoonStar}
              variant="secondary"
              onPress={() => router.navigate(routes.ramadan)}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    scroll: { flexGrow: 1 },
    header: { paddingBottom: 24 + t.space.xl },
    watermark: { position: 'absolute', end: 22, opacity: 0.16 },
    topBar: {
      minHeight: t.size.topBar,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headText: { paddingHorizontal: t.size.gutter, gap: 2 },
    eyebrow: { letterSpacing: 0.8, opacity: 0.9 },
    soft: { opacity: 0.88 },
    sheet: {
      flex: 1,
      marginTop: -24,
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
      gap: 6,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: 10,
      rowGap: 6,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    list: { paddingVertical: 0, paddingEnd: t.space.sm, gap: 0 },
    listTitle: { paddingTop: 14, paddingBottom: t.space.xs },
    item: {
      paddingVertical: t.space.md,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: t.colors.border,
    },
    itemText: { flex: 1, minWidth: 0, gap: 3 },
    src: { marginTop: 3 },
    add: {
      width: t.size.touch,
      height: t.size.touch,
      marginTop: -6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addedDot: {
      width: 24,
      height: 24,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);
