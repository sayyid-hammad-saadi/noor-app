import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TopBar } from '@/components/layout';
import { Chip, IconTile, SearchField, Text, Touchable } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';

import { CATEGORY_ICONS } from './categoryIcons';
import { MadhhabSheet } from './components/MadhhabSheet';
import { QuestionList } from './components/QuestionList';
import { madhhabPref } from './madhhabStore';
import { byCategory, CATEGORIES, getMasalah, type Masalah, POPULAR } from './masail';
import { masailCategoryRoute } from './routes';
import { searchMasail } from './text';

const popular = POPULAR.map(getMasalah).filter((m): m is Masalah => !!m);

/** 22a Masail: search, categories and popular questions. */
export default function MasailHomeScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { localizeDigits } = useLanguage();
  const madhhab = madhhabPref.use();
  const [query, setQuery] = useState('');
  const [sheet, setSheet] = useState(false);
  const results = useMemo(() => (query.trim() ? searchMasail(query, t) : []), [query, t]);
  const schoolName = t(`masail.schools.${madhhab}`);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        title={t('masail.title')}
        subtitle={t('masail.subtitle')}
        right={
          <View accessibilityLabel={t('masail.madhhab', { name: schoolName })}>
            <Chip label={schoolName} tint onPress={() => setSheet(true)} />
          </View>
        }
      />
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SearchField
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          placeholder={t('masail.search')}
        />
        {query.trim() ? (
          results.length ? (
            <View style={styles.section}>
              <QuestionList items={results} caption="category" />
            </View>
          ) : (
            <Text variant="subtle" align="center" style={styles.empty}>
              {t('masail.noResults', { q: query.trim() })}
            </Text>
          )
        ) : (
          <>
            <Text variant="section" style={styles.section} accessibilityRole="header">
              {t('masail.categoriesTitle')}
            </Text>
            <View style={styles.grid}>
              {CATEGORIES.map((c) => (
                <Touchable
                  key={c}
                  accessibilityRole="button"
                  onPress={() => router.push(masailCategoryRoute(c))}
                  style={[styles.tile, { boxShadow: shadows.card }]}
                >
                  <IconTile icon={CATEGORY_ICONS[c]} size="sm" />
                  <View style={styles.grow}>
                    <Text variant="bodyStrong" weight="700" size={14} numberOfLines={2}>
                      {t(`masail.categories.${c}.name`)}
                    </Text>
                    <Text variant="caption" numberOfLines={2}>
                      {t('masail.categoryMeta', {
                        desc: t(`masail.categories.${c}.desc`),
                        n: localizeDigits(byCategory(c).length),
                      })}
                    </Text>
                  </View>
                </Touchable>
              ))}
            </View>
            <Text variant="section" style={styles.section} accessibilityRole="header">
              {t('masail.popular')}
            </Text>
            <QuestionList items={popular} caption="category" />
          </>
        )}
      </ScrollView>
      <MadhhabSheet visible={sheet} onClose={() => setSheet(false)} />
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    body: { paddingHorizontal: t.size.gutter, paddingTop: t.space.xs, paddingBottom: t.space.xxl },
    section: { marginTop: t.space.lg, marginBottom: t.space.sm },
    empty: { marginTop: t.space.xxl },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    tile: {
      flexBasis: '47%',
      flexGrow: 1,
      minHeight: 64,
      padding: t.space.md,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    grow: { flex: 1 },
  }),
);
