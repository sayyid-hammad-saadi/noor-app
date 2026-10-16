import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CalendarDays, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
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
import { Icon, IconTile, Text, Touchable } from '@/components/ui';
import { CityPickerSheet } from '@/features/location/CityPickerSheet';
import { requestDeviceLocation } from '@/features/location/deviceLocation';
import { useLocation } from '@/features/location/LocationProvider';
import { useNow } from '@/features/prayer/usePrayerTimes';
import { lastRead } from '@/features/quran/data/library';
import { makeStyles, useTheme } from '@/theme';

import { AshraCards } from './components/AshraCards';
import { DuaCard } from './components/DuaCard';
import { FastCards } from './components/FastCards';
import { Lanterns } from './components/Lanterns';
import { LogTodaySheet } from './components/LogTodaySheet';
import { MyRamadanCard } from './components/MyRamadanCard';
import { QadrCard } from './components/QadrCard';
import { RamadanCompactHeader } from './components/RamadanCompactHeader';
import { RamadanHeader } from './components/RamadanHeader';
import { RemindersSheet } from './components/RemindersSheet';
import { IFTAR_DUA } from './content';
import { fastPhase } from './fastTimes';
import { ramadanInfo } from './ramadanCalendar';
import { EMPTY_YEAR, ramadanLog } from './ramadanStore';
import { ashraRoute, ramadanTimetableRoute } from './routes';

/** How far the first cards overlap the gradient header. */
const OVERLAP = 68;
/** Height of the collapsed header below the status bar. */
const COMPACT_HEIGHT = 68;

/** 13a/13b Ramadan home: countdown header, Sehri/Iftar, ashra, dua, Laylatul Qadr, log. */
export default function RamadanHomeScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { shadows } = useTheme();
  const { place, saved, setLocation } = useLocation();
  const now = useNow();

  const minute = Math.floor(now.getTime() / 60_000);
  const info = ramadanInfo(now);
  const fast = useMemo(() => fastPhase(place, new Date(minute * 60_000)), [place, minute]);
  const inRamadan = info.day !== null;
  const yearLog = ramadanLog.use()[info.year] ?? EMPTY_YEAR;
  const last = lastRead.use();

  const [headerHeight, setHeaderHeight] = useState(440);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [compactVisible, setCompactVisible] = useState(false);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const compactAt = Math.max(0, headerHeight - OVERLAP - (insets.top + COMPACT_HEIGHT));
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

  const locateDevice = async () => {
    setPickerOpen(false);
    const result = await requestDeviceLocation();
    if (result.status === 'ok') await setLocation(result.location);
    else toast.show({ message: t(`permissions.location.${result.status}`) });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <GradientHeader tone="ramadan" style={[styles.header, { paddingTop: insets.top }]}>
          {/* Measured so the compact header knows when to take over. */}
          <View
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
            onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
          >
            <View style={styles.skyline}>
              <MosqueSilhouette width={width} opacity={0.08} />
            </View>
            <View style={[styles.lanterns, { top: insets.top - 8 }]}>
              <Lanterns />
            </View>
          </View>
          <RamadanHeader
            now={now}
            info={info}
            fast={fast}
            place={place}
            onLocationPress={() => setPickerOpen(true)}
            onRemindersPress={() => setRemindersOpen(true)}
          />
        </GradientHeader>

        <View style={styles.body}>
          <FastCards now={now} fast={fast} place={place} inRamadan={inRamadan} />
          <AshraCards info={info} onOpen={(key) => router.push(ashraRoute(key))} />
          <Touchable
            accessibilityRole="link"
            onPress={() => router.push(ramadanTimetableRoute)}
            style={[styles.link, { boxShadow: shadows.card }]}
          >
            <IconTile icon={CalendarDays} />
            <View style={styles.grow}>
              <Text variant="bodyStrong">{t('ramadan.timetableLink')}</Text>
              <Text variant="caption">
                {place.shortLabel
                  ? t('ramadan.timetableLinkSub', { place: place.shortLabel })
                  : t('ramadan.timetableLinkSubNoPlace')}
              </Text>
            </View>
            <Icon icon={ChevronRight} size={18} color="text2" flipInRTL />
          </Touchable>
          <DuaCard
            dua={IFTAR_DUA}
            eyebrow={t('ramadan.todayDua')}
            eyebrowTone="goldText"
            shareable
          />
          <QadrCard now={now} info={info} />
          {inRamadan && info.day !== null ? (
            <MyRamadanCard
              fasts={yearLog.fasts.length}
              taraweeh={yearLog.taraweeh.length}
              paras={last ? last.juz - 1 : 0}
              length={info.length}
              onLog={() => setLogOpen(true)}
            />
          ) : null}
        </View>
      </Animated.ScrollView>

      <Animated.View
        style={[styles.compact, compactStyle]}
        pointerEvents={compactVisible ? 'auto' : 'none'}
        aria-hidden={!compactVisible}
      >
        <RamadanCompactHeader
          info={info}
          fast={fast}
          onRemindersPress={() => setRemindersOpen(true)}
        />
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
      <RemindersSheet visible={remindersOpen} onClose={() => setRemindersOpen(false)} />
      {info.day !== null ? (
        <LogTodaySheet
          visible={logOpen}
          onClose={() => setLogOpen(false)}
          year={info.year}
          day={info.day}
        />
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    scrollContent: { flexGrow: 1, paddingBottom: t.space.xxl },
    header: { paddingBottom: OVERLAP + t.space.xl },
    skyline: { position: 'absolute', start: 0, end: 0, bottom: 0, alignItems: 'center' },
    lanterns: { position: 'absolute', end: 6 },
    body: { marginTop: -OVERLAP, paddingHorizontal: t.space.lg, gap: t.space.lg },
    link: {
      minHeight: 60,
      paddingStart: 14,
      paddingEnd: t.space.md,
      paddingVertical: t.space.sm,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    grow: { flex: 1 },
    compact: { position: 'absolute', top: 0, start: 0, end: 0 },
  }),
);
