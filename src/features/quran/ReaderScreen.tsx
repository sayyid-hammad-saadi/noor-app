import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Search, Type } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, StyleSheet, View, type ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState, Skeleton } from '@/components/feedback';
import { GradientHeader, TopBar } from '@/components/layout';
import { MiniPlayer } from '@/components/media';
import { IconButton, Text, Touchable } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles, ThemeOverride, useTheme } from '@/theme';

import { useQuranAudio } from './audio/QuranAudioProvider';
import { AyahActionsSheet } from './components/AyahActionsSheet';
import { AyahItem } from './components/AyahItem';
import { NoteSheet } from './components/NoteSheet';
import { ReaderSearchSheet } from './components/ReaderSearchSheet';
import { ReadingSettingsSheet } from './components/ReadingSettingsSheet';
import { lastRead, readingPrefs, markPageRead } from './data/library';
import type { Ayah } from './data/quranApi';
import { BISMILLAH, getSurah, surahMeaning, surahName } from './data/surahs';
import { playerRoute, quranRoute } from './routes';
import { useSurahContent } from './useSurahContent';

/** 10a Quran reader (wrapped in the chosen reading theme). */
export default function ReaderScreen() {
  const prefs = readingPrefs.use();
  return (
    <ThemeOverride theme={prefs.theme}>
      <Reader />
    </ThemeOverride>
  );
}

function Reader() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { scheme } = useTheme();
  const { language, localizeDigits } = useLanguage();
  const params = useLocalSearchParams<{ surah: string; ayah?: string }>();
  const surah = getSurah(Number(params.surah) || 1);
  const targetAyah = Number(params.ayah) || null;
  const prefs = readingPrefs.use();
  const audio = useQuranAudio();
  const { state, retry } = useSurahContent(surah.number);
  const listRef = useRef<FlatList<Ayah>>(null);
  const tabsRef = useRef<ScrollView>(null);

  const [topAyah, setTopAyah] = useState<Ayah | null>(null);
  const [selected, setSelected] = useState<Ayah | null>(null);
  const [noteAyah, setNoteAyah] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const ayahs = useMemo(() => (state.status === 'ready' ? state.content.ayahs : []), [state]);
  const playingAyah =
    audio.track && audio.track.surah === surah.number ? audio.track.index + 1 : null;

  const scrollTo = useCallback(
    (ayah: number, animated = true) => {
      const index = Math.max(0, Math.min(ayahs.length - 1, ayah - 1));
      listRef.current?.scrollToIndex({ index, animated, viewPosition: 0.2 });
    },
    [ayahs.length],
  );

  // Jump to the requested ayah once the surah has loaded.
  const jumped = useRef<string | null>(null);
  useEffect(() => {
    const key = `${surah.number}:${targetAyah}`;
    if (!ayahs.length || !targetAyah || jumped.current === key) return;
    jumped.current = key;
    setTimeout(() => scrollTo(targetAyah, false), 50);
  }, [ayahs.length, targetAyah, surah.number, scrollTo]);

  // Follow the recitation.
  useEffect(() => {
    if (playingAyah && ayahs.length) scrollTo(playingAyah);
  }, [playingAyah, ayahs.length, scrollTo]);

  // Remember the reading position.
  // FlatList requires a stable callback; the state initializer creates it once.
  const [onViewable] = useState(() => ({ viewableItems }: { viewableItems: ViewToken<Ayah>[] }) => {
    const first = viewableItems.find((v) => v.isViewable)?.item;
    if (!first) return;
    setTopAyah(first);
    lastRead.set({
      surah: surahOf(first),
      ayah: first.number,
      juz: first.juz,
      page: first.page,
      at: Date.now(),
    });
    markPageRead(first.page);
  });

  const subtitle = topAyah
    ? t('quran.paraPage', { juz: localizeDigits(topAyah.juz), page: localizeDigits(topAyah.page) })
    : surahName(surah, language);

  const neighbours = useMemo(() => {
    const from = Math.max(1, Math.min(surah.number - 3, 114 - 6));
    return Array.from({ length: 7 }, (_, i) => getSurah(from + i));
  }, [surah.number]);

  const meaning = surahMeaning(surah, language);
  const track = audio.track;
  const trackSurah = track ? getSurah(track.surah) : null;
  const progress =
    track && audio.status.duration > 0
      ? (track.index + Math.min(1, audio.status.currentTime / audio.status.duration)) / track.total
      : track
        ? track.index / track.total
        : 0;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <TopBar
        title={t('quran.title')}
        subtitle={subtitle}
        right={
          <>
            <IconButton
              icon={Search}
              size={22}
              accessibilityLabel={t('quran.searchInSurah')}
              onPress={() => setSearchOpen(true)}
            />
            <IconButton
              icon={Type}
              size={22}
              accessibilityLabel={t('quran.readingSettings')}
              onPress={() => setSettingsOpen(true)}
            />
          </>
        }
      />

      <View style={styles.tabsBar}>
        <ScrollView
          ref={tabsRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
          accessibilityLabel={t('quran.surahs')}
        >
          {neighbours.map((s) => {
            const current = s.number === surah.number;
            return (
              <Touchable
                key={s.number}
                accessibilityRole="tab"
                accessibilityState={{ selected: current }}
                onPress={() => !current && router.replace(quranRoute(s.number))}
                // Bring the current surah's tab into view.
                onLayout={
                  current
                    ? (e) =>
                        tabsRef.current?.scrollTo({
                          x: Math.max(0, e.nativeEvent.layout.x - 48),
                          animated: false,
                        })
                    : undefined
                }
                style={[styles.tab, current && styles.tabOn]}
              >
                <Text
                  variant="body"
                  weight={current ? '700' : '500'}
                  color={current ? 'link' : 'text2'}
                  numberOfLines={1}
                >
                  {surahName(s, language)}
                </Text>
              </Touchable>
            );
          })}
        </ScrollView>
      </View>

      <GradientHeader style={styles.surahBar}>
        <View style={styles.surahName}>
          <Text variant="bodyStrong" weight="700" color="onHeader" numberOfLines={1}>
            {surahName(surah, language)}
          </Text>
          {meaning ? (
            <Text variant="caption" color="onHeader" numberOfLines={1} style={styles.soft}>
              {meaning}
            </Text>
          ) : null}
        </View>
        <Text variant="label" weight="600" color="onHeader">
          {t('quran.surahHeaderMeta', {
            count: localizeDigits(surah.ayahCount),
            place: t(surah.meccan ? 'quran.meccan' : 'quran.medinan'),
          })}
        </Text>
      </GradientHeader>

      {state.status === 'error' ? (
        <View style={styles.flex}>
          <ErrorState
            title={t('quran.loadError')}
            body={t('quran.loadErrorBody')}
            onRetry={retry}
          />
        </View>
      ) : state.status === 'loading' ? (
        <ReaderSkeleton />
      ) : (
        <FlatList
          ref={listRef}
          style={styles.flex}
          data={ayahs}
          keyExtractor={(a) => String(a.number)}
          extraData={`${playingAyah}-${prefs.arabicSize}-${prefs.transliteration}-${prefs.bangla}-${prefs.english}`}
          renderItem={({ item }) => (
            <AyahItem
              ayah={item}
              prefs={prefs}
              playing={item.number === playingAyah}
              onPress={setSelected}
            />
          )}
          ListHeaderComponent={
            surah.number !== 1 && surah.number !== 9 ? (
              <View style={styles.bismillah}>
                <Text script="quran" size={26} align="center" maxFontSizeMultiplier={1.3}>
                  {BISMILLAH}
                </Text>
              </View>
            ) : null
          }
          onViewableItemsChanged={onViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          onScrollToIndexFailed={(info) => {
            listRef.current?.scrollToOffset({
              offset: info.averageItemLength * info.index,
              animated: false,
            });
            setTimeout(
              () =>
                listRef.current?.scrollToIndex({
                  index: info.index,
                  animated: false,
                  viewPosition: 0.2,
                }),
              120,
            );
          }}
          initialNumToRender={8}
          windowSize={11}
        />
      )}

      {track && trackSurah ? (
        <MiniPlayer
          title={audio.reciter.name[language]}
          subtitle={t('quran.player.ayahOf', {
            surah: surahName(trackSurah, language),
            ayah: localizeDigits(track.index + 1),
            total: localizeDigits(track.total),
          })}
          initials={audio.reciter.initials}
          progress={progress}
          playing={audio.status.playing}
          onTogglePlay={audio.toggle}
          onPress={() => router.push(playerRoute)}
          expandLabel={t('quran.player.open')}
        />
      ) : null}

      <AyahActionsSheet
        surah={surah}
        ayah={selected}
        onClose={() => setSelected(null)}
        onEditNote={(a) => {
          setSelected(null);
          setNoteAyah(a.number);
        }}
      />
      <NoteSheet surah={surah} ayah={noteAyah} onClose={() => setNoteAyah(null)} />
      <ReadingSettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ReaderSearchSheet
        visible={searchOpen}
        surah={surah}
        ayahs={ayahs}
        onClose={() => setSearchOpen(false)}
        onSelect={(n) => {
          setSearchOpen(false);
          scrollTo(n);
        }}
      />
    </SafeAreaView>
  );
}

