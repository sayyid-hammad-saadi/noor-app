import { useRouter } from 'expo-router';
import { Bookmark, ChevronDown, SlidersHorizontal } from 'lucide-react-native';
import { type ReactElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { Icon, IconButton, SearchField, SegmentedControl, Text, Touchable } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

import { ContinueCard } from './components/ContinueCard';
import { ParaGrid } from './components/ParaGrid';
import { ReadingSettingsSheet } from './components/ReadingSettingsSheet';
import { SurahRow } from './components/SurahRow';
import { stripTashkeel, toAsciiDigits } from './data/digits';
import { bookmarks, lastRead } from './data/library';
import { getSurah, type Surah, SURAHS, surahName } from './data/surahs';
import { quranRoute } from './routes';

type Tab = 'surah' | 'para' | 'bookmarks';
type Order = 'mushaf' | 'revelation';

/** 09a/09b Quran home: surah list, para grid with khatam progress, bookmarks. */
export default function QuranHomeScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const last = lastRead.use();
  const [tab, setTab] = useState<Tab>('surah');
  const [order, setOrder] = useState<Order>('mushaf');
  const [query, setQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const open = (surah: number, ayah?: number) => router.push(quranRoute(surah, ayah));

  // "2:255" (any digits) jumps to an ayah; otherwise match number or names.
  const reference = useMemo(() => {
    const m = /^\s*(\d{1,3})\s*[:.]\s*(\d{1,3})\s*$/.exec(toAsciiDigits(query));
    if (!m) return null;
    const s = Number(m[1]);
    const a = Number(m[2]);
    return s >= 1 && s <= 114 && a >= 1 && a <= getSurah(s).ayahCount
      ? { surah: s, ayah: a }
      : null;
  }, [query]);

  const surahs = useMemo(() => {
    const list =
      order === 'mushaf'
        ? [...SURAHS]
        : [...SURAHS].sort((a, b) => a.revelationOrder - b.revelationOrder);
    const q = stripTashkeel(toAsciiDigits(query.trim().toLowerCase()));
    if (!q || reference) return list;
    return list.filter(
      (s) =>
        String(s.number) === q ||
        [s.name.en, s.name.bn, stripTashkeel(s.nameAr), s.meaning.en, s.meaning.bn].some((n) =>
          n.toLowerCase().includes(q),
        ),
    );
  }, [order, query, reference]);

  const header = (
    <View>
      <View style={styles.titleRow}>
        <Text variant="h1" accessibilityRole="header">
          {t('quran.title')}
        </Text>
        <IconButton
          icon={SlidersHorizontal}
          size={22}
          accessibilityLabel={t('quran.readingSettings')}
          onPress={() => setSettingsOpen(true)}
          style={styles.edgeEnd}
        />
      </View>
      <View style={styles.tabs}>
        <SegmentedControl<Tab>
          value={tab}
          onChange={setTab}
          accessibilityLabel={t('quran.browse')}
          options={[
            { value: 'surah', label: t('quran.tabs.surah') },
            { value: 'para', label: t('quran.tabs.para') },
            { value: 'bookmarks', label: t('quran.tabs.bookmarks') },
          ]}
        />
      </View>
      {tab !== 'bookmarks' ? (
        <View style={styles.search}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery('')}
            placeholder={t('quran.searchPlaceholder')}
            onSubmitEditing={() => reference && open(reference.surah, reference.ayah)}
          />
        </View>
      ) : null}
      {reference ? (
        <Touchable
          accessibilityRole="button"
          onPress={() => open(reference.surah, reference.ayah)}
          style={styles.jump}
        >
          <Text variant="bodyStrong" color="link">
            {`${surahName(getSurah(reference.surah), language)} · ${t('quran.search.goTo', { ayah: reference.ayah })}`}
          </Text>
        </Touchable>
      ) : null}
      {tab === 'surah' && last && !query ? (
        <ContinueCard last={last} onPress={() => open(last.surah, last.ayah)} />
      ) : null}
      {tab === 'surah' ? (
        <View style={styles.listHead}>
          <Text variant="title" accessibilityRole="header">
            {t('quran.surahCount', { count: surahs.length })}
          </Text>
          <Touchable
            accessibilityRole="button"
            onPress={() => setOrder((o) => (o === 'mushaf' ? 'revelation' : 'mushaf'))}
            style={styles.order}
          >
            <Text variant="label" weight="600">
              {t(`quran.order.${order}`)}
            </Text>
            <Icon icon={ChevronDown} size={14} color="text2" />
          </Touchable>
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {tab === 'surah' ? (
        <FlatList
          data={surahs}
          keyExtractor={(s) => String(s.number)}
          renderItem={({ item }: { item: Surah }) => (
            <SurahRow surah={item} onPress={() => open(item.number)} />
          )}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <Text variant="subtle" align="center" style={styles.empty}>
              {t('quran.noResults', { query })}
            </Text>
          }
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={14}
        />
      ) : tab === 'para' ? (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <>
              {header}
              <ParaGrid
                current={last?.juz ?? null}
                onOpen={(j) => open(j.surah, j.ayah)}
                onContinue={() => last && open(last.surah, last.ayah)}
              />
            </>
          }
          contentContainerStyle={styles.content}
        />
      ) : (
        <BookmarksTab header={header} onOpen={open} />
      )}
      <ReadingSettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </SafeAreaView>
  );
}

