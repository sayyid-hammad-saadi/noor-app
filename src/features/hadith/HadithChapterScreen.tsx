import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState, Skeleton } from '@/components/feedback';
import { TopBar } from '@/components/layout';
import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

import { HadithCard } from './components/HadithCard';
import { sections } from './data/books';
import { hadithKey } from './data/collection';
import { BOOK_IDS, type BookId } from './data/types';
import { hadithBookmarks } from './library';
import { hadithRoute } from './routes';
import { useHadithList } from './useHadithList';

/** All hadith of one chapter, downloaded on first open and cached. */
export default function HadithChapterScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { language, localizeDigits } = useLanguage();
  const params = useLocalSearchParams<{ book: string; section: string }>();
  const book: BookId = BOOK_IDS.includes(params.book as BookId)
    ? (params.book as BookId)
    : 'bukhari';
  const section = Number(params.section) || 1;
  const info = sections(book).find((s) => s.n === section);
  const { state, retry } = useHadithList(book, `chapter:${section}`);
  const saved = hadithBookmarks.use();

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        title={info?.name ?? t('hadith.chapter', { n: localizeDigits(section) })}
        subtitle={`${t(`hadith.books.${book}`)} · ${t('hadith.chapter', { n: localizeDigits(section) })}`}
      />
      {state.status === 'error' ? (
        <ErrorState
          title={t('hadith.loadError')}
          body={t('hadith.loadErrorBody')}
          onRetry={retry}
        />
      ) : state.status === 'loading' ? (
        <View
          style={styles.list}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.skeleton}>
              <Skeleton width="45%" height={12} />
              <Skeleton width="95%" height={14} />
              <Skeleton width="80%" height={14} />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={state.items}
          keyExtractor={hadithKey}
          contentContainerStyle={styles.list}
          initialNumToRender={8}
          windowSize={9}
          renderItem={({ item }) => (
            <HadithCard
              hadith={item}
              saved={saved.includes(hadithKey(item))}
              language={language}
              onPress={() => router.push(hadithRoute(book, item.n, `chapter:${section}`))}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    list: {
      paddingHorizontal: t.size.gutter,
      paddingTop: t.space.sm,
      paddingBottom: t.space.xxl,
      gap: 10,
    },
    skeleton: {
      padding: t.space.lg,
      gap: 10,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
    },
  }),
);
