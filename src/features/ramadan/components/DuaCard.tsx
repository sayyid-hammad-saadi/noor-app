import { Share2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Share, StyleSheet, View } from 'react-native';

import { SourceLine } from '@/components/content';
import { IconButton, Text } from '@/components/ui';
import { makeStyles, useTheme } from '@/theme';

import type { Dua } from '../content';
import { useLanguage } from '@/i18n';
import { sourceLabel } from '@/lib/sources';

/** A dua: Arabic, transliteration, translation and source (13b, 15). */
export function DuaCard({
  dua,
  eyebrow,
  eyebrowTone = 'text2',
  shareable,
}: {
  dua: Dua;
  eyebrow: string;
  eyebrowTone?: 'text2' | 'goldText';
  shareable?: boolean;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { localizeDigits } = useLanguage();
  const title = t(`ramadan.content.${dua.id as 'iftar'}.title`);
  const translation = t(`ramadan.content.${dua.id as 'iftar'}.translation`);

  const share = () =>
    void Share.share({
      message: [
        title,
        dua.arabic,
        dua.transliteration,
        translation,
        sourceLabel(dua.source, t, localizeDigits),
      ]
        .filter(Boolean)
        .join('\n\n'),
    });

  return (
    <View style={[styles.card, { boxShadow: shadows.card }]}>
      <View>
        <Text variant="caption" weight="700" color={eyebrowTone} style={styles.eyebrow}>
          {eyebrow}
        </Text>
        <Text variant="title" accessibilityRole="header">
          {title}
        </Text>
      </View>
      <Text script="quran" size={24} align="right" style={styles.arabic}>
        {dua.arabic}
      </Text>
      <Text script="latin" weight="500" color="link">
        {dua.transliteration}
      </Text>
      {translation ? <Text color="text2">{translation}</Text> : null}
      <View style={[styles.footer, shareable && styles.footerRule]}>
        <SourceLine source={dua.source} />
        {shareable ? (
          <IconButton
            icon={Share2}
            size={20}
            color="text2"
            accessibilityLabel={t('ramadan.shareDua')}
            onPress={share}
          />
        ) : null}
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    card: {
      paddingTop: 14,
      paddingStart: t.space.lg,
      paddingEnd: t.space.md,
      paddingBottom: t.space.sm,
      gap: 6,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
    eyebrow: { letterSpacing: 0.3 },
    arabic: { paddingEnd: t.space.xs },
    footer: {
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.space.sm,
    },
    footerRule: {
      minHeight: 48,
      marginTop: t.space.xs,
      borderTopWidth: 1,
      borderTopColor: t.colors.border,
    },
  }),
);
