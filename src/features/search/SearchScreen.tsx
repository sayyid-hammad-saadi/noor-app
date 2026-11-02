import { type Href, useRouter } from 'expo-router';
import {
  BookOpen,
  Clock,
  type LucideIcon,
  MessageCircleQuestionMark,
  ScrollText,
  X,
} from 'lucide-react-native';
import { type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OfflineBanner } from '@/components/feedback';
import { DuaIcon } from '@/components/icons';
import {
  Chip,
  GradeChip,
  Icon,
  IconButton,
  IconTile,
  List,
  SearchField,
  Text,
  Touchable,
} from '@/components/ui';
import { DUAS } from '@/features/dua/duas';
import { duaRoute } from '@/features/dua/routes';
import { curatedHadith } from '@/features/hadith/data/collection';
import type { Hadith } from '@/features/hadith/data/types';
import { hadithRoute } from '@/features/hadith/routes';
import { madhhabPref } from '@/features/masail/madhhabStore';
import { masalahRoute } from '@/features/masail/routes';
import { answerOf, questionOf, searchMasail } from '@/features/masail/text';
import { SURAHS, surahName } from '@/features/quran/data/surahs';
import { quranRoute } from '@/features/quran/routes';
import { type Language, useLanguage } from '@/i18n';
import { routes } from '@/lib/routes';
import { matchesAny, normalize } from '@/lib/search';
import { makeStyles, useTheme } from '@/theme';

import { Highlight } from './Highlight';
import { addRecent, recentSearches, removeRecent } from './recentStore';
import { useQuranSearch } from './useQuranSearch';

type Tab = 'all' | 'quran' | 'hadith' | 'dua' | 'masail';
const TABS: readonly Tab[] = ['all', 'quran', 'hadith', 'dua', 'masail'];
const PREVIEW = 3;
const MAX = 50;

const JUMPS: readonly { key: Exclude<Tab, 'all'>; icon: LucideIcon; to: Href }[] = [
  { key: 'quran', icon: BookOpen, to: routes.quran },
  { key: 'hadith', icon: ScrollText, to: routes.hadith },
  { key: 'dua', icon: DuaIcon, to: routes.dua },
  { key: 'masail', icon: MessageCircleQuestionMark, to: routes.masail },
];

/** Hadith text in the field that matched, preferring the UI language. */
function hadithText(h: Hadith, q: string, language: Language): string {
  const order =
    language === 'bn'
      ? [h.bnBody, h.enBody, h.ar]
      : language === 'ar'
        ? [h.matn ?? h.ar, h.enBody, h.bnBody]
        : [h.enBody, h.bnBody, h.ar];
  return order.find((s) => normalize(s).includes(q)) ?? order[0]!;
}

