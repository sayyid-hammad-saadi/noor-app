import { type Href, useRouter } from 'expo-router';
import { Bookmark as BookmarkIcon, ChevronRight, Trash2 } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet, EmptyState, useToast } from '@/components/feedback';
import { TopBar } from '@/components/layout';
import {
  Button,
  Checkbox,
  Chip,
  GradeChip,
  Icon,
  List,
  Radio,
  Text,
  Touchable,
  UnderlineTabs,
} from '@/components/ui';
import { DUAS } from '@/features/dua/duas';
import { duaRoute } from '@/features/dua/routes';
import { curatedHadith } from '@/features/hadith/data/collection';
import type { BookId } from '@/features/hadith/data/types';
import { duaBookmarks, hadithBookmarks } from '@/features/hadith/library';
import { hadithRoute } from '@/features/hadith/routes';
import { nameFavorites } from '@/features/names/favorites';
import { getName } from '@/features/names/names';
import { nameRoute } from '@/features/names/routes';
import {
  BOOKMARK_FOLDERS,
  type BookmarkFolder,
  bookmarkKey,
  bookmarks,
  setBookmarkFolder,
} from '@/features/quran/data/library';
import { getSurah, surahName } from '@/features/quran/data/surahs';
import { quranRoute } from '@/features/quran/routes';
import { useLanguage } from '@/i18n';
import { routes } from '@/lib/routes';
import { makeStyles } from '@/theme';

import { useAyahTexts } from './useAyahTexts';

type Tab = 'quran' | 'hadith' | 'dua' | 'names';
const TABS: readonly Tab[] = ['quran', 'hadith', 'dua', 'names'];
const EMPTY_TARGET: Record<Tab, Href> = {
  quran: routes.quran,
  hadith: routes.hadith,
  dua: routes.dua,
  names: routes.names,
};
const DAY = 86_400_000;

type Row = {
  key: string;
  title: string;
  to: Href;
  folder?: BookmarkFolder;
  when?: string;
  badge?: ReactNode;
  arabic?: string;
  /** Short Arabic shown on the title row (names) instead of under it. */
  arabicInline?: string;
  body?: string;
};

