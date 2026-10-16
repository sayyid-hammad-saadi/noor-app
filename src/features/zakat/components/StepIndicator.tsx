import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

const STEPS = ['nisab', 'assets', 'liabilities', 'result'] as const;

/** 1 Nisab · 2 Assets · 3 Liabilities · 4 Result, with done steps ticked. */
export function StepIndicator({ step }: { step: 1 | 2 | 3 | 4 }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { localizeDigits } = useLanguage();
  return (
    <View
      style={styles.root}
      accessible
      accessibilityLabel={`${t('zakat.stepOf', {
        n: localizeDigits(step),
        total: localizeDigits(STEPS.length),
      })}: ${t(`zakat.steps.${STEPS[step - 1] ?? 'nisab'}`)}`}
    >
      <View style={styles.track} />
      <View style={[styles.track, styles.trackDone, { width: `${((step - 1) / 4) * 100}%` }]} />
      {STEPS.map((key, i) => {
        const n = i + 1;
        const state = n < step ? 'done' : n === step ? 'now' : 'next';
        return (
          <View key={key} style={styles.step}>
            <View style={[styles.circle, styles[state]]}>
              {state === 'done' ? (
                <Icon icon={Check} size={14} color="onBtn" strokeWidth={3} />
              ) : (
                <Text
                  size={12}
                  weight="700"
                  color={state === 'now' ? 'link' : 'text2'}
                  maxFontSizeMultiplier={1.2}
                >
                  {localizeDigits(n)}
                </Text>
              )}
            </View>
            <Text
              size={11}
              weight="600"
              color={state === 'done' ? 'link' : state === 'now' ? 'text' : 'text2'}
              align="center"
              numberOfLines={1}
              adjustsFontSizeToFit
              maxFontSizeMultiplier={1.3}
            >
              {t(`zakat.steps.${key}`)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { marginTop: t.space.md, flexDirection: 'row' },
    track: {
      position: 'absolute',
      start: '12.5%',
      end: '12.5%',
      top: 13,
      height: 2,
      backgroundColor: t.colors.border,
    },
    trackDone: { end: undefined, backgroundColor: t.colors.primary },
    step: { flex: 1, alignItems: 'center', gap: 6 },
    circle: {
      width: 28,
      height: 28,
      borderRadius: t.radius.pill,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    done: { backgroundColor: t.colors.primary, borderColor: t.colors.primary },
    now: { backgroundColor: t.colors.tint, borderColor: t.colors.primary },
    next: { backgroundColor: t.colors.bg, borderColor: t.colors.border },
  }),
);
