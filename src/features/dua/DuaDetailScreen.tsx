import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bookmark, Copy, Repeat, Share2, Sparkles, Type } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionBar, SourceLine } from '@/components/content';
import { Banner, EmptyState, useToast } from '@/components/feedback';
import { TopBar } from '@/components/layout';
import { Icon, IconButton, Text } from '@/components/ui';
import { duaBookmarks, readingPrefs, SIZE_SCALE, SIZES, toggleIn } from '@/features/hadith/library';
import { useLanguage } from '@/i18n';
import { sourceLabel } from '@/lib/sources';
import { makeStyles, useTheme } from '@/theme';

import { DUAS, getDua } from './duas';

/** 25b Dua detail: Arabic, transliteration, translations, sources and virtue. */
export default function DuaDetailScreen() {
  const styles = useStyles();
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { language, localizeDigits } = useLanguage();
  const prefs = readingPrefs.use();
  const saved = duaBookmarks.use();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dua = getDua(id ?? '');

  if (!dua) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <TopBar title={t('dua.title')} />
        <EmptyState icon={Sparkles} title={t('dua.noResults', { q: id ?? '' })} />
      </SafeAreaView>
    );
  }

  const key = dua.id as 'leaveHome';
  const list = DUAS.filter((d) => d.category === dua.category);
  const index = list.findIndex((d) => d.id === dua.id);
  const title = t(`dua.items.${key}.title`);
  const translation = t(`dua.items.${key}.translation`);
  const enTranslation =
    language === 'en' ? translation : t(`dua.items.${key}.translation`, { lng: 'en' });
  const bnTranslation = t(`dua.items.${key}.translation`, { lng: 'bn' });
  const virtue = dua.virtue ? t(`dua.items.${key}.virtue`) : null;
  const scale = SIZE_SCALE[prefs.size];
  const isSaved = saved.includes(dua.id);
  const sources = dua.sources.map((s) => sourceLabel(s, t, localizeDigits)).join(' · ');
  const plain = [title, dua.arabic, dua.transliteration, translation, sources]
    .filter(Boolean)
    .join('\n\n');
  const go = (i: number) => {
    const d = list[i];
    return d ? () => router.setParams({ id: d.id }) : null;
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        title={title}
        subtitle={t('dua.position', {
          category: t(`dua.categories.${dua.category}`),
          n: localizeDigits(index + 1),
          total: localizeDigits(list.length),
        })}
        right={
          <IconButton
            icon={Bookmark}
            size={20}
            color={isSaved ? 'goldText' : 'text'}
            accessibilityLabel={isSaved ? t('dua.saved') : t('dua.save')}
            onPress={() => toggleIn(duaBookmarks, dua.id)}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={[styles.card, { boxShadow: shadows.card }]}>
          <Text script="quran" size={Math.round(28 * scale)} align="right">
            {dua.arabic}
          </Text>
          <View style={styles.divider} />
          <Text script="latin" weight="500" color="link" size={Math.round(15 * scale)}>
            {dua.transliteration}
          </Text>
          {language !== 'ar' ? (
            <>
              <Text script="latin" size={Math.round(15 * scale)}>
                {enTranslation}
              </Text>
              <Text script="bn" size={Math.round(15 * scale)} color="text2">
                {bnTranslation}
              </Text>
            </>
          ) : null}
          {dua.repeat ? (
            <View style={styles.repeat}>
              <Icon icon={Repeat} size={14} color="link" />
              <Text variant="caption" weight="700" color="link">
                {t('dua.repeat', { n: localizeDigits(dua.repeat) })}
              </Text>
            </View>
          ) : null}
          <View style={styles.sources}>
            {dua.sources.map((s) => (
              <SourceLine key={s.ref} source={s} />
            ))}
          </View>
        </View>
        {virtue ? (
          <View style={styles.banner}>
            <Banner tone="info" icon={Sparkles} message={virtue} />
          </View>
        ) : null}
      </ScrollView>
      <ActionBar
        previous={{ label: t('dua.previous'), onPress: go(index - 1) }}
        next={{ label: t('dua.next'), onPress: go(index + 1) }}
        actions={[
          {
            icon: Copy,
            label: t('dua.copy'),
            onPress: () => {
              void Clipboard.setStringAsync(plain);
              toast.show({ message: t('dua.copied'), icon: Copy });
            },
          },
          {
            icon: Share2,
            label: t('dua.share'),
            onPress: () => void Share.share({ message: plain }),
          },
          {
            icon: Type,
            label: t('dua.textSize'),
            onPress: () => {
              const next = SIZES[(SIZES.indexOf(prefs.size) + 1) % SIZES.length] ?? 'md';
              readingPrefs.set((p) => ({ ...p, size: next }));
              toast.show({ message: t(`hadith.textSizes.${next}`), icon: Type });
            },
          },
        ]}
      />
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    body: { paddingHorizontal: t.size.gutter, paddingTop: 10, paddingBottom: t.space.xxl },
    card: {
      paddingVertical: 18,
      paddingHorizontal: t.space.lg,
      gap: t.space.md,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
    divider: { height: 1, backgroundColor: t.colors.border },
    repeat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    sources: { gap: 6 },
    banner: { marginTop: 10 },
  }),
);
