import { type Href, useRouter } from 'expo-router';
import {
  Bell,
  Bookmark,
  BookOpen,
  CalendarDays,
  CalendarHeart,
  Clock,
  Coins,
  Compass,
  Hourglass,
  type LucideIcon,
  MessageCircleQuestionMark,
  MoonStar,
  ScrollText,
  Search,
  Sparkle,
  Volume2,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/feedback';
import { DuaIcon, TasbihIcon } from '@/components/icons';
import { Icon, IconButton, Text, Touchable } from '@/components/ui';
import { monthAmolRoute } from '@/features/calendar/routes';
import { routes } from '@/lib/routes';
import { toHijri } from '@/lib/calendars';
import { makeStyles, useTheme } from '@/theme';

type Feature = {
  key: string;
  icon: LucideIcon | 'asma';
  gold?: boolean;
  /** Screen to open; missing means the screen arrives in a later batch. */
  to?: Href;
};

const SECTIONS: readonly { key: 'worship' | 'learn' | 'tools'; items: Feature[] }[] = [
  {
    key: 'worship',
    items: [
      { key: 'prayer', icon: Clock, to: routes.prayerTimes },
      { key: 'qibla', icon: Compass, to: routes.qibla },
      { key: 'tasbih', icon: TasbihIcon, to: routes.tasbih },
      { key: 'dua', icon: DuaIcon, to: routes.dua },
      { key: 'ramadan', icon: MoonStar, gold: true, to: routes.ramadan },
      { key: 'adhan', icon: Volume2 },
    ],
  },
  {
    key: 'learn',
    items: [
      { key: 'quran', icon: BookOpen, to: routes.quran },
      { key: 'hadith', icon: ScrollText, to: routes.hadith },
      { key: 'masail', icon: MessageCircleQuestionMark, to: routes.masail },
      { key: 'asma', icon: 'asma' },
      { key: 'names', icon: Sparkle, to: routes.names },
      { key: 'monthAmol', icon: CalendarHeart },
    ],
  },
  {
    key: 'tools',
    items: [
      { key: 'zakat', icon: Coins, to: routes.zakat },
      { key: 'calendar', icon: CalendarDays, to: routes.calendar },
      { key: 'bookmarks', icon: Bookmark, gold: true, to: routes.bookmarks },
    ],
  },
];

/** 20 Explore: every feature, grouped. */
export default function ExploreScreen() {
  const styles = useStyles();
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const soon = () => toast.show({ message: t('explore.comingSoon'), icon: Hourglass });

  const open = (f: Feature) => {
    if (f.key === 'monthAmol') {
      const h = toHijri(new Date());
      router.push(monthAmolRoute(h.year, h.month));
    } else if (f.to) router.push(f.to);
    else soon();
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text variant="h1" accessibilityRole="header">
            {t('explore.title')}
          </Text>
          <IconButton
            icon={Bell}
            size={22}
            accessibilityLabel={t('explore.notifications')}
            onPress={() => router.push(routes.notifications)}
            style={styles.edgeEnd}
          />
        </View>
        <Touchable
          accessibilityRole="search"
          onPress={() => router.push(routes.search)}
          style={styles.search}
        >
          <Icon icon={Search} size={20} color="text2" />
          <Text color="text2" numberOfLines={1} style={styles.grow}>
            {t('explore.search')}
          </Text>
        </Touchable>

        {SECTIONS.map((section) => (
          <View key={section.key}>
            <View style={styles.sectionHead}>
              <Text variant="title" accessibilityRole="header">
                {t(`explore.sections.${section.key}.title`)}
              </Text>
              <Text variant="caption">{t(`explore.sections.${section.key}.caption`)}</Text>
            </View>
            <View style={styles.grid}>
              {section.items.map((f) => (
                <Touchable
                  key={f.key}
                  accessibilityRole="button"
                  onPress={() => open(f)}
                  style={[styles.tile, { boxShadow: shadows.card }]}
                >
                  <View style={[styles.iconTile, f.gold && styles.iconGold]}>
                    {f.icon === 'asma' ? (
                      <Text script="ar" size={17} weight="600" color="primary" style={styles.asma}>
                        ٩٩
                      </Text>
                    ) : (
                      <Icon icon={f.icon} size={22} color={f.gold ? 'goldText' : 'primary'} />
                    )}
                  </View>
                  <Text variant="label" weight="600" color="text" align="center" numberOfLines={2}>
                    {t(`explore.features.${f.key as 'prayer'}`)}
                  </Text>
                </Touchable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
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
    search: {
      marginTop: t.space.sm,
      minHeight: t.size.search,
      paddingHorizontal: 14,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    grow: { flex: 1 },
    sectionHead: {
      marginTop: t.space.lg,
      marginBottom: t.space.sm,
      marginHorizontal: t.space.xxs,
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: t.space.sm,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm },
    tile: {
      width: '31.5%',
      flexGrow: 1,
      maxWidth: '33%',
      minHeight: 84,
      paddingVertical: t.space.md,
      paddingHorizontal: t.space.xs,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
      alignItems: 'center',
      justifyContent: 'center',
      gap: t.space.sm,
    },
    iconTile: {
      width: 40,
      height: 40,
      borderRadius: t.radius.md,
      backgroundColor: t.colors.tint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconGold: { backgroundColor: t.colors.goldTint },
    asma: { lineHeight: 22 },
  }),
);
