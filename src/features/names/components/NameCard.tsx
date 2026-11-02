import { Heart, Image as ImageIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Icon, Text, Touchable } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';

import type { IslamicName } from '../names';

/** The generated name (23a card). */
export function NameCard({
  name,
  saved,
  onToggleSave,
  onShare,
  onDetails,
}: {
  name: IslamicName;
  saved: boolean;
  onToggleSave: () => void;
  onShare: () => void;
  onDetails: () => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { localizeDigits } = useLanguage();
  return (
    <View style={[styles.card, { boxShadow: shadows.card }]}>
      <View style={styles.top}>
        <View style={styles.grow}>
          <Text size={24} weight="700" script="latin">
            {name.en}
          </Text>
          <Text script="bn" size={15} color="text2">
            {`${name.bn} · ${name.pron.replace(/ · /g, '-')}`}
          </Text>
        </View>
        <Text script="quran" size={34} color="link">
          {name.ar}
        </Text>
      </View>
      <Text>{t(`names.items.${name.id as 'nur'}`)}</Text>
      <View style={styles.tags}>
        {name.verse ? (
          <View style={[styles.tag, styles.tagTint]}>
            <Text variant="caption" weight="600" color="link">
              {t('names.inQuran', { ref: localizeDigits(name.verse.ref) })}
            </Text>
          </View>
        ) : null}
        <View style={styles.tag}>
          <Text variant="caption" weight="600">
            {t('names.origin', { origin: t(`names.origins.${name.origin}`) })}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Touchable
          accessibilityRole="button"
          accessibilityState={{ selected: saved }}
          accessibilityLabel={saved ? t('names.unsave') : t('names.save')}
          onPress={onToggleSave}
          style={styles.heart}
        >
          <Icon icon={Heart} size={20} color={saved ? 'dangerText' : 'text2'} filled={saved} />
        </Touchable>
        <Button
          label={t('names.shareCard')}
          icon={ImageIcon}
          variant="secondary"
          size="sm"
          grow
          onPress={onShare}
        />
        <Button label={t('names.details')} variant="ghost" size="sm" onPress={onDetails} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    card: {
      padding: t.space.lg,
      gap: 10,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
    top: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: t.space.sm,
    },
    grow: { flex: 1 },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    tag: {
      minHeight: 26,
      paddingHorizontal: 10,
      borderRadius: t.radius.pill,
      borderWidth: 1,
      borderColor: t.colors.border,
      justifyContent: 'center',
    },
    tagTint: { backgroundColor: t.colors.tint, borderColor: t.colors.tint },
    actions: { marginTop: t.space.xs, flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
    heart: {
      width: 52,
      height: t.size.buttonSm,
      borderRadius: t.radius.md,
      borderWidth: 1.5,
      borderColor: t.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);
