import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight, MessageCircleQuestionMark, Share2, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { TopBar } from '@/components/layout';
import { Chip, Icon, IconButton, Text, Touchable } from '@/components/ui';
import { quranRoute } from '@/features/quran/routes';
import { useLanguage } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';

import { madhhabPref } from './madhhabStore';
import { getMasalah, type Madhhab, MADHHABS, type Reference } from './masail';
import { answerOf, questionOf, refLabel } from './text';

/** "quran:4:103" → [4, 103] so Quran references open the reader. */
function quranTarget(ref: Reference): [number, number] | null {
  if ('book' in ref || !ref.ref.startsWith('quran:')) return null;
  const [, s, a] = ref.ref.split(':');
  return [Number(s), Number(a)];
}

/** 22c One question: the answer per school, references and a scholar reminder. */
export default function MasailAnswerScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { localizeDigits } = useLanguage();
  const preferred = madhhabPref.use();
  const [picked, setPicked] = useState<Madhhab | null>(null);
  const school = picked ?? preferred;
  const { id } = useLocalSearchParams<{ id: string }>();
  const m = getMasalah(id ?? '');

  if (!m) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <TopBar title={t('masail.title')} />
        <EmptyState icon={MessageCircleQuestionMark} title={t('states.emptyTitle')} />
      </SafeAreaView>
    );
  }

  const question = questionOf(m, t);
  const answer = answerOf(m, school, t);
  const shared = m.schools === 'shared';
  const refs = m.refs.map((r) => refLabel(r, t, localizeDigits));
  const over = shared
    ? MADHHABS.map((s) => t(`masail.schools.${s}`)).join(' · ')
    : t('masail.schoolAnswer', { school: t(`masail.schools.${school}`) });

  const share = () =>
    void Share.share({
      message: [
        question,
        '',
        `${over}: ${answer}`,
        '',
        `${t('masail.references')}: ${refs.join('; ')}`,
        t('masail.consultBody'),
      ].join('\n'),
    });

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        title={`${t(`masail.categories.${m.category}.name`)} · ${t(`masail.tags.${m.tag as 'wudu'}`)}`}
        right={
          <IconButton
            icon={Share2}
            size={22}
            accessibilityLabel={t('masail.share')}
            onPress={share}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text variant="h2" accessibilityRole="header">
          {question}
        </Text>
        {shared ? null : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsWrap}
            contentContainerStyle={styles.chips}
            accessibilityRole="radiogroup"
          >
            {MADHHABS.map((s) => (
              <Chip
                key={s}
                label={t(`masail.schools.${s}`)}
                selected={school === s}
                onPress={() => setPicked(s)}
              />
            ))}
          </ScrollView>
        )}
        <View
          style={[styles.card, shared && styles.cardShared, { boxShadow: shadows.card }]}
          accessibilityLiveRegion="polite"
        >
          <Text variant="overline" color="link">
            {over}
          </Text>
          <Text variant="body" size={15}>
            {answer}
          </Text>
          <Text variant="caption" style={styles.cap}>
            {shared ? t('masail.agree') : t('masail.differ')}
          </Text>
        </View>

        <Text variant="section" style={styles.section} accessibilityRole="header">
          {t('masail.references')}
        </Text>
        <View style={[styles.refs, { boxShadow: shadows.card }]}>
          {m.refs.map((r, i) => {
            const target = quranTarget(r);
            const body = (
              <>
                <View style={styles.n}>
                  <Text variant="micro" weight="700" color="link">
                    {localizeDigits(i + 1)}
                  </Text>
                </View>
                <Text variant="label" weight="500" color="text" style={styles.grow}>
                  {refs[i]}
                </Text>
                {target ? <Icon icon={ChevronRight} size={16} color="text2" flipInRTL /> : null}
              </>
            );
            const rowStyle = [styles.ref, i > 0 && styles.rule];
            return target ? (
              <Touchable
                key={refs[i]}
                accessibilityRole="link"
                onPress={() => router.push(quranRoute(target[0], target[1]))}
                style={rowStyle}
              >
                {body}
              </Touchable>
            ) : (
              <View key={refs[i]} style={rowStyle}>
                {body}
              </View>
            );
          })}
        </View>

        <View style={styles.consult} accessibilityRole="alert">
          <Icon icon={UserRound} size={20} color="goldText" />
          <View style={styles.grow}>
            <Text variant="label" weight="700" color="text">
              {t('masail.consultTitle')}
            </Text>
            <Text variant="caption" color="text">
              {t('masail.consultBody')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    body: { paddingHorizontal: t.size.gutter, paddingTop: t.space.xs, paddingBottom: t.space.xxl },
    chipsWrap: { marginTop: t.space.md, marginHorizontal: -t.size.gutter, flexGrow: 0 },
    chips: { paddingHorizontal: t.size.gutter, gap: t.space.sm },
    card: {
      marginTop: t.space.md,
      padding: t.space.lg,
      gap: t.space.sm,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
    cardShared: { marginTop: t.space.lg },
    cap: { marginTop: t.space.xxs },
    section: { marginTop: t.space.lg, marginBottom: t.space.sm },
    refs: {
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
      overflow: 'hidden',
    },
    ref: {
      minHeight: t.size.touch,
      paddingVertical: 10,
      paddingHorizontal: t.space.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    rule: { borderTopWidth: 1, borderTopColor: t.colors.border },
    n: {
      width: 24,
      height: 24,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.tint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    grow: { flex: 1 },
    consult: {
      marginTop: t.space.lg,
      padding: 14,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.goldTint,
      borderWidth: 1,
      borderColor: t.colors.goldBorder,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
  }),
);
