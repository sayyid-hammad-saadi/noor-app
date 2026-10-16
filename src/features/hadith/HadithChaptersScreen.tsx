import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TopBar } from '@/components/layout';
import { Icon, Text, Touchable } from '@/components/ui';
import { formatNumber, useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

import { bookTotal, sections } from './data/books';
import { BOOK_IDS, type BookId } from './data/types';
import { chapterRoute } from './routes';

/** A book's chapters (Kitab), numbered with English names from the dataset. */
export default function HadithChaptersScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { language, localizeDigits } = useLanguage();
  const params = useLocalSearchParams<{ book: string }>();
  const book: BookId = BOOK_IDS.includes(params.book as BookId)
    ? (params.book as BookId)
    : 'bukhari';
  const list = sections(book);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        title={t(`hadith.books.${book}`)}
        subtitle={t('hadith.bookMeta', {
          count: formatNumber(bookTotal(book), language),
          chapters: formatNumber(list.length, language),
        })}
      />
      <FlatList
        data={list}
        keyExtractor={(s) => String(s.n)}
        contentContainerStyle={styles.list}
        initialNumToRender={16}
        renderItem={({ item }) => (
          <Touchable
            accessibilityRole="button"
            onPress={() => router.push(chapterRoute(book, item.n))}
            style={styles.row}
          >
            <View style={styles.num}>
              <Text size={13} weight="700" color="link" tabular>
                {localizeDigits(item.n)}
              </Text>
            </View>
            <View style={styles.grow}>
              <Text variant="body" weight="600" script="latin">
                {item.name}
              </Text>
              <Text variant="caption">
                {t('hadith.chapterMeta', { count: formatNumber(item.count, language) })}
              </Text>
            </View>
            <Icon icon={ChevronRight} size={18} color="text2" flipInRTL />
          </Touchable>
        )}
      />
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    list: { paddingHorizontal: t.size.gutter, paddingBottom: t.space.xxl },
    row: {
      minHeight: 60,
      paddingVertical: t.space.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    num: {
      minWidth: 36,
      height: 36,
      paddingHorizontal: t.space.xs,
      borderRadius: t.radius.sm,
      backgroundColor: t.colors.tint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    grow: { flex: 1 },
  }),
);
