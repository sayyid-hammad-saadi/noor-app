import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Bookmark,
  BookText,
  ChevronDown,
  ChevronUp,
  Copy,
  Share2,
  Type,
} from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionBar } from '@/components/content';
import { Banner, EmptyState, ErrorState, Skeleton, useToast } from '@/components/feedback';
import { TopBar } from '@/components/layout';
import {
  GradeChip,
  Icon,
  IconButton,
  IconTile,
  SegmentedControl,
  Text,
  Touchable,
} from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';

import { GradeSheet } from './components/GradeSheet';
import { sections } from './data/books';
import { hadithKey } from './data/collection';
import { BOOK_IDS, type BookId, type Hadith, TOPICS } from './data/types';
import {
  hadithBookmarks,
  readingPrefs,
  SIZE_SCALE,
  SIZES,
  toggleIn,
  type Translation,
} from './library';
import type { ListKey } from './routes';
import { useHadithList } from './useHadithList';

/** 21b Hadith detail: Arabic, translations, grade and paging through its list. */
export default function HadithDetailScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ book: string; n: string; list?: string }>();
  const book: BookId = BOOK_IDS.includes(params.book as BookId)
    ? (params.book as BookId)
    : 'bukhari';
  const n = Number(params.n) || 1;
  const list = (params.list as ListKey | undefined) ?? 'topic:all';
  const { state, retry } = useHadithList(book, list);

  const title = list.startsWith('topic:')
    ? t(
        `hadith.topics.${(TOPICS as readonly string[]).includes(list.slice(6)) ? (list.slice(6) as 'iman') : 'all'}`,
      )
    : list === 'saved'
      ? t('hadith.saved')
      : (sections(book).find((s) => s.n === Number(list.slice(8)))?.name ?? t('hadith.title'));

  if (state.status !== 'ready') {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <TopBar title={title} />
        {state.status === 'error' ? (
          <ErrorState
            title={t('hadith.loadError')}
            body={t('hadith.loadErrorBody')}
            onRetry={retry}
          />
        ) : (
          <View style={styles.body}>
            <Skeleton width="100%" height={64} />
            <Skeleton width="90%" height={28} style={styles.end} />
            <Skeleton width="70%" height={28} style={styles.end} />
          </View>
        )}
      </SafeAreaView>
    );
  }

  const items = state.items;
  const index = items.findIndex((h) => h.book === book && h.n === n);
  const hadith = items[index];
  if (!hadith) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <TopBar title={title} />
        <EmptyState icon={BookText} title={t('hadith.missing')} />
      </SafeAreaView>
    );
  }
  const go = (h: Hadith | undefined) =>
    h ? () => router.setParams({ book: h.book, n: String(h.n), list }) : null;

  return (
    <Reader
      key={hadithKey(hadith)}
      hadith={hadith}
      title={title}
      position={{ n: index + 1, total: items.length }}
      onPrevious={go(items[index - 1])}
      onNext={go(items[index + 1])}
    />
  );
}

