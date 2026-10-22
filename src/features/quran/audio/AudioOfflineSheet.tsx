import { CloudDownload, WifiOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { BottomSheet, useToast } from '@/components/feedback';
import { Avatar, Button, IconTile, Text } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

import { isSurahDownloaded, type Reciter, RECITERS } from '../data/reciters';
import { getSurah, surahName } from '../data/surahs';
import { queueDownload } from './pendingDownloads';

/**
 * 34f Offline and this recitation isn't downloaded: play another reciter's download,
 * read without audio, or download automatically once back online.
 */
export function AudioOfflineSheet({
  request,
  reciter,
  onClose,
  onPlayWith,
}: {
  request: { surah: number } | null;
  reciter: Reciter;
  onClose: () => void;
  onPlayWith: (reciterId: string) => void;
}) {
  const styles = useStyles();
  const toast = useToast();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const surah = request ? getSurah(request.surah) : null;
  const offline = surah
    ? RECITERS.filter(
        (r) => r.id !== reciter.id && isSurahDownloaded(r, surah.firstAyahId, surah.ayahCount),
      )
    : [];

  return (
    <BottomSheet visible={!!surah} onClose={onClose}>
      {surah ? (
        <View style={styles.body}>
          <View style={styles.head}>
            <IconTile icon={WifiOff} tone="neutral" size="lg" />
            <Text variant="h2" align="center" accessibilityRole="header">
              {t('quran.offline.title', { surah: surahName(surah, language) })}
            </Text>
            <Text variant="subtle" align="center">
              {t('quran.offline.body', { reciter: reciter.name[language] })}
            </Text>
          </View>
          {offline.map((r) => (
            <View key={r.id} style={styles.alt}>
              <Avatar initials={r.initials} />
              <View style={styles.grow}>
                <Text variant="bodyStrong" weight="600">
                  {r.name[language]}
                </Text>
                <Text variant="caption">{t('quran.offline.downloaded')}</Text>
              </View>
              <Button
                label={t('quran.offline.playOffline')}
                size="sm"
                onPress={() => onPlayWith(r.id)}
              />
            </View>
          ))}
          <Button label={t('quran.offline.readOnly')} variant="secondary" onPress={onClose} />
          <Button
            label={t('quran.offline.later')}
            icon={CloudDownload}
            variant="ghost"
            onPress={() => {
              queueDownload({ reciter: reciter.id, surah: surah.number });
              toast.show({ message: t('quran.offline.queued'), icon: CloudDownload });
              onClose();
            }}
          />
        </View>
      ) : null}
    </BottomSheet>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    body: { gap: t.space.md, paddingBottom: t.space.md },
    head: { alignItems: 'center', gap: t.space.sm, paddingBottom: t.space.xs },
    alt: {
      padding: t.space.md,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.surface2,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    grow: { flex: 1 },
  }),
);
