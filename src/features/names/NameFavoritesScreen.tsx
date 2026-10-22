import { useRouter } from 'expo-router';
import { Heart, Share2 } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { TopBar } from '@/components/layout';
import { IconButton, SegmentedControl, Text, Touchable } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

import { nameFavorites, toggleFavorite } from './favorites';
import { type Gender, getName, type IslamicName } from './names';
import { nameRoute } from './routes';

/** 23b Favorite names, filterable by gender. */
export default function NameFavoritesScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { localizeDigits } = useLanguage();
  const ids = nameFavorites.use();
  const [filter, setFilter] = useState<Gender | 'all'>('all');
  const all = ids.map(getName).filter((n): n is IslamicName => !!n);
  const list = filter === 'all' ? all : all.filter((n) => n.gender === filter);

  const shareList = () =>
    void Share.share({
      message: all.map((n) => `${n.en} (${n.ar}): ${t(`names.items.${n.id as 'nur'}`)}`).join('\n'),
    });

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        title={t('names.favoritesTitle')}
        subtitle={t('names.savedCount', { n: localizeDigits(all.length) })}
        right={
          all.length ? (
            <IconButton
              icon={Share2}
              size={22}
              accessibilityLabel={t('names.shareList')}
              onPress={shareList}
            />
          ) : null
        }
      />
      <View style={styles.segment}>
        <SegmentedControl<Gender | 'all'>
          value={filter}
          onChange={setFilter}
          accessibilityLabel={t('names.gender')}
          options={(['all', 'male', 'female', 'unisex'] as const).map((g) => ({
            value: g,
            label: t(`names.genders.${g}`),
          }))}
        />
      </View>
      <FlatList
        data={list}
        keyExtractor={(n) => n.id}
        contentContainerStyle={[styles.list, !list.length && styles.grow]}
        ListEmptyComponent={
          <View style={styles.grow}>
            <EmptyState
              icon={Heart}
              tone="danger"
              title={t('names.noFavorites')}
              body={t('names.noFavoritesBody')}
            />
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={[styles.row, index > 0 && styles.rule]}>
            <Touchable
              accessibilityRole="button"
              onPress={() => router.push(nameRoute(item.id))}
              style={styles.main}
            >
              <Text script="quran" size={22} color="link" align="center" style={styles.arabic}>
                {item.ar}
              </Text>
              <View style={styles.text}>
                <Text variant="bodyStrong" weight="700">
                  <Text variant="bodyStrong" weight="700" script="latin">
                    {item.en}
                  </Text>
                  <Text script="bn" size={13} weight="500" color="text2">
                    {` · ${item.bn}`}
                  </Text>
                </Text>
                <Text variant="caption" weight="400" numberOfLines={1}>
                  {t(`names.items.${item.id as 'nur'}`)}
                </Text>
                <View style={styles.tags}>
                  {[t(`names.genders.${item.gender}`), t(`names.themes.${item.theme}`)].map((g) => (
                    <View key={g} style={styles.tag}>
                      <Text size={10.5} weight="700" color="text2">
                        {g}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Touchable>
            <IconButton
              icon={Heart}
              size={20}
              color="dangerText"
              accessibilityLabel={t('names.unsave')}
              onPress={() => toggleFavorite(item.id)}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    segment: { paddingHorizontal: t.size.gutter, paddingTop: t.space.sm },
    list: { paddingHorizontal: t.size.gutter, paddingTop: t.space.sm, paddingBottom: t.space.xxl },
    grow: { flexGrow: 1 },
    row: {
      minHeight: 68,
      paddingVertical: t.space.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    rule: { borderTopWidth: 1, borderTopColor: t.colors.border },
    main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: t.space.md },
    arabic: { width: 64 },
    text: { flex: 1, minWidth: 0, gap: 2 },
    tags: { marginTop: 2, flexDirection: 'row', gap: 6 },
    tag: {
      minHeight: 20,
      paddingHorizontal: 7,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.surface2,
      justifyContent: 'center',
    },
  }),
);
