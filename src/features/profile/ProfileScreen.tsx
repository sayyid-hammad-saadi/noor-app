import { type Href, useRouter } from 'expo-router';
import {
  Bookmark,
  ChevronRight,
  Cloud,
  Download,
  FileText,
  Heart,
  type LucideIcon,
  Settings,
  UserRound,
} from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/feedback';
import {
  Avatar,
  Button,
  Icon,
  IconButton,
  IconTile,
  type IconTileTone,
  List,
  SegmentedControl,
  Text,
  Touchable,
} from '@/components/ui';
import { account } from '@/features/auth/auth';
import { duaBookmarks, hadithBookmarks } from '@/features/hadith/library';
import { nameFavorites } from '@/features/names/favorites';
import { prayerLog, prayerStreak } from '@/features/prayer/prayerLog';
import { bookmarks, pagesRead } from '@/features/quran/data/library';
import { downloadedAudioBytes } from '@/features/quran/data/reciters';
import { zakatRecords } from '@/features/zakat/zakatStore';
import { type Language, LANGUAGES, languageMeta, useLanguage } from '@/i18n';
import { routes } from '@/lib/routes';
import { type Appearance, makeStyles, useTheme, useThemeContext } from '@/theme';

const APPEARANCES: readonly Appearance[] = ['light', 'dark', 'system'];