function Reader({
  hadith,
  title,
  position,
  onPrevious,
  onNext,
}: {
  hadith: Hadith;
  title: string;
  position: { n: number; total: number };
  onPrevious: (() => void) | null;
  onNext: (() => void) | null;
}) {
  const styles = useStyles();
  const toast = useToast();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { localizeDigits } = useLanguage();
  const prefs = readingPrefs.use();
  const saved = hadithBookmarks.use().includes(hadithKey(hadith));
  const [gradesOpen, setGradesOpen] = useState(false);
  const [full, setFull] = useState(false);
  const scale = SIZE_SCALE[prefs.size];
  const bookName = t(`hadith.books.${hadith.book}`);
  const ref = t('hadith.detailRef', { book: bookName, n: localizeDigits(hadith.ref) });
  const chapter = sections(hadith.book).find((s) => s.n === hadith.section)?.name;
  const showBn = prefs.translation !== 'en' && !!hadith.bnBody;
  const showEn = prefs.translation !== 'bn' && !!hadith.enBody;

  const plain = [hadith.matn ?? hadith.ar, hadith.bnBody, hadith.enBody, ref]
    .filter(Boolean)
    .join('\n\n');

  const cycleSize = () => {
    const next = SIZES[(SIZES.indexOf(prefs.size) + 1) % SIZES.length] ?? 'md';
    readingPrefs.set((p) => ({ ...p, size: next }));
    toast.show({ message: t(`hadith.textSizes.${next}`), icon: Type });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        title={title}
        subtitle={t('hadith.position', {
          n: localizeDigits(position.n),
          total: localizeDigits(position.total),
        })}
        right={
          <IconButton
            icon={Type}
            size={22}
            accessibilityLabel={t('hadith.textSize')}
            onPress={cycleSize}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={[styles.refCard, { boxShadow: shadows.card }]}>
          <IconTile icon={BookText} />
          <View style={styles.grow}>
            <Text variant="bodyStrong" weight="700">
              {ref}
            </Text>
            {chapter ? (
              <Text variant="caption" script="latin">
                {chapter}
              </Text>
            ) : null}
          </View>
          <Touchable
            accessibilityRole="button"
            accessibilityLabel={`${t(`grades.${hadith.grade}`)}. ${t('hadith.gradesTitle')}`}
            onPress={() => setGradesOpen(true)}
            style={styles.gradeHit}
          >
            <GradeChip grade={hadith.grade} />
          </Touchable>
        </View>

        <Text script="quran" size={Math.round(27 * scale)} align="right" style={styles.arabic}>
          {hadith.matn ?? hadith.ar}
        </Text>
        {hadith.matn ? (
          <>
            <Touchable
              accessibilityRole="button"
              onPress={() => setFull((f) => !f)}
              style={styles.fullToggle}
            >
              <Text variant="label" weight="600" color="link">
                {t(full ? 'hadith.hideFull' : 'hadith.showFull')}
              </Text>
              <Icon icon={full ? ChevronUp : ChevronDown} size={16} color="link" />
            </Touchable>
            {full ? (
              <Text script="ar" size={Math.round(17 * scale)} color="text2" align="right">
                {hadith.ar}
              </Text>
            ) : null}
          </>
        ) : null}

        <View style={styles.segment}>
          <SegmentedControl<Translation>
            value={prefs.translation}
            onChange={(translation) => readingPrefs.set((p) => ({ ...p, translation }))}
            accessibilityLabel={t('hadith.translation')}
            options={[
              { value: 'bn', label: 'বাংলা' },
              { value: 'en', label: 'English' },
              { value: 'both', label: t('hadith.both') },
            ]}
          />
        </View>

        <View style={styles.texts}>
          {showBn ? (
            <Text script="bn" size={Math.round(16 * scale)}>
              {hadith.bnBody}
            </Text>
          ) : null}
          {showEn ? (
            <Text script="latin" size={Math.round(15 * scale)} color={showBn ? 'text2' : 'text'}>
              {hadith.enBody}
            </Text>
          ) : null}
          {hadith.narrator ? (
            <Text variant="caption" script="latin">
              {t('hadith.narratedBy', { name: hadith.narrator })}
            </Text>
          ) : null}
        </View>

        <View style={styles.banner}>
          <Banner tone="info" message={t('hadith.gradeNote')} />
        </View>
      </ScrollView>
      <ActionBar
        previous={{ label: t('hadith.previous'), onPress: onPrevious }}
        next={{ label: t('hadith.next'), onPress: onNext }}
        actions={[
          {
            icon: Bookmark,
            label: saved ? t('hadith.saved') : t('hadith.save'),
            active: saved ? 'goldText' : undefined,
            onPress: () => toggleIn(hadithBookmarks, hadithKey(hadith)),
          },
          {
            icon: Share2,
            label: t('hadith.share'),
            onPress: () => void Share.share({ message: plain }),
          },
          {
            icon: Copy,
            label: t('hadith.copy'),
            onPress: () => {
              void Clipboard.setStringAsync(plain);
              toast.show({ message: t('hadith.copied'), icon: Copy });
            },
          },
        ]}
      />
      <GradeSheet hadith={hadith} visible={gradesOpen} onClose={() => setGradesOpen(false)} />
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    body: {
      paddingHorizontal: t.size.gutter,
      paddingTop: t.space.sm,
      paddingBottom: t.space.xxl,
      gap: t.space.sm,
    },
    end: { alignSelf: 'flex-end' },
    refCard: {
      paddingVertical: 14,
      paddingHorizontal: t.space.lg,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    grow: { flex: 1 },
    gradeHit: { minHeight: t.size.touch, justifyContent: 'center' },
    arabic: { marginTop: t.space.sm, paddingHorizontal: t.space.xs },
    fullToggle: {
      minHeight: t.size.touch,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.xs,
      alignSelf: 'flex-start',
    },
    segment: { marginTop: t.space.xs },
    texts: { marginTop: t.space.sm, gap: t.space.md },
    banner: { marginTop: t.space.sm },
  }),
);
