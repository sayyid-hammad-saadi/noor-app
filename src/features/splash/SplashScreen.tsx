import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { GradientHeader, Logo, MosqueSilhouette } from '@/components/layout';
import { Text } from '@/components/ui';
import { isOnboardingDone } from '@/features/onboarding/onboardingState';
import { useLanguage } from '@/i18n';
import { routes } from '@/lib/routes';
import { makeStyles, useTheme } from '@/theme';

/** Minimum time the brand splash stays up, so it reads as intentional. */
const MIN_SPLASH_MS = 1400;

/** Sparkles from the design, positioned as fractions of a 390×844 frame. */
const STARS = [
  { x: 62, y: 132, size: 10, delay: 200 },
  { x: 300, y: 104, size: 7, delay: 1100 },
  { x: 330, y: 236, size: 12, delay: 2000 },
  { x: 96, y: 262, size: 6, delay: 1600 },
  { x: 40, y: 470, size: 8, delay: 700 },
  { x: 340, y: 520, size: 9, delay: 2600 },
  { x: 196, y: 168, size: 6, delay: 3000 },
  { x: 252, y: 596, size: 8, delay: 1300 },
] as const;

/** 01 Splash: brand moment, then routes to language, onboarding or home. */
export default function SplashScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { hasChosenLanguage, script } = useLanguage();
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      isOnboardingDone(),
      new Promise((resolve) => setTimeout(resolve, MIN_SPLASH_MS)),
    ]).then(([onboarded]) => {
      if (cancelled) return;
      if (!hasChosenLanguage) router.replace(routes.language);
      else if (!onboarded) router.replace(routes.onboarding);
      else router.replace(routes.home);
    });
    return () => {
      cancelled = true;
    };
  }, [hasChosenLanguage, router]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <GradientHeader style={StyleSheet.absoluteFill}>
        {STARS.map((s) => (
          <Sparkle
            key={`${s.x}-${s.y}`}
            left={(s.x / 390) * width}
            top={(s.y / 844) * height}
            size={s.size}
            delay={s.delay}
          />
        ))}

        <View style={styles.skyline} pointerEvents="none">
          <View style={styles.backLayer}>
            <MosqueSilhouette width={width} variant="back" opacity={0.07} />
          </View>
          <MosqueSilhouette width={width} variant="front" opacity={0.14} />
        </View>

        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.center}
          accessible
          accessibilityRole="header"
          accessibilityLabel={`${t('appName')}. ${t('tagline')}`}
        >
          <Logo size={120} />
          <View style={styles.wordmark}>
            {/* The brand lockup stays "Noor · نور" in every language. */}
            <Text script="latin" variant="display" color="onHeader" style={styles.noor}>
              Noor
            </Text>
            <Text script="ar" size={18} weight="500" color="onHeader" style={styles.noorAr}>
              نور
            </Text>
          </View>
          <Text
            variant="label"
            weight="500"
            color="onHeader"
            align="center"
            style={[styles.tagline, script === 'latin' && styles.taglineLatin]}
          >
            {t('tagline')}
          </Text>
        </Animated.View>
      </GradientHeader>
    </View>
  );
}

function Sparkle({
  left,
  top,
  size,
  delay,
}: {
  left: number;
  top: number;
  size: number;
  delay: number;
}) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
    return () => cancelAnimation(progress);
  }, [delay, progress, reduceMotion]);

  const animated = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0.6 : 0.2 + 0.75 * progress.value,
    transform: [{ scale: reduceMotion ? 1 : 0.7 + 0.3 * progress.value }],
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left, top }, animated]} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M12 2l1.8 8.2L22 12l-8.2 1.8L12 22l-1.8-8.2L2 12l8.2-1.8z"
          fill={colors.onHeader}
        />
      </Svg>
    </Animated.View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.hdr1 },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: t.space.xl,
      paddingHorizontal: t.space.xxl,
      // Sit slightly above centre, as in the design.
      paddingBottom: 120,
    },
    wordmark: { alignItems: 'center', gap: 6 },
    noor: { lineHeight: 44 },
    noorAr: { opacity: 0.85 },
    tagline: { opacity: 0.92 },
    taglineLatin: { letterSpacing: 1.04, textTransform: 'uppercase' },
    skyline: { position: 'absolute', start: 0, end: 0, bottom: 0, alignItems: 'center' },
    backLayer: {
      position: 'absolute',
      bottom: 64,
      transform: [{ scale: 1.25 }],
      transformOrigin: 'bottom',
    },
  }),
);