/** Surah number from a global ayah id (the API's ayahs carry both). */
function surahOf(ayah: Ayah): number {
  let s = 1;
  for (let n = 1; n <= 114; n++) if (getSurah(n).firstAyahId <= ayah.id) s = n;
  return s;
}

function ReaderSkeleton() {
  const styles = useStyles();
  return (
    <View
      style={styles.flex}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.skeletonItem}>
          <Skeleton width="85%" height={26} style={styles.skeletonRight} />
          <Skeleton width="60%" height={26} style={styles.skeletonRight} />
          <Skeleton width="70%" height={12} />
          <Skeleton width="90%" height={12} />
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.surface },
    flex: { flex: 1 },
    soft: { opacity: 0.85 },
    tabsBar: { borderBottomWidth: 1, borderBottomColor: t.colors.border },
    tabs: { gap: 22, paddingHorizontal: t.size.gutter },
    tab: {
      minHeight: t.size.touch,
      justifyContent: 'center',
      borderBottomWidth: 2.5,
      borderBottomColor: 'transparent',
      marginBottom: -1,
    },
    tabOn: { borderBottomColor: t.colors.primary },
    surahBar: {
      minHeight: 52,
      paddingHorizontal: t.size.gutter,
      paddingVertical: t.space.xs,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.space.md,
    },
    surahName: { flexDirection: 'row', alignItems: 'baseline', gap: 10, flexShrink: 1 },
    bismillah: {
      paddingTop: 10,
      paddingBottom: 6,
      paddingHorizontal: t.size.gutter,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    skeletonItem: {
      padding: t.size.gutter,
      gap: 10,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    skeletonRight: { alignSelf: 'flex-end' },
  }),
);
