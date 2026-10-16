import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Hourglass } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { useToast } from '@/components/feedback';
import { GradientHeader, MosqueSilhouette } from '@/components/layout';
import { SectionHeader } from '@/components/ui';
import { CityPickerSheet } from '@/features/location/CityPickerSheet';
import { requestDeviceLocation } from '@/features/location/deviceLocation';
import { useLocation } from '@/features/location/LocationProvider';
import { usePrayerTimes } from '@/features/prayer/usePrayerTimes';
import { routes } from '@/lib/routes';
import { makeStyles, useTheme } from '@/theme';

import { AmolCard } from './components/AmolCard';
import { CompactHeader } from './components/CompactHeader';
import { DailyCard } from './components/DailyCard';
import { type FeatureKey, FeatureGrid } from './components/FeatureGrid';
import { HomeHeader } from './components/HomeHeader';

/** How far the sheet's rounded top overlaps the gradient header. */
const SHEET_OVERLAP = 30;
/** Height of the collapsed header below the status bar. */
const COMPACT_HEIGHT = 74;

/** 05a/05b Home: gradient header with prayer times and a scrolling sheet. */
export default function HomeScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const { shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { today, current, next, now, place } = usePrayerTimes();
  const { saved, setLocation } = useLocation();
  const state = { today, current, next };

  const [headerHeight, setHeaderHeight] = useState(420);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [compactVisible, setCompactVisible] = useState(false);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  // The compact header takes over once the sheet reaches it.
  const compactAt = Math.max(0, headerHeight - (insets.top + COMPACT_HEIGHT) - SHEET_OVERLAP);
  const headerContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, compactAt * 0.7], [1, 0], Extrapolation.CLAMP),
  }));
  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [compactAt - 40, compactAt], [0, 1], Extrapolation.CLAMP),
  }));
  useAnimatedReaction(
    () => scrollY.value > compactAt - 20,
    (visible, previous) => {
      if (visible !== previous) scheduleOnRN(setCompactVisible, visible);
    },
    [compactAt],
  );

  const comingSoon = useCallback(
    () => toast.show({ message: t('home.comingSoon'), icon: Hourglass }),
    [toast, t],
  );

  const onFeature = (key: FeatureKey) => {
    if (key === 'more') router.navigate(routes.explore);
    else comingSoon();
  };

  const locateDevice = async () => {
    setPickerOpen(false);
    const result = await requestDeviceLocation();
    if (result.status === 'ok') await setLocation(result.location);
    else toast.show({ message: t(`permissions.location.${result.status}`) });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Fixed gradient behind the scrolling content. */}
      <GradientHeader style={[styles.gradient, { height: headerHeight + SHEET_OVERLAP }]}>
        <View style={styles.skyline} pointerEvents="none">
          <MosqueSilhouette width={width} opacity={0.1} />
        </View>
      </GradientHeader>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[{ paddingTop: insets.top }, headerContentStyle]}
          onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
        >
          <HomeHeader
            now={now}
            state={state}
            place={place}
            onLocationPress={() => setPickerOpen(true)}
            onBellPress={comingSoon}
          />
          <View style={styles.headerSpacer} />
        </Animated.View>

        <View
          style={[
            styles.sheet,
            { minHeight: height - insets.top - COMPACT_HEIGHT, boxShadow: shadows.sheet },
          ]}
        >
          <View style={styles.grab} />
          <SectionHeader
            kind="content"
            title={t('home.allFeatures')}
            action={{ label: t('home.seeAll'), onPress: () => router.navigate(routes.explore) }}
          />
          <FeatureGrid onPress={onFeature} />
          <View style={styles.cards}>
            <DailyCard onReadInContext={comingSoon} />
            <AmolCard now={now} place={place} onOpenSurah={comingSoon} />
          </View>
        </View>
      </Animated.ScrollView>

      <Animated.View
        style={[styles.compact, compactStyle]}
        pointerEvents={compactVisible ? 'auto' : 'none'}
        accessibilityElementsHidden={!compactVisible}
        importantForAccessibility={compactVisible ? 'auto' : 'no-hide-descendants'}
      >
        <CompactHeader now={now} state={state} place={place} onBellPress={comingSoon} />
      </Animated.View>

      <CityPickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedId={saved?.source === 'city' ? saved.cityId : undefined}
        onUseDevice={() => void locateDevice()}
        onSelect={async (city) => {
          setPickerOpen(false);
          await setLocation({ source: 'city', cityId: city.id });
        }}
      />
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.surface },
    gradient: { position: 'absolute', top: 0, start: 0, end: 0 },
    skyline: {
      position: 'absolute',
      start: 0,
      end: 0,
      bottom: SHEET_OVERLAP,
      alignItems: 'center',
    },
    scrollContent: { flexGrow: 1 },
    headerSpacer: { height: t.space.xl },
    sheet: {
      marginTop: -SHEET_OVERLAP,
      backgroundColor: t.colors.surface,
      borderTopStartRadius: t.radius.sheet,
      borderTopEndRadius: t.radius.sheet,
      borderTopWidth: 1,
      borderColor: t.colors.edge,
      paddingTop: 10,
      paddingHorizontal: t.size.gutter,
      paddingBottom: t.space.xxl,
    },
    grab: {
      alignSelf: 'center',
      width: 36,
      height: 5,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.border,
    },
    cards: { marginTop: 22, gap: t.space.lg },
    compact: { position: 'absolute', top: 0, start: 0, end: 0 },
  }),
);
