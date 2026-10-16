import { Check, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Icon, Text, Touchable } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';

import { type Juz, JUZS } from '../data/surahs';

/** Khatam progress card plus the 30-para grid. `current` is the para being read (or null). */
export function ParaGrid({
  current,
  onOpen,
  onContinue,
}: {
  current: number | null;
  onOpen: (juz: Juz) => void;
  onContinue: () => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { colors, shadows } = useTheme();
  const { localizeDigits } = useLanguage();
  const done = current ? current - 1 : 0;
  const percent = Math.round((done / 30) * 100);
  const r = 14;
  const c = 2 * Math.PI * r;

  return (
    <>
      <Touchable
        accessibilityRole="button"
        disabled={!current}
        onPress={onContinue}
        style={[styles.khatam, { boxShadow: shadows.card }]}
      >
        <Svg
          width={36}
          height={36}
          viewBox="0 0 36 36"
          accessibilityLabel={t('quran.khatamLabel', { percent })}
        >
          <Circle cx={18} cy={18} r={r} fill="none" stroke={colors.surface2} strokeWidth={4} />
          {done > 0 ? (
            <Circle
              cx={18}
              cy={18}
              r={r}
              fill="none"
              stroke={colors.primary}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={`${(done / 30) * c} ${c}`}
              transform="rotate(-90 18 18)"
            />
          ) : null}
        </Svg>
        <View style={styles.khatamText}>
          <Text variant="bodyStrong">
            {t('quran.khatam', { percent: localizeDigits(percent) })}
          </Text>
          <Text variant="caption">
            {current
              ? t('quran.khatamCaption', {
                  done: localizeDigits(done),
                  current: localizeDigits(current),
                })
              : t('quran.khatamStart')}
          </Text>
        </View>
        {current ? <Icon icon={ChevronRight} size={18} color="text2" flipInRTL /> : null}
      </Touchable>

      <View style={styles.grid}>
        {JUZS.map((j) => {
          const state = !current
            ? 'next'
            : j.number < current
              ? 'done'
              : j.number === current
                ? 'now'
                : 'next';
          return (
            <View key={j.number} style={styles.cellWrap}>
              <Touchable
                accessibilityRole="button"
                accessibilityLabel={
                  state === 'done'
                    ? t('quran.paraDone', { n: j.number })
                    : state === 'now'
                      ? t('quran.paraCurrent', { n: j.number })
                      : t('quran.para', { n: j.number })
                }
                onPress={() => onOpen(j)}
                style={[styles.cell, styles[state]]}
              >
                <Text
                  size={17}
                  weight="700"
                  tabular
                  color={state === 'now' ? 'onBtn' : state === 'done' ? 'link' : 'text'}
                  maxFontSizeMultiplier={1.2}
                >
                  {localizeDigits(j.number)}
                </Text>
                <Text
                  script="ar"
                  size={11}
                  numberOfLines={1}
                  color={state === 'now' ? 'onBtn' : 'text2'}
                  maxFontSizeMultiplier={1}
                  style={styles.paraName}
                >
                  {j.nameAr}
                </Text>
                {state === 'done' ? (
                  <View style={styles.check}>
                    <Icon icon={Check} size={9} color="onBtn" strokeWidth={4} />
                  </View>
                ) : null}
              </Touchable>
            </View>
          );
        })}
      </View>
    </>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    khatam: {
      marginTop: t.space.lg,
      paddingVertical: t.space.md,
      paddingHorizontal: 14,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    khatamText: { flex: 1, gap: 1 },
    grid: {
      marginTop: t.space.lg,
      marginHorizontal: -4,
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: t.space.sm,
    },
    cellWrap: { width: '20%', paddingHorizontal: 4 },
    cell: {
      minHeight: 64,
      borderRadius: t.radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      paddingHorizontal: 4,
    },
    paraName: { maxWidth: '100%' },
    done: { backgroundColor: t.colors.tint },
    now: { backgroundColor: t.colors.btn },
    next: { backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border },
    check: {
      position: 'absolute',
      top: 5,
      end: 5,
      width: 14,
      height: 14,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);
