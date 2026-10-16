import { useRouter } from 'expo-router';
import { Bookmark, ChevronRight, Search, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SourceLine } from '@/components/content';
import { TopBar } from '@/components/layout';
import { Chip, Icon, IconButton, SearchField, Text, Touchable } from '@/components/ui';
import { duaBookmarks } from '@/features/hadith/library';
import { stripTashkeel } from '@/features/quran/data/digits';
import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

import { DUA_CATEGORIES, type DuaCategory, DUAS } from './duas';
import { duaRoute } from './routes';

/** 25a Dua: duas by category with Arabic preview and source. */
export default function DuaListScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { localizeDigits } = useLanguage();
  const saved = duaBookmarks.use();
  const [category, setCategory] = useState<DuaCategory>('daily');
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const items = useMemo(() => {
    const q = stripTashkeel(query.trim().toLowerCase());
    if (!q) return DUAS.filter((d) => d.category === category);
    return DUAS.filter((d) =>
      [
        t(`dua.items.${d.id as 'iftar'}.title`),
        t(`dua.items.${d.id as 'iftar'}.translation`),
        d.transliteration,
        stripTashkeel(d.arabic),
      ].some((s) => s.toLowerCase().includes(q)),
    );
  }, [category, query, t]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        title={t('dua.title')}
        subtitle={t('dua.subtitle', { count: localizeDigits(DUAS.length) })}
        right={
          <IconButton
            icon={searching ? X : Search}
            size={22}
            accessibilityLabel={t('dua.search')}
            onPress={() => {
              setSearching((s) => !s);
              setQuery('');
            }}
          />
        }
      />
      <FlatList
        data={items}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            {searching ? (
              <SearchField
                value={query}
                onChangeText={setQuery}
                onClear={() => setQuery('')}
                placeholder={t('dua.searchPlaceholder')}
                autoFocus
              />
            ) : null}
            {!query ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsWrap}
                contentContainerStyle={styles.chips}
                accessibilityRole="tablist"
              >
                {DUA_CATEGORIES.map((c) => (
                  <Chip
                    key={c}
                    label={t(`dua.categories.${c}`)}
                    selected={category === c}
                    onPress={() => setCategory(c)}
                  />
                ))}
              </ScrollView>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <Text variant="subtle" align="center" style={styles.empty}>
            {t('dua.noResults', { q: query })}
          </Text>
        }
        renderItem={({ item, index }) => (
          <Touchable
            accessibilityRole="button"
            onPress={() => router.push(duaRoute(item.id))}
            style={[styles.row, index > 0 && styles.rule]}
          >
            <View style={styles.r1}>
              <Text variant="bodyStrong" weight="600" style={styles.grow}>
                {t(`dua.items.${item.id as 'iftar'}.title`)}
              </Text>
              {saved.includes(item.id) ? (
                <Icon icon={Bookmark} size={16} color="goldText" filled />
              ) : null}
              <Icon icon={ChevronRight} size={18} color="text2" flipInRTL />
            </View>
            <Text script="quran" size={20} align="right" numberOfLines={2}>
              {item.arabic}
            </Text>
            <SourceLine source={item.sources[0]!} />
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
    header: { gap: t.space.sm, paddingBottom: t.space.sm },
    chipsWrap: { marginTop: t.space.sm, marginHorizontal: -t.size.gutter },
    chips: { paddingHorizontal: t.size.gutter, gap: t.space.sm },
    row: { paddingVertical: t.space.md, gap: 6 },
    rule: { borderTopWidth: 1, borderTopColor: t.colors.border },
    r1: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
    grow: { flex: 1 },
    empty: { marginTop: t.space.xxl },
  }),
);
