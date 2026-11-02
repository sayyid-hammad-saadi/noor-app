import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon, List, Text, Touchable } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

import type { Masalah } from '../masail';
import { masalahRoute } from '../routes';
import { questionOf } from '../text';

/** Grouped list of questions with "tag · n references" captions (.list .li). */
export function QuestionList({
  items,
  caption = 'tag',
}: {
  items: readonly Masalah[];
  /** Show the sub-topic tag, or the category name (popular and search lists). */
  caption?: 'tag' | 'category';
}) {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { localizeDigits } = useLanguage();
  return (
    <List>
      {items.map((m) => (
        <Touchable
          key={m.id}
          accessibilityRole="link"
          onPress={() => router.push(masalahRoute(m.id))}
          style={styles.row}
        >
          <View style={styles.text}>
            <Text variant="bodyStrong" weight="600">
              {questionOf(m, t)}
            </Text>
            <Text variant="caption">
              {t('masail.refsCount', {
                tag:
                  caption === 'tag'
                    ? t(`masail.tags.${m.tag as 'wudu'}`)
                    : t(`masail.categories.${m.category}.name`),
                n: localizeDigits(m.refs.length),
              })}
            </Text>
          </View>
          <Icon icon={ChevronRight} size={18} color="text2" flipInRTL />
        </Touchable>
      ))}
    </List>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: {
      minHeight: 64,
      paddingVertical: t.space.md,
      paddingHorizontal: t.space.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    text: { flex: 1, gap: 2 },
  }),
);