/** 26a/b Search across the Quran, hadith, duas and masail. */
export default function SearchScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { language, localizeDigits } = useLanguage();
  const recent = recentSearches.use();
  const madhhab = madhhabPref.use();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const q = normalize(query.trim());
  const quran = useQuranSearch(query, language);

  const local = useMemo(() => {
    if (!q) return null;
    return {
      surahs: SURAHS.filter(
        (s) =>
          String(s.number) === q ||
          matchesAny(q, [s.name.en, s.name.bn, s.nameAr, s.meaning.en, s.meaning.bn]),
      ),
      hadith: curatedHadith().filter((h) =>
        matchesAny(q, [h.enBody, h.bnBody, h.ar, t(`hadith.books.${h.book}`)]),
      ),
      duas: DUAS.filter((d) =>
        matchesAny(q, [
          t(`dua.items.${d.id as 'iftar'}.title`),
          t(`dua.items.${d.id as 'iftar'}.translation`),
          d.transliteration,
          d.arabic,
        ]),
      ),
      masail: searchMasail(query, t),
    };
  }, [q, query, t]);

  const ayahs = quran.status === 'ready' ? quran.result.hits : [];
  const counts: Record<Tab, number> = { all: 0, quran: 0, hadith: 0, dua: 0, masail: 0 };
  if (local) {
    counts.quran = local.surahs.length + (quran.status === 'ready' ? quran.result.total : 0);
    counts.hadith = local.hadith.length;
    counts.dua = local.duas.length;
    counts.masail = local.masail.length;
    counts.all = counts.quran + counts.hadith + counts.dua + counts.masail;
  }
  const limit = tab === 'all' ? PREVIEW : MAX;
  const show = (g: Exclude<Tab, 'all'>) => (tab === 'all' || tab === g) && counts[g] > 0;

  const open = (to: Href) => {
    addRecent(query);
    router.push(to);
  };

  const group = (g: Exclude<Tab, 'all'>, icon: LucideIcon, rows: ReactNode[]) => (
    <View key={g} style={styles.group}>
      <View style={styles.groupHead}>
        <IconTile icon={icon} size="sm" />
        <Text variant="title" style={styles.grow} accessibilityRole="header">
          {t(`search.tabs.${g}`)}
        </Text>
        {tab === 'all' && counts[g] > rows.length ? (
          <Touchable accessibilityRole="button" onPress={() => setTab(g)} hitSlop={8}>
            <Text variant="label" weight="600" color="link">
              {t('search.seeAll', { n: localizeDigits(counts[g]) })}
            </Text>
          </Touchable>
        ) : null}
      </View>
      <List>{rows}</List>
    </View>
  );

  const quranRows = local
    ? [
        ...local.surahs.slice(0, limit).map((s) => (
          <ResultRow
            key={`s${s.number}`}
            title={t('search.surah', {
              name: surahName(s, language),
              n: localizeDigits(s.ayahCount),
            })}
            onPress={() => open(quranRoute(s.number))}
          >
            <Text script="quran" size={18} align="right">
              {s.nameAr}
            </Text>
          </ResultRow>
        )),
        ...ayahs.slice(0, Math.max(0, limit - Math.min(local.surahs.length, limit))).map((a) => (
          <ResultRow
            key={`a${a.surah}:${a.ayah}`}
            title={`${surahName(SURAHS[a.surah - 1]!, language)} ${localizeDigits(`${a.surah}:${a.ayah}`)}`}
            onPress={() => open(quranRoute(a.surah, a.ayah))}
          >
            <Highlight
              text={a.text}
              query={query}
              variant="body"
              size={14}
              script={/[؀-ۿ]/.test(a.text) ? 'quran' : undefined}
            />
          </ResultRow>
        )),
      ]
    : [];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.grow}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery('')}
            onSubmitEditing={() => addRecent(query)}
            placeholder={t('search.placeholder')}
            accessibilityLabel={t('search.label')}
            autoFocus
          />
        </View>
        <Touchable
          accessibilityRole="button"
          onPress={() => (router.canGoBack() ? router.back() : router.replace(routes.explore))}
          style={styles.cancel}
        >
          <Text variant="body" weight="600" color="link">
            {t('search.cancel')}
          </Text>
        </Touchable>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.offline}>
          <OfflineBanner />
        </View>
        {!local ? (
          <>
            <View style={styles.jumps}>
              {JUMPS.map((j) => (
                <Touchable
                  key={j.key}
                  accessibilityRole="link"
                  onPress={() => router.push(j.to)}
                  style={[styles.jump, { boxShadow: shadows.card }]}
                >
                  <IconTile icon={j.icon} size="sm" />
                  <Text variant="label" weight="600" color="text" numberOfLines={1}>
                    {t(`search.tabs.${j.key}`)}
                  </Text>
                </Touchable>
              ))}
            </View>

            {recent.length ? (
              <>
                <View style={styles.titleRow}>
                  <Text variant="title" style={styles.grow} accessibilityRole="header">
                    {t('search.recent')}
                  </Text>
                  <Touchable
                    accessibilityRole="button"
                    onPress={() => recentSearches.set([])}
                    hitSlop={8}
                  >
                    <Text variant="label" weight="600" color="link">
                      {t('search.clearAll')}
                    </Text>
                  </Touchable>
                </View>
                <List>
                  {recent.map((r) => (
                    <View key={r} style={styles.recent}>
                      <Touchable
                        accessibilityRole="button"
                        onPress={() => setQuery(r)}
                        style={styles.recentText}
                      >
                        <Icon icon={Clock} size={18} color="text2" />
                        <Text variant="body" style={styles.grow} numberOfLines={1}>
                          {r}
                        </Text>
                      </Touchable>
                      <IconButton
                        icon={X}
                        size={18}
                        color="text2"
                        accessibilityLabel={t('search.remove', { q: r })}
                        onPress={() => removeRecent(r)}
                      />
                    </View>
                  ))}
                </List>
              </>
            ) : null}

            <Text variant="title" style={styles.titleRow} accessibilityRole="header">
              {t('search.popular')}
            </Text>
            <View style={styles.popular}>
              {(t('search.popularItems', { returnObjects: true }) as string[]).map((p) => (
                <Chip key={p} label={p} onPress={() => setQuery(p)} />
              ))}
            </View>
          </>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabsWrap}
              contentContainerStyle={styles.tabs}
              accessibilityRole="tablist"
            >
              {TABS.map((tb) => (
                <Chip
                  key={tb}
                  label={t('search.tabCount', {
                    label: t(`search.tabs.${tb}`),
                    n: localizeDigits(counts[tb]),
                  })}
                  selected={tab === tb}
                  onPress={() => setTab(tb)}
                />
              ))}
            </ScrollView>

            {(tab === 'all' || tab === 'quran') && quran.status === 'loading' ? (
              <Text variant="caption" style={styles.status}>
                {t('search.quranSearching')}
              </Text>
            ) : null}
            {(tab === 'all' || tab === 'quran') && quran.status === 'error' ? (
              <Text variant="caption" style={styles.status}>
                {t('search.quranOffline')}
              </Text>
            ) : null}

            {show('quran') && quranRows.length ? group('quran', BookOpen, quranRows) : null}

            {show('hadith')
              ? group(
                  'hadith',
                  ScrollText,
                  local.hadith.slice(0, limit).map((h) => (
                    <ResultRow
                      key={`${h.book}:${h.n}`}
                      title={`${t(`hadith.books.${h.book}`)} ${localizeDigits(h.ref)}`}
                      badge={<GradeChip grade={h.grade} />}
                      onPress={() => open(hadithRoute(h.book, h.n, 'topic:all'))}
                    >
                      <Highlight
                        text={hadithText(h, q, language)}
                        query={query}
                        variant="body"
                        size={14}
                        numberOfLines={3}
                      />
                    </ResultRow>
                  )),
                )
              : null}

            {show('dua')
              ? group(
                  'dua',
                  DuaIcon,
                  local.duas.slice(0, limit).map((d) => (
                    <ResultRow
                      key={d.id}
                      title={t(`dua.items.${d.id as 'iftar'}.title`)}
                      onPress={() => open(duaRoute(d.id))}
                    >
                      <Text script="quran" size={18} align="right" numberOfLines={1}>
                        {d.arabic}
                      </Text>
                    </ResultRow>
                  )),
                )
              : null}

            {show('masail')
              ? group(
                  'masail',
                  MessageCircleQuestionMark,
                  local.masail.slice(0, limit).map((m) => (
                    <ResultRow
                      key={m.id}
                      title={questionOf(m, t)}
                      onPress={() => open(masalahRoute(m.id))}
                    >
                      <Highlight
                        text={answerOf(m, madhhab, t)}
                        query={query}
                        variant="body"
                        size={14}
                        numberOfLines={2}
                      />
                    </ResultRow>
                  )),
                )
              : null}

            {counts[tab] === 0 && quran.status !== 'loading' ? (
              <Text variant="subtle" align="center" style={styles.empty}>
                {t('search.noResults', { q: query.trim() })}
              </Text>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ResultRow({
  title,
  badge,
  onPress,
  children,
}: {
  title: string;
  badge?: ReactNode;
  onPress: () => void;
  children?: ReactNode;
}) {
  const styles = useStyles();
  return (
    <Touchable accessibilityRole="link" onPress={onPress} style={styles.result}>
      <View style={styles.resultHead}>
        <Text variant="bodyStrong" weight="700" size={14} style={styles.grow}>
          {title}
        </Text>
        {badge}
      </View>
      {children}
    </Touchable>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    header: {
      paddingHorizontal: t.size.gutter,
      paddingTop: t.space.sm,
      paddingBottom: t.space.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    cancel: { minHeight: t.size.touch, justifyContent: 'center' },
    body: { paddingHorizontal: t.size.gutter, paddingBottom: t.space.xxl },
    offline: { marginTop: t.space.sm },
    grow: { flex: 1 },
    jumps: { marginTop: t.space.md, flexDirection: 'row', gap: t.space.sm },
    jump: {
      flex: 1,
      minHeight: 76,
      paddingVertical: 10,
      paddingHorizontal: t.space.xxs,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    titleRow: {
      marginTop: t.space.lg,
      marginBottom: t.space.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.sm,
    },
    recent: {
      minHeight: t.size.touch + 4,
      paddingStart: t.space.lg,
      paddingEnd: t.space.xs,
      flexDirection: 'row',
      alignItems: 'center',
    },
    recentText: {
      flex: 1,
      minHeight: t.size.touch,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    popular: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm },
    tabsWrap: { marginTop: t.space.sm, marginHorizontal: -t.size.gutter, flexGrow: 0 },
    tabs: { paddingHorizontal: t.size.gutter, gap: t.space.sm },
    status: { marginTop: t.space.md },
    group: { marginTop: t.space.lg },
    groupHead: {
      marginBottom: t.space.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    result: { paddingVertical: t.space.md, paddingHorizontal: t.space.lg, gap: 6 },
    resultHead: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
    empty: { marginTop: t.space.xxl },
  }),
);
