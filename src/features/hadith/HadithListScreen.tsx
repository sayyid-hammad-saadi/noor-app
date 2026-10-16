import { useRouter } from 'expo-router';
import { BookOpen, Check, ChevronDown, ChevronRight, Search, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/feedback';
import { TopBar } from '@/components/layout';
import { Chip, Icon, IconButton, IconTile, SearchField, Text, Touchable } from '@/components/ui';
import { stripTashkeel } from '@/features/quran/data/digits';
import { formatNumber, useLanguage } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';

import { HadithCard } from './components/HadithCard';
import { TOTAL_HADITH } from './data/books';
import { curatedByTopic, hadithKey } from './data/collection';
import { BOOK_IDS, type BookId, type Hadith, TOPICS, type Topic } from './data/types';
import { hadithBookmarks } from './library';
import { hadithRoute, hadithRoutes } from './routes';

/** 21a Hadith: hand-picked hadith by topic, with a way into the full six books. */
export default function HadithListScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { language, localizeDigits } = useLanguage();
  const saved = hadithBookmarks.use();
  const [topic, setTopic] = useState<Topic | 'all'>('iman');
  const [book, setBook] = useState<BookId | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const items = useMemo(() => {
    let list = curatedByTopic(topic);
    if (book) list = list.filter((h) => h.book === book);
    const q = stripTashkeel(query.trim().toLowerCase());
    if (q) {
      list = list.filter((h: Hadith) =>
        [h.enBody, h.bnBody, stripTashkeel(h.ar)].some((s) => s.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [topic, book, query]);

  const rounded = Math.floor(TOTAL_HADITH / 1000) * 1000;
  const topicLabel = t(`hadith.topics.${topic}`);

  const header = (
    <View>
      {searching ? (
        <View style={styles.search}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery('')}
            placeholder={t('hadith.searchPlaceholder')}
            autoFocus
          />
        </View>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsWrap}
        accessibilityRole="tablist"
        accessibilityLabel={t('hadith.categories')}
      >
        {(['all', ...TOPICS] as const).map((k) => (
          <Chip
            key={k}
            label={t(`hadith.topics.${k}`)}
            selected={topic === k}
            onPress={() => setTopic(k)}
          />
        ))}
      </ScrollView>
      <View style={styles.listHead}>
        <Text variant="title" accessibilityRole="header" style={styles.shrink}>
          {t('hadith.listHead', { topic: topicLabel, count: localizeDigits(items.length) })}
        </Text>
        <Touchable
          accessibilityRole="button"
          accessibilityLabel={t('hadith.filterTitle')}
          onPress={() => setFilterOpen(true)}
          style={styles.filter}
        >
          <Text variant="label" weight="600" color="link" numberOfLines={1} style={styles.shrink}>
            {book ? t(`hadith.books.${book}`) : t('hadith.allBooks')}
          </Text>
          <Icon icon={ChevronDown} size={14} color="link" />
        </Touchable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        title={t('hadith.title')}
        subtitle={t('hadith.subtitle', { count: formatNumber(rounded, language) })}
        right={
          <IconButton
            icon={searching ? X : Search}
            size={22}
            accessibilityLabel={t('hadith.search')}
            onPress={() => {
              setSearching((s) => !s);
              setQuery('');
            }}
          />
        }
      />
      <FlatList
        data={items}
        keyExtractor={hadithKey}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        ListEmptyComponent={
          <Text variant="subtle" align="center" style={styles.empty}>
            {t('hadith.noResults', { q: query })}
          </Text>
        }
        renderItem={({ item }) => (
          <HadithCard
            hadith={item}
            saved={saved.includes(hadithKey(item))}
            language={language}
            onPress={() => router.push(hadithRoute(item.book, item.n, `topic:${topic}`))}
          />
        )}
        ListFooterComponent={
          <Touchable
            accessibilityRole="link"
            onPress={() => router.push(hadithRoutes.books)}
            style={[styles.browse, { boxShadow: shadows.card }]}
          >
            <IconTile icon={BookOpen} />
            <View style={styles.grow}>
              <Text variant="bodyStrong">{t('hadith.browse')}</Text>
              <Text variant="caption">
                {t('hadith.browseSub', { count: formatNumber(TOTAL_HADITH, language) })}
              </Text>
            </View>
            <Icon icon={ChevronRight} size={18} color="text2" flipInRTL />
          </Touchable>
        }
      />
      <BottomSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        title={t('hadith.filterTitle')}
      >
        {([null, ...BOOK_IDS] as const).map((b) => (
          <Touchable
            key={b ?? 'all'}
            accessibilityRole="radio"
            accessibilityState={{ checked: book === b }}
            onPress={() => {
              setBook(b);
              setFilterOpen(false);
            }}
            style={styles.option}
          >
            <Text variant="body" weight={book === b ? '700' : '400'} style={styles.grow}>
              {b ? t(`hadith.books.${b}`) : t('hadith.allBooks')}
            </Text>
            {book === b ? <Icon icon={Check} size={18} color="link" strokeWidth={2.5} /> : null}
          </Touchable>
        ))}
      </BottomSheet>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    list: { paddingHorizontal: t.size.gutter, paddingBottom: t.space.xxl, gap: 10 },
    search: { marginTop: t.space.xs },
    chipsWrap: { marginTop: t.space.sm, marginHorizontal: -t.size.gutter },
    chips: { paddingHorizontal: t.size.gutter, gap: t.space.sm },
    listHead: {
      marginTop: 14,
      marginBottom: t.space.xs,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.space.md,
    },
    shrink: { flexShrink: 1 },
    filter: {
      minHeight: 32,
      maxWidth: '50%',
      paddingHorizontal: t.space.md,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.tint,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.xs,
    },
    empty: { marginTop: t.space.xxl },
    browse: {
      marginTop: t.space.sm,
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
    option: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
  }),
);
