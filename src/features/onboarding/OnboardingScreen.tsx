import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { type ComponentType, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BackHandler,
  I18nManager,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Directions, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Text, Touchable } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { routes } from '@/lib/routes';
import { makeStyles } from '@/theme';

import { PageDots } from './components/PageDots';
import { PrayerArt } from './illustrations/PrayerArt';
import { QuranArt } from './illustrations/QuranArt';
import { RamadanArt } from './illustrations/RamadanArt';

type SlideKey = 'prayer' | 'quran' | 'ramadan';

const SLIDES: readonly { key: SlideKey; Art: ComponentType<{ size: number }> }[] = [
  { key: 'prayer', Art: PrayerArt },
  { key: 'quran', Art: QuranArt },
  { key: 'ramadan', Art: RamadanArt },
];

/** 03a–c Onboarding: three slides with swipe, Skip, Next and Android back. */
export default function OnboardingScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { localizeDigits } = useLanguage();
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const total = SLIDES.length;
  const isLast = index === total - 1;
  const slide = SLIDES[index] ?? SLIDES[0]!;
  // 300px in the design; shrink on narrow or short screens so the copy stays visible.
  const artSize = Math.min(300, width - 48, height * 0.36);

  // First run continues to the permission screens, which mark onboarding as done.
  const finish = useCallback(() => {
    router.replace(routes.afterOnboarding);
  }, [router]);

  const next = useCallback(() => {
    if (isLast) finish();
    else setIndex((i) => Math.min(i + 1, total - 1));
  }, [isLast, finish, total]);

  const previous = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  // Android back steps to the previous slide before leaving the screen.
  useEffect(() => {
    if (index === 0) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      previous();
      return true;
    });
    return () => sub.remove();
  }, [index, previous]);

  // Content flows right-to-left in Arabic, so the "next" swipe direction flips.
  const rtl = I18nManager.isRTL;
  const swipe = Gesture.Race(
    Gesture.Fling()
      .direction(rtl ? Directions.RIGHT : Directions.LEFT)
      .runOnJS(true)
      .onEnd(() => {
        if (!isLast) next();
      }),
    Gesture.Fling()
      .direction(rtl ? Directions.LEFT : Directions.RIGHT)
      .runOnJS(true)
      .onEnd(previous),
  );

  const progress = t('onboarding.progress', {
    current: localizeDigits(index + 1),
    total: localizeDigits(total),
  });

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Text variant="label">{progress}</Text>
        {isLast ? (
          <View style={styles.skip} />
        ) : (
          <Touchable accessibilityRole="button" onPress={finish} style={styles.skip}>
            <Text variant="bodyStrong" color="link" numberOfLines={1}>
              {t('onboarding.skip')}
            </Text>
          </Touchable>
        )}
      </View>

      <GestureDetector gesture={swipe}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View key={slide.key} entering={FadeIn.duration(240)} style={styles.slide}>
            <View style={styles.art}>
              <slide.Art size={artSize} />
            </View>
            <PageDots
              count={total}
              index={index}
              accessibilityLabel={t('onboarding.slideOf', {
                current: localizeDigits(index + 1),
                total: localizeDigits(total),
              })}
            />
            <View style={styles.copy}>
              <Text variant="h1" align="center" accessibilityRole="header">
                {t(`onboarding.slides.${slide.key}.title`)}
              </Text>
              <Text variant="subtle" align="center">
                {t(`onboarding.slides.${slide.key}.body`)}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </GestureDetector>

      <View style={styles.footer}>
        <Button
          size="lg"
          label={isLast ? t('onboarding.getStarted') : t('onboarding.next')}
          icon={ArrowRight}
          iconPosition="end"
          iconFlipInRTL
          onPress={next}
        />
      </View>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    flex: { flex: 1 },
    topBar: {
      minHeight: t.size.topBar,
      paddingHorizontal: t.space.xxl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    skip: {
      minWidth: 64,
      minHeight: t.size.touch,
      paddingHorizontal: t.space.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: { flexGrow: 1, paddingHorizontal: t.space.xxl, paddingBottom: t.space.lg },
    slide: { alignItems: 'center' },
    art: { marginTop: t.space.xl, marginBottom: 28 },
    copy: { marginTop: 28, gap: t.space.md, paddingHorizontal: t.space.sm, alignItems: 'center' },
    footer: { paddingHorizontal: t.space.xxl, paddingBottom: t.space.sm, paddingTop: t.space.md },
  }),
);
