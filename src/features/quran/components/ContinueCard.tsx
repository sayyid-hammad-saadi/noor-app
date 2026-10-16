import { ArrowRight, Bookmark } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { GradientHeader } from '@/components/layout';
import { Icon, Text, Touchable } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { dayMonthLabel, isSameDay } from '@/lib/dateLabels';
import { makeStyles } from '@/theme';

import type { LastRead } from '../data/library';
import { getSurah, surahName } from '../data/surahs';

/** Gradient "Continue reading" card for the last-read position. */
export function ContinueCard({ last, onPress }: { last: LastRead; onPress: () => void }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { language, localizeDigits } = useLanguage();
  const surah = getSurah(last.surah);
  const at = new Date(last.at);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const when = isSameDay(at, now)
    ? t('quran.lastReadToday')
    : isSameDay(at, yesterday)
      ? t('quran.lastReadYesterday')
      : t('quran.lastReadOn', { date: dayMonthLabel(at, t, language) });
  const progress = last.ayah / surah.ayahCount;

  return (
    <Touchable accessibilityRole="button" onPress={onPress} style={styles.wrap}>
      <GradientHeader style={styles.card}>
        <View style={styles.text}>
          <View style={styles.kicker}>
            <Icon icon={Bookmark} size={14} color="onHeader" />
            <Text variant="caption" weight="600" color="onHeader" style={styles.soft}>
              {t('quran.continueReading')}
            </Text>
          </View>
          <Text variant="h2" color="onHeader" numberOfLines={1}>
            {surahName(surah, language)}
          </Text>
          <Text variant="label" weight="500" color="onHeader" style={styles.soft}>
            {t('quran.continueMeta', {
              ayah: localizeDigits(last.ayah),
              juz: localizeDigits(last.juz),
              when,
            })}
          </Text>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${Math.min(1, progress) * 100}%` }]} />
          </View>
        </View>
        <View style={styles.side}>
          {language !== 'ar' ? (
            <Text script="quran" size={26} color="onHeader" maxFontSizeMultiplier={1.2}>
              {surah.nameAr}
            </Text>
          ) : null}
          <View style={styles.go}>
            <Icon icon={ArrowRight} size={20} color="hlFg" strokeWidth={2} flipInRTL />
          </View>
        </View>
      </GradientHeader>
    </Touchable>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    wrap: { marginTop: t.space.lg, borderRadius: t.radius.card, overflow: 'hidden' },
    card: { padding: t.space.lg, flexDirection: 'row', alignItems: 'center', gap: t.space.md },
    text: { flex: 1, gap: t.space.xs },
    kicker: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    soft: { opacity: 0.9 },
    bar: {
      marginTop: 6,
      height: 4,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.onHeaderChip,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    barFill: { borderRadius: t.radius.pill, backgroundColor: t.colors.onHeader },
    side: { alignItems: 'center', gap: 6 },
    go: {
      width: t.size.touch,
      height: t.size.touch,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.hlBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);
