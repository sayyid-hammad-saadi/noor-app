import { useLocalSearchParams } from 'expo-router';
import { MessageCircleQuestionMark, Search, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { TopBar } from '@/components/layout';
import { Chip, IconButton, SearchField, Text } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

import { QuestionList } from './components/QuestionList';
import { madhhabPref } from './madhhabStore';
import { byCategory, CATEGORIES, type Category } from './masail';
import { searchMasail } from './text';

/** 22b Questions in one category, filtered by sub-topic. */
export default function MasailListScreen() {
  const styles = useStyles();
  const { t } = useTranslation();
  const { localizeDigits } = useLanguage();
  const madhhab = madhhabPref.use();
  const { category: param } = useLocalSearchParams<{ category: string }>();
  const category = CATEGORIES.includes(param as Category) ? (param as Category) : null;
  const [tag, setTag] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const all = useMemo(() => (category ? byCategory(category) : []), [category]);
  const tags = useMemo(() => [...new Set(all.map((m) => m.tag))], [all]);
  const items = useMemo(() => {
    const pool = tag ? all.filter((m) => m.tag === tag) : all;
    return query.trim() ? searchMasail(query, t, pool) : pool;
  }, [all, tag, query, t]);

  if (!category) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <TopBar title={t('masail.title')} />
        <EmptyState icon={MessageCircleQuestionMark} title={t('states.emptyTitle')} />
      </SafeAreaView>
    );
  }
  const name = t(`masail.categories.${category}.name`);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        title={name}
        subtitle={t('masail.questions', { n: localizeDigits(all.length) })}
        right={
          <IconButton
            icon={searching ? X : Search}
            size={22}
            accessibilityLabel={t('masail.searchIn', { category: name })}
            onPress={() => {
              setSearching((s) => !s);
              setQuery('');
            }}
          />
        }
      />
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {searching ? (
          <SearchField
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery('')}
            placeholder={t('masail.searchIn', { category: name })}
            autoFocus
          />
        ) : null}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsWrap}
          contentContainerStyle={styles.chips}
        >
          <Chip label={t('masail.all')} selected={tag === null} onPress={() => setTag(null)} />
          {tags.map((tg) => (
            <Chip
              key={tg}
              label={t(`masail.tags.${tg as 'wudu'}`)}
              selected={tag === tg}
              onPress={() => setTag(tg)}
            />
          ))}
        </ScrollView>
        {items.length ? (
          <QuestionList items={items} />
        ) : (
          <Text variant="subtle" align="center" style={styles.empty}>
            {t('masail.noResults', { q: query.trim() })}
          </Text>
        )}
        <Text variant="caption" align="center" style={styles.note}>
          {t('masail.note', { school: t(`masail.schools.${madhhab}`) })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    body: { paddingHorizontal: t.size.gutter, paddingBottom: t.space.xxl },
    chipsWrap: { marginVertical: t.space.md, marginHorizontal: -t.size.gutter, flexGrow: 0 },
    chips: { paddingHorizontal: t.size.gutter, gap: t.space.sm },
    empty: { marginTop: t.space.xl },
    note: { marginTop: t.space.lg },
  }),
);
