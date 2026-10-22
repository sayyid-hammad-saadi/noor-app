import { useRouter } from 'expo-router';
import { BellOff, SlidersHorizontal } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { TopBar } from '@/components/layout';
import { Chip, IconButton, IconTile, List, Text, Touchable } from '@/components/ui';
import { useLocation } from '@/features/location/LocationProvider';
import { clockLabel } from '@/features/prayer/formatTime';
import { useLanguage } from '@/i18n';
import { isSameDay } from '@/lib/dateLabels';
import { settingsRoutes } from '@/features/settings/routes';
import { makeStyles } from '@/theme';

import { markAllRead, markRead } from './readStore';
import { type Notice, type NoticeKind, useNotifications } from './useNotifications';

type Filter = 'all' | Exclude<NoticeKind, 'reminder'>;
const FILTERS: readonly Filter[] = ['all', 'prayer', 'event'];
type Group = 'today' | 'yesterday' | 'week';

/** 27 Notifications: today, yesterday and this week, with read state. */
export default function NotificationsScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { place } = useLocation();
  const { notices, unread } = useNotifications();
  const [filter, setFilter] = useState<Filter>('all');

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const groupOf = (n: Notice): Group =>
    isSameDay(n.at, now) ? 'today' : isSameDay(n.at, yesterday) ? 'yesterday' : 'week';
  const shown = notices.filter((n) => filter === 'all' || n.kind === filter);
  const groups = (['today', 'yesterday', 'week'] as const)
    .map((g) => ({ g, items: shown.filter((n) => groupOf(n) === g) }))
    .filter((x) => x.items.length);
  const weekdays = t('date.weekdaysShort', { returnObjects: true }) as string[];
  const timeOf = (n: Notice) =>
    groupOf(n) === 'week'
      ? (weekdays[n.at.getDay()] ?? '')
      : clockLabel(n.at, language, place.timeZone, t);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        title={t('notifications.title')}
        right={
          <IconButton
            icon={SlidersHorizontal}
            size={22}
            accessibilityLabel={t('notifications.settings')}
            onPress={() => router.push(settingsRoutes.home)}
          />
        }
      />
      <View style={styles.bar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.grow}
        >
          {FILTERS.map((f) => (
            <Chip
              key={f}
              label={t(`notifications.filters.${f}`)}
              selected={filter === f}
              onPress={() => setFilter(f)}
            />
          ))}
        </ScrollView>
        {unread ? (
          <Touchable
            accessibilityRole="button"
            onPress={() => markAllRead()}
            hitSlop={8}
            style={styles.markAll}
          >
            <Text variant="label" weight="600" color="link" numberOfLines={1}>
              {t('notifications.markAllRead')}
            </Text>
          </Touchable>
        ) : null}
      </View>

      {groups.length ? (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {groups.map(({ g, items }) => (
            <View key={g}>
              <Text variant="section" style={styles.section} accessibilityRole="header">
                {t(`notifications.groups.${g}`)}
              </Text>
              <List>
                {items.map((n) => (
                  <Touchable
                    key={n.id}
                    accessibilityRole="link"
                    accessibilityHint={n.unread ? t('notifications.unread') : undefined}
                    onPress={() => {
                      markRead(n.id);
                      router.push(n.to);
                    }}
                    style={styles.row}
                  >
                    <IconTile icon={n.icon} tone={n.tone} size="sm" />
                    <View style={styles.grow}>
                      <View style={styles.titleRow}>
                        <Text
                          variant="bodyStrong"
                          weight={n.unread ? '700' : '600'}
                          size={14}
                          style={styles.shrink}
                        >
                          {n.title}
                        </Text>
                        {n.unread ? <View style={styles.dot} /> : null}
                      </View>
                      <Text variant="subtle" size={13}>
                        {n.body}
                      </Text>
                    </View>
                    <Text variant="caption" tabular>
                      {timeOf(n)}
                    </Text>
                  </Touchable>
                ))}
              </List>
            </View>
          ))}
        </ScrollView>
      ) : (
        <EmptyState
          icon={BellOff}
          title={t('notifications.empty.title')}
          body={t('notifications.empty.body')}
        />
      )}
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    bar: {
      paddingTop: t.space.xs,
      paddingEnd: t.size.gutter,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.sm,
    },
    chips: { paddingStart: t.size.gutter, gap: t.space.sm },
    markAll: { minHeight: t.size.touch, justifyContent: 'center' },
    body: { paddingHorizontal: t.size.gutter, paddingBottom: t.space.xxl },
    section: { marginTop: t.space.lg, marginBottom: t.space.sm },
    row: {
      paddingVertical: t.space.md,
      paddingHorizontal: t.space.lg,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: t.space.md,
    },
    grow: { flex: 1 },
    shrink: { flexShrink: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: {
      width: 8,
      height: 8,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.primary,
    },
  }),
);
