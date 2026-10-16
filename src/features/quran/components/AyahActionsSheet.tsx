import * as Clipboard from 'expo-clipboard';
import {
  BookOpenText,
  Bookmark,
  ChevronRight,
  Copy,
  PencilLine,
  Play,
  Repeat,
  Share2,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Share, StyleSheet, View } from 'react-native';

import { BottomSheet, useToast } from '@/components/feedback';
import { Icon, IconButton, Text, Touchable, type ColorToken } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

import { REPEATS, useQuranAudio } from '../audio/QuranAudioProvider';
import { bookmarks, isBookmarked, noteKey, notes, toggleBookmark } from '../data/library';
import type { Ayah } from '../data/quranApi';
import { type Surah, surahName } from '../data/surahs';

/** 10b Ayah actions: play, bookmark, copy, share, tafsir, repeat and note. */
export function AyahActionsSheet({
  surah,
  ayah,
  onClose,
  onEditNote,
}: {
  surah: Surah;
  ayah: Ayah | null;
  onClose: () => void;
  onEditNote: (ayah: Ayah) => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const toast = useToast();
  const { language, localizeDigits } = useLanguage();
  const audio = useQuranAudio();
  const marks = bookmarks.use();
  const allNotes = notes.use();
  const name = surahName(surah, language);
  const n = ayah?.number ?? 1;
  const saved = ayah ? isBookmarked(marks, surah.number, n) : false;
  const hasNote = ayah ? !!allNotes[noteKey(surah.number, n)] : false;
  const translation = ayah ? (language === 'bn' ? ayah.bn : ayah.en) : '';
  const shareText = ayah ? `${ayah.arabic}\n\n${translation}\n— ${name} ${surah.number}:${n}` : '';
  const repeat = audio.prefs.repeat;
  const nextRepeat =
    REPEATS[(REPEATS.indexOf(repeat as (typeof REPEATS)[number]) + 1) % REPEATS.length] ?? 1;

  const actions: {
    key: string;
    icon: LucideIcon;
    label: string;
    tone?: 'gold';
    filled?: boolean;
    onPress: () => void;
  }[] = [
    {
      key: 'play',
      icon: Play,
      label: t('quran.actions.play'),
      filled: true,
      onPress: () => {
        audio.play(surah.number, n);
        onClose();
      },
    },
    {
      key: 'bookmark',
      icon: Bookmark,
      label: t(saved ? 'quran.actions.bookmarked' : 'quran.actions.bookmark'),
      tone: 'gold',
      filled: saved,
      onPress: () => {
        const added = toggleBookmark(surah.number, n);
        toast.show({ message: t(added ? 'quran.actions.saved' : 'quran.actions.removed') });
      },
    },
    {
      key: 'copy',
      icon: Copy,
      label: t('quran.actions.copy'),
      onPress: () => {
        void Clipboard.setStringAsync(shareText).then(() =>
          toast.show({ message: t('quran.actions.copied') }),
        );
      },
    },
    {
      key: 'share',
      icon: Share2,
      label: t('quran.actions.share'),
      onPress: () => void Share.share({ message: shareText }),
    },
    {
      key: 'tafsir',
      icon: BookOpenText,
      label: t('quran.actions.tafsir'),
      onPress: () => toast.show({ message: t('quran.actions.tafsirSoon') }),
    },
  ];

  return (
    <BottomSheet visible={!!ayah} onClose={onClose}>
      {ayah ? (
        <>
          <View
            style={styles.head}
            accessibilityLabel={t('quran.actions.dialog', { surah: name, ayah: n })}
          >
            <View style={styles.grow}>
              <Text variant="title" accessibilityRole="header">
                {t('quran.actions.title', { surah: name, ayah: localizeDigits(n) })}
              </Text>
              <Text variant="caption">
                {t('quran.paraPage', {
                  juz: localizeDigits(ayah.juz),
                  page: localizeDigits(ayah.page),
                })}
              </Text>
            </View>
            <IconButton
              icon={X}
              size={22}
              color="text2"
              accessibilityLabel={t('actions.close')}
              onPress={onClose}
              style={styles.close}
            />
          </View>

          <View style={styles.preview}>
            <Text
              script="quran"
              size={26}
              align="right"
              numberOfLines={4}
              maxFontSizeMultiplier={1.2}
            >
              {ayah.arabic}
            </Text>
            {translation ? (
              <Text
                variant="label"
                weight="400"
                numberOfLines={4}
                script={language === 'bn' ? 'bn' : 'latin'}
              >
                {translation}
              </Text>
            ) : null}
          </View>

          <View style={styles.actions}>
            {actions.map((a) => {
              const fg: ColorToken = a.tone === 'gold' ? 'goldText' : 'link';
              return (
                <Touchable
                  key={a.key}
                  accessibilityRole="button"
                  onPress={a.onPress}
                  style={styles.action}
                >
                  <View style={[styles.box, a.tone === 'gold' && styles.boxGold]}>
                    <Icon icon={a.icon} size={22} color={fg} filled={a.filled} />
                  </View>
                  <Text
                    variant="caption"
                    weight="600"
                    color="text"
                    align="center"
                    numberOfLines={1}
                  >
                    {a.label}
                  </Text>
                </Touchable>
              );
            })}
          </View>

          <View style={styles.rows}>
            <Touchable
              accessibilityRole="button"
              onPress={() => {
                audio.setRepeat(nextRepeat);
                audio.play(surah.number, n, nextRepeat);
              }}
              style={[styles.row, styles.rowBorder]}
            >
              <Icon icon={Repeat} size={20} color="text2" />
              <Text variant="body" weight="500" style={styles.grow}>
                {t('quran.actions.repeat')}
              </Text>
              <Text variant="label" weight="600">
                {`${localizeDigits(repeat)}×`}
              </Text>
            </Touchable>
            <Touchable
              accessibilityRole="button"
              onPress={() => onEditNote(ayah)}
              style={styles.row}
            >
              <Icon icon={PencilLine} size={20} color="text2" />
              <Text variant="body" weight="500" style={styles.grow}>
                {t(hasNote ? 'quran.actions.editNote' : 'quran.actions.note')}
              </Text>
              <Icon icon={ChevronRight} size={18} color="text2" flipInRTL />
            </Touchable>
          </View>
        </>
      ) : null}
    </BottomSheet>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    grow: { flex: 1 },
    head: { flexDirection: 'row', alignItems: 'center', marginTop: t.space.xs },
    close: { marginEnd: -10 },
    preview: {
      paddingVertical: t.space.md,
      paddingHorizontal: t.space.lg,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.tint,
      gap: t.space.xs,
    },
    actions: { marginTop: t.space.sm, flexDirection: 'row', gap: t.space.xs },
    action: { flex: 1, alignItems: 'center', gap: t.space.sm },
    box: {
      width: 56,
      height: 56,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    boxGold: { backgroundColor: t.colors.goldTint },
    rows: { marginTop: t.space.sm, borderTopWidth: 1, borderTopColor: t.colors.border },
    row: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: t.space.md },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: t.colors.border },
  }),
);
