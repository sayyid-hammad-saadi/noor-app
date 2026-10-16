import { Bookmark, ChevronRight, Share2 } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nManager, Share, StyleSheet, View } from 'react-native';

import { useToast } from '@/components/feedback';
import { AyahMarker, GradeChip, Icon, PillTabs, Text, Touchable } from '@/components/ui';
import { makeStyles, useTheme } from '@/theme';

import { DAILY_AYAH, DAILY_HADITH } from '../dailyContent';
import { useDailyBookmarks } from '../useDailyBookmarks';

type Tab = 'ayah' | 'hadith';

/** Daily Ayah / Hadith card. */
export function DailyCard({
  onReadInContext,
}: {
  /** Opens the reader; the hadith tab has no Quran context, so it is ayah-only. */
  onReadInContext: (surah: number, ayah: number) => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const toast = useToast();
  const { isBookmarked, toggle } = useDailyBookmarks();
  const [tab, setTab] = useState<Tab>('ayah');

  const item = tab === 'ayah' ? DAILY_AYAH : DAILY_HADITH;
  const translation = t(
    tab === 'ayah' ? 'home.daily.ayahTranslation' : 'home.daily.hadithTranslation',
  );
  const reference = t(tab === 'ayah' ? 'home.daily.ayahRef' : 'home.daily.hadithRef');
  const bookmarked = isBookmarked(item.id);

  const onBookmark = () => {
    const added = toggle(item.id);
    toast.show({ message: t(added ? 'home.daily.saved' : 'home.daily.removed') });
  };

  const onShare = () => {
    void Share.share({ message: `${item.arabic}\n\n${translation}\n— ${reference}` });
  };

  return (
    <View style={[styles.card, { boxShadow: shadows.card }]}>
      <View style={styles.top}>
        <PillTabs<Tab>
          value={tab}
          onChange={setTab}
          accessibilityLabel={t('home.daily.group')}
          options={[
            { value: 'ayah', label: t('home.daily.ayah') },
            { value: 'hadith', label: t('home.daily.hadith') },
          ]}
        />
        <View style={styles.actions}>
          <Touchable
            accessibilityRole="button"
            accessibilityLabel={t(bookmarked ? 'home.daily.removeBookmark' : 'home.daily.bookmark')}
            accessibilityState={{ selected: bookmarked }}
            onPress={onBookmark}
            style={styles.iconBtn}
          >
            <Icon
              icon={Bookmark}
              size={20}
              color={bookmarked ? 'gold' : 'text2'}
              filled={bookmarked}
            />
          </Touchable>
          <Touchable
            accessibilityRole="button"
            accessibilityLabel={t('home.daily.share')}
            onPress={onShare}
            style={styles.iconBtn}
          >
            <Icon icon={Share2} size={20} color="text2" />
          </Touchable>
        </View>
      </View>

      {/* Arabic reads right to left whatever the UI direction: text first, marker at its end. */}
      <View
        style={[styles.arabicRow, { flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse' }]}
      >
        {tab === 'ayah' ? (
          <>
            <Text script="quran" size={26} align="right" style={styles.arabic}>
              {DAILY_AYAH.arabic}
            </Text>
            <AyahMarker number={DAILY_AYAH.number} size={30} textSize={11} />
          </>
        ) : (
          <Text script="ar" size={22} weight="500" align="right" style={styles.arabic}>
            {DAILY_HADITH.arabic}
          </Text>
        )}
      </View>

      <Text script="latin" variant="body" weight="500" color="link">
        {item.transliteration}
      </Text>
      <Text variant="subtle">{translation}</Text>

      <View style={styles.footer}>
        <View style={styles.refRow}>
          <Text variant="caption" numberOfLines={1} style={styles.shrink}>
            {reference}
          </Text>
          {tab === 'hadith' ? <GradeChip grade={DAILY_HADITH.grade} /> : null}
        </View>
        {tab === 'ayah' ? (
          <Touchable
            accessibilityRole="link"
            onPress={() => onReadInContext(DAILY_AYAH.surah, DAILY_AYAH.number)}
            style={styles.link}
          >
            <Text variant="label" weight="600" color="link" numberOfLines={1}>
              {t('home.daily.readInContext')}
            </Text>
            <Icon icon={ChevronRight} size={16} color="link" flipInRTL />
          </Touchable>
        ) : null}
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    card: {
      borderRadius: t.radius.card,
      backgroundColor: t.colors.cardRaised,
      borderWidth: 1,
      borderColor: t.colors.border,
      paddingTop: t.space.md,
      paddingEnd: t.space.md,
      paddingBottom: t.space.xs,
      paddingStart: t.space.lg,
      gap: 6,
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.space.sm,
    },
    actions: { flexDirection: 'row' },
    iconBtn: {
      width: t.size.touch,
      height: t.size.touch,
      alignItems: 'center',
      justifyContent: 'center',
    },
    arabicRow: { alignItems: 'center', gap: 10, paddingEnd: t.space.xs },
    arabic: { flexShrink: 1 },
    footer: {
      marginTop: t.space.xs,
      minHeight: 48,
      borderTopWidth: 1,
      borderTopColor: t.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.space.sm,
    },
    refRow: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm, flexShrink: 1 },
    shrink: { flexShrink: 1 },
    link: { minHeight: t.size.touch, flexDirection: 'row', alignItems: 'center', gap: 2 },
  }),
);