/** 30a Bookmarks: saved ayahs (in folders), hadith, duas and favourite names. */
export default function BookmarksScreen() {
  const styles = useStyles();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { language, localizeDigits } = useLanguage();
  const quran = bookmarks.use();
  const hadith = hadithBookmarks.use();
  const duas = duaBookmarks.use();
  const names = nameFavorites.use();
  const ayahTexts = useAyahTexts(quran);
  const [tab, setTab] = useState<Tab>('quran');
  const [folder, setFolder] = useState<BookmarkFolder | 'all'>('all');
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [moving, setMoving] = useState(false);

  const counts: Record<Tab, number> = {
    quran: quran.length,
    hadith: hadith.length,
    dua: duas.length,
    names: names.length,
  };

  const when = (at: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.floor((today.getTime() - at) / DAY) + 1;
    if (at >= today.getTime()) return t('bookmarks.today');
    if (days === 1) return t('bookmarks.yesterday');
    if (days < 7) return t('bookmarks.daysAgo', { n: localizeDigits(days) });
    const d = new Date(at);
    const months = t('date.monthsShort', { returnObjects: true }) as string[];
    return `${localizeDigits(d.getDate())} ${months[d.getMonth()]}`;
  };

  const rows = ((): Row[] => {
    if (tab === 'quran') {
      return [...quran]
        .sort((a, b) => b.at - a.at)
        .filter((b) => folder === 'all' || b.folder === folder)
        .map((b) => ({
          key: bookmarkKey(b),
          title: `${surahName(getSurah(b.surah), language)} ${localizeDigits(`${b.surah}:${b.ayah}`)}`,
          to: quranRoute(b.surah, b.ayah),
          folder: b.folder,
          when: when(b.at),
          arabic: ayahTexts[bookmarkKey(b)],
        }));
    }
    if (tab === 'hadith') {
      const curated = curatedHadith();
      return hadith.map((key) => {
        const [book, n] = key.split(':') as [BookId, string];
        const h = curated.find((c) => c.book === book && c.n === Number(n));
        return {
          key,
          title: `${t(`hadith.books.${book}`)} ${localizeDigits(h?.ref ?? n)}`,
          to: hadithRoute(book, Number(n), 'saved'),
          badge: h ? <GradeChip grade={h.grade} /> : undefined,
          body: h
            ? language === 'bn'
              ? h.bnBody
              : language === 'ar'
                ? (h.matn ?? h.ar)
                : h.enBody
            : undefined,
        };
      });
    }
    if (tab === 'dua') {
      return duas.flatMap((id) => {
        const d = DUAS.find((x) => x.id === id);
        return d
          ? [
              {
                key: id,
                title: t(`dua.items.${id as 'iftar'}.title`),
                to: duaRoute(id),
                arabic: d.arabic,
              },
            ]
          : [];
      });
    }
    return names.flatMap((id) => {
      const n = getName(id);
      return n
        ? [
            {
              key: id,
              title: language === 'bn' ? `${n.en} · ${n.bn}` : n.en,
              to: nameRoute(id),
              arabicInline: n.ar,
              body: t(`names.items.${id as 'nur'}`),
            },
          ]
        : [];
    });
  })();

  const switchTab = (next: Tab) => {
    setTab(next);
    setSelected([]);
    setEditing(false);
  };
  const toggle = (key: string) =>
    setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));

  const remove = () => {
    const before = { quran, hadith, duas, names };
    const keys = selected;
    if (tab === 'quran') bookmarks.set((l) => l.filter((b) => !keys.includes(bookmarkKey(b))));
    if (tab === 'hadith') hadithBookmarks.set((l) => l.filter((k) => !keys.includes(k)));
    if (tab === 'dua') duaBookmarks.set((l) => l.filter((k) => !keys.includes(k)));
    if (tab === 'names') nameFavorites.set((l) => l.filter((k) => !keys.includes(k)));
    setSelected([]);
    toast.show({
      message: t('bookmarks.removed'),
      icon: Trash2,
      action: {
        label: t('actions.undo'),
        onPress: () => {
          bookmarks.set(before.quran);
          hadithBookmarks.set(before.hadith);
          duaBookmarks.set(before.duas);
          nameFavorites.set(before.names);
        },
      },
    });
  };

  const move = (to: BookmarkFolder | undefined) => {
    setBookmarkFolder(selected, to);
    setMoving(false);
    setSelected([]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        title={t('bookmarks.title')}
        right={
          counts[tab] ? (
            <Touchable
              accessibilityRole="button"
              onPress={() => {
                setEditing((e) => !e);
                setSelected([]);
              }}
              style={styles.edit}
            >
              <Text variant="body" weight="600" color="link">
                {editing ? t('bookmarks.done') : t('bookmarks.edit')}
              </Text>
            </Touchable>
          ) : null
        }
      />
      <View style={styles.tabs}>
        <UnderlineTabs<Tab>
          value={tab}
          onChange={switchTab}
          accessibilityLabel={t('bookmarks.title')}
          options={TABS.map((tb) => ({
            value: tb,
            label: counts[tb]
              ? t('bookmarks.tabCount', {
                  label: t(`bookmarks.tabs.${tb}`),
                  n: localizeDigits(counts[tb]),
                })
              : t(`bookmarks.tabs.${tb}`),
          }))}
        />
      </View>

      {counts[tab] === 0 ? (
        <EmptyState
          icon={BookmarkIcon}
          title={t(`bookmarks.empty.${tab}.title`)}
          body={t(`bookmarks.empty.${tab}.body`)}
          action={{
            label: t(`bookmarks.empty.${tab}.action`),
            onPress: () => router.push(EMPTY_TARGET[tab]),
          }}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {tab === 'quran' ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsWrap}
              contentContainerStyle={styles.chips}
            >
              {(['all', ...BOOKMARK_FOLDERS] as const).map((f) => (
                <Chip
                  key={f}
                  label={t(`bookmarks.folders.${f}`)}
                  selected={folder === f}
                  onPress={() => setFolder(f)}
                />
              ))}
            </ScrollView>
          ) : null}
          {rows.length ? (
            <List style={styles.list}>
              {rows.map((r) => (
                <BookmarkRow
                  key={r.key}
                  row={r}
                  editing={editing}
                  checked={selected.includes(r.key)}
                  onPress={() => (editing ? toggle(r.key) : router.push(r.to))}
                />
              ))}
            </List>
          ) : (
            <Text variant="subtle" align="center" style={styles.none}>
              {t('states.emptyTitle')}
            </Text>
          )}
        </ScrollView>
      )}

      {editing && counts[tab] ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Text variant="label" weight="600" color="text" numberOfLines={1} style={styles.grow}>
            {t('bookmarks.selected', { n: localizeDigits(selected.length) })}
          </Text>
          {tab === 'quran' ? (
            <Button
              label={t('bookmarks.move')}
              variant="secondary"
              size="sm"
              disabled={!selected.length}
              onPress={() => setMoving(true)}
            />
          ) : null}
          <Button
            label={t('bookmarks.remove')}
            variant="destructive"
            size="sm"
            disabled={!selected.length}
            onPress={remove}
          />
        </View>
      ) : null}

      <BottomSheet visible={moving} onClose={() => setMoving(false)} title={t('bookmarks.move')}>
        <View accessibilityRole="radiogroup" style={styles.sheet}>
          {[...BOOKMARK_FOLDERS, undefined].map((f) => (
            <Touchable
              key={f ?? 'none'}
              accessibilityRole="radio"
              accessibilityState={{ checked: false }}
              onPress={() => move(f)}
              style={styles.sheetRow}
            >
              <Text variant="bodyStrong" style={styles.grow}>
                {f ? t(`bookmarks.folders.${f}`) : t('bookmarks.noFolder')}
              </Text>
              <Radio selected={false} />
            </Touchable>
          ))}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