/** 29a/b Profile: account (or guest), yearly stats, saved things and quick settings. */
export default function ProfileScreen() {
  const styles = useStyles();
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { appearance, setAppearance } = useThemeContext();
  const { language, setLanguage, localizeDigits } = useLanguage();
  const user = account.use();
  const pages = pagesRead.use()[String(new Date().getFullYear())]?.length ?? 0;
  const streak = prayerStreak(prayerLog.use());
  const reports = Object.keys(zakatRecords.use()).length;
  const saved =
    bookmarks.use().length +
    hadithBookmarks.use().length +
    duaBookmarks.use().length +
    nameFavorites.use().length;
  const names = nameFavorites.use().length;
  const [audioBytes] = useState(downloadedAudioBytes);
  const soon = () => toast.show({ message: t('explore.comingSoon') });

  const mb = audioBytes / 1024 / 1024;
  const audio =
    mb >= 1024
      ? t('profile.gb', { n: localizeDigits((mb / 1024).toFixed(1)) })
      : t('profile.mb', { n: localizeDigits(Math.round(mb)) });

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text variant="h1" accessibilityRole="header">
            {t('profile.title')}
          </Text>
          <IconButton
            icon={Settings}
            size={22}
            accessibilityLabel={t('profile.settings')}
            onPress={soon}
            style={styles.edgeEnd}
          />
        </View>

        <View style={[styles.card, { boxShadow: shadows.card }]}>
          {user ? (
            <View style={styles.row}>
              <Avatar initials={initials(user.name || user.email)} size={56} />
              <View style={styles.grow}>
                <Text variant="title">{user.name || user.email}</Text>
                <Text variant="caption">{user.email}</Text>
              </View>
              <Button label={t('profile.edit')} variant="secondary" size="sm" onPress={soon} />
            </View>
          ) : (
            <>
              <View style={styles.row}>
                <View style={styles.guestAvatar}>
                  <Icon icon={UserRound} size={28} color="text2" />
                </View>
                <View style={styles.grow}>
                  <Text variant="title">{t('profile.guest')}</Text>
                  <Text variant="caption">{t('profile.guestNote')}</Text>
                </View>
              </View>
              <View style={styles.info}>
                <Icon icon={Cloud} size={18} color="link" />
                <View style={styles.grow}>
                  <Text variant="label" weight="700" color="text">
                    {t('profile.syncTitle')}
                  </Text>
                  <Text variant="label" weight="400" color="text">
                    {t('profile.syncBody')}
                  </Text>
                </View>
              </View>
              <Button
                label={t('profile.signIn')}
                size="sm"
                onPress={() => router.push(routes.login)}
              />
            </>
          )}
        </View>

        <View style={styles.stats}>
          <Stat value={localizeDigits(pages)} label={t('profile.stats.pages')} />
          <Stat
            value={localizeDigits(streak)}
            unit={t('profile.stats.days')}
            label={t('profile.stats.streak')}
          />
          <Stat value={localizeDigits(reports)} label={t('profile.stats.zakat')} />
        </View>

        <List style={styles.list}>
          <LinkRow
            icon={Bookmark}
            tone="gold"
            title={t('bookmarks.title')}
            value={localizeDigits(saved)}
            to={routes.bookmarks}
          />
          <LinkRow
            icon={Heart}
            title={t('profile.favoriteNames')}
            value={localizeDigits(names)}
            to={routes.nameFavorites}
          />
          <LinkRow
            icon={FileText}
            title={t('profile.zakatHistory')}
            value={localizeDigits(reports)}
            to={routes.zakatHistory}
          />
          <LinkRow icon={Download} title={t('profile.audio')} value={audio} />
        </List>

        <View style={[styles.card, styles.quick, { boxShadow: shadows.card }]}>
          <View style={styles.quickRow}>
            <Text variant="label">{t('profile.language')}</Text>
            <SegmentedControl<Language>
              value={language}
              onChange={(l) => void setLanguage(l)}
              accessibilityLabel={t('profile.language')}
              options={LANGUAGES.map((l) => ({ value: l, label: languageMeta[l].nativeName }))}
            />
          </View>
          <View style={styles.quickRow}>
            <Text variant="label">{t('profile.theme')}</Text>
            <SegmentedControl<Appearance>
              value={appearance}
              onChange={setAppearance}
              accessibilityLabel={t('profile.theme')}
              options={APPEARANCES.map((a) => ({ value: a, label: t(`appearance.${a}`) }))}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function initials(name: string): string {
  const parts = name
    .trim()
    .split(/[\s@.]+/)
    .filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

function Stat({ value, unit, label }: { value: string; unit?: string; label: string }) {
  const styles = useStyles();
  const { shadows } = useTheme();
  return (
    <View style={[styles.stat, { boxShadow: shadows.card }]} accessible>
      <Text size={22} weight="700" color="primary" tabular>
        {value}
        {unit ? (
          <Text variant="caption" weight="600" color="primary">
            {` ${unit}`}
          </Text>
        ) : null}
      </Text>
      <Text variant="caption">{label}</Text>
    </View>
  );
}

function LinkRow({
  icon,
  tone = 'tint',
  title,
  value,
  to,
}: {
  icon: LucideIcon;
  tone?: IconTileTone;
  title: string;
  value: string;
  to?: Href;
}) {
  const styles = useStyles();
  const router = useRouter();
  const content = (
    <>
      <IconTile icon={icon} tone={tone} size="sm" />
      <Text variant="bodyStrong" weight="600" style={styles.grow}>
        {title}
      </Text>
      <Text variant="label" color="text2" tabular>
        {value}
      </Text>
      {to ? <Icon icon={ChevronRight} size={18} color="text2" flipInRTL /> : null}
    </>
  );
  return to ? (
    <Touchable accessibilityRole="link" onPress={() => router.push(to)} style={styles.link}>
      {content}
    </Touchable>
  ) : (
    <View style={styles.link} accessible>
      {content}
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    body: { paddingHorizontal: t.size.gutter, paddingBottom: t.space.xxl },
    titleRow: {
      minHeight: t.size.topBar,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    edgeEnd: { marginEnd: -t.space.sm },
    card: {
      marginTop: t.space.sm,
      padding: t.space.lg,
      gap: t.space.md,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
    grow: { flex: 1 },
    guestAvatar: {
      width: 56,
      height: 56,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: {
      padding: t.space.md,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.tint,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    stats: { marginTop: t.space.md, flexDirection: 'row', gap: t.space.sm },
    stat: {
      flex: 1,
      padding: t.space.md,
      gap: 2,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
    list: { marginTop: t.space.md },
    link: {
      minHeight: 56,
      paddingVertical: 10,
      paddingHorizontal: t.space.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    quick: { marginTop: t.space.md },
    quickRow: { gap: t.space.sm },
  }),
);
