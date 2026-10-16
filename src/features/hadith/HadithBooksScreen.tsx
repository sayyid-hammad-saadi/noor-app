import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TopBar } from '@/components/layout';
import { Icon, Text, Touchable } from '@/components/ui';
import { formatNumber, useLanguage } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';

import { bookTotal, sections } from './data/books';
import { BOOK_IDS } from './data/types';
import { bookRoute } from './routes';

const ARABIC: Record<string, string> = {
  bukhari: 'البخاري',
  muslim: 'مسلم',
  abudawud: 'أبو داود',
  tirmidhi: 'الترمذي',
  nasai: 'النسائي',
  ibnmajah: 'ابن ماجه',
};

/** The six books with their size; opens a book's chapters. */
export default function HadithBooksScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { language } = useLanguage();
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar title={t('hadith.booksTitle')} subtitle={t('hadith.booksSub')} />
      <FlatList
        data={BOOK_IDS}
        keyExtractor={(b) => b}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <Text variant="caption" align="center" style={styles.note}>
            {t('hadith.offlineNote')}
          </Text>
        }
        renderItem={({ item }) => (
          <Touchable
            accessibilityRole="button"
            onPress={() => router.push(bookRoute(item))}
            style={[styles.card, { boxShadow: shadows.card }]}
          >
            <View style={styles.tile}>
              <Text
                script="ar"
                size={14}
                weight="600"
                color="link"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {ARABIC[item]}
              </Text>
            </View>
            <View style={styles.grow}>
              <Text variant="bodyStrong">{t(`hadith.books.${item}`)}</Text>
              <Text variant="caption">
                {t('hadith.bookMeta', {
                  count: formatNumber(bookTotal(item), language),
                  chapters: formatNumber(sections(item).length, language),
                })}
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
    list: {
      paddingHorizontal: t.size.gutter,
      paddingTop: t.space.sm,
      paddingBottom: t.space.xxl,
      gap: 10,
    },
    card: {
      minHeight: 68,
      paddingStart: 14,
      paddingEnd: t.space.md,
      paddingVertical: t.space.md,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    tile: {
      width: 52,
      height: 44,
      borderRadius: t.radius.md,
      backgroundColor: t.colors.tint,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: t.space.xs,
    },
    grow: { flex: 1 },
    note: { marginTop: t.space.lg, marginHorizontal: t.space.lg },
  }),
);