function BookmarkRow({
  row,
  editing,
  checked,
  onPress,
}: {
  row: Row;
  editing: boolean;
  checked: boolean;
  onPress: () => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <Touchable
      accessibilityRole={editing ? 'checkbox' : 'link'}
      accessibilityState={editing ? { checked } : undefined}
      onPress={onPress}
      style={styles.row}
    >
      {editing ? <Checkbox checked={checked} accessibilityLabel={row.title} /> : null}
      <View style={styles.grow}>
        <View style={styles.r1}>
          <Text
            variant="bodyStrong"
            weight="700"
            size={14}
            numberOfLines={row.arabicInline ? 2 : 1}
            style={row.arabicInline ? styles.shrink : null}
          >
            {row.title}
          </Text>
          {row.folder ? (
            <View style={styles.folder}>
              <Text variant="micro" weight="600" color="link" numberOfLines={1}>
                {t(`bookmarks.folders.${row.folder}`)}
              </Text>
            </View>
          ) : null}
          {row.badge}
          <View style={styles.grow} />
          {row.arabicInline ? (
            <Text script="quran" size={20} numberOfLines={1}>
              {row.arabicInline}
            </Text>
          ) : null}
        </View>
        {row.when ? <Text variant="caption">{row.when}</Text> : null}
        {row.arabic ? (
          <Text script="quran" size={20} align="right" numberOfLines={2}>
            {row.arabic}
          </Text>
        ) : null}
        {row.body ? (
          <Text variant="subtle" size={14} numberOfLines={2}>
            {row.body}
          </Text>
        ) : null}
      </View>
      {editing ? null : <Icon icon={ChevronRight} size={18} color="text2" flipInRTL />}
    </Touchable>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    edit: { minHeight: t.size.touch, justifyContent: 'center', paddingHorizontal: t.space.xs },
    tabs: { paddingHorizontal: t.size.gutter },
    body: { paddingHorizontal: t.size.gutter, paddingBottom: t.space.xxl },
    chipsWrap: { marginTop: t.space.md, marginHorizontal: -t.size.gutter, flexGrow: 0 },
    chips: { paddingHorizontal: t.size.gutter, gap: t.space.sm },
    list: { marginTop: t.space.md },
    none: { marginTop: t.space.xxl },
    row: {
      paddingVertical: t.space.md,
      paddingHorizontal: t.space.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    r1: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
    shrink: { flexShrink: 1 },
    grow: { flex: 1 },
    folder: {
      flexShrink: 1,
      minHeight: 22,
      paddingHorizontal: t.space.sm,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.tint,
      justifyContent: 'center',
    },
    footer: {
      paddingTop: t.space.md,
      paddingHorizontal: t.size.gutter,
      borderTopWidth: 1,
      borderTopColor: t.colors.border,
      backgroundColor: t.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.sm,
    },
    sheet: { paddingBottom: t.space.md },
    sheetRow: {
      minHeight: t.size.touch + 4,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
  }),
);