function BookmarksTab({
  header,
  onOpen,
}: {
  header: ReactElement;
  onOpen: (s: number, a: number) => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { language, localizeDigits } = useLanguage();
  const list = bookmarks.use();
  return (
    <FlatList
      data={list}
      keyExtractor={(b) => `${b.surah}:${b.ayah}`}
      ListHeaderComponent={header}
      contentContainerStyle={[styles.content, !list.length && styles.grow]}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <EmptyState
            icon={Bookmark}
            tone="gold"
            title={t('quran.noBookmarks')}
            body={t('quran.noBookmarksBody')}
          />
        </View>
      }
      renderItem={({ item }) => {
        const s = getSurah(item.surah);
        return (
          <Touchable
            accessibilityRole="button"
            onPress={() => onOpen(item.surah, item.ayah)}
            style={styles.bookmark}
          >
            <View style={styles.bookmarkIcon}>
              <Icon icon={Bookmark} size={18} color="goldText" filled />
            </View>
            <View style={styles.grow}>
              <Text variant="bodyStrong">{surahName(s, language)}</Text>
              <Text variant="caption">
                {`${t('quran.player.ayah', { n: localizeDigits(item.ayah) })} · ${t(s.meccan ? 'quran.meccan' : 'quran.medinan')}`}
              </Text>
            </View>
            {language !== 'ar' ? (
              <Text script="quran" size={20}>
                {s.nameAr}
              </Text>
            ) : null}
          </Touchable>
        );
      }}
    />
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    content: { paddingHorizontal: t.size.gutter, paddingBottom: t.space.xxl },
    grow: { flexGrow: 1, flex: 1 },
    titleRow: {
      minHeight: t.size.topBar,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    edgeEnd: { marginEnd: -t.space.sm },
    tabs: { marginTop: t.space.sm },
    search: { marginTop: t.space.md },
    jump: { marginTop: t.space.sm, minHeight: t.size.touch, justifyContent: 'center' },
    listHead: {
      marginTop: t.space.lg,
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    order: { minHeight: t.size.touch, flexDirection: 'row', alignItems: 'center', gap: t.space.xs },
    empty: { marginTop: t.space.xxl },
    emptyState: { flex: 1, minHeight: 360 },
    bookmark: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    bookmarkIcon: {
      width: 40,
      height: 40,
      borderRadius: t.radius.md,
      backgroundColor: t.colors.goldTint,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);
