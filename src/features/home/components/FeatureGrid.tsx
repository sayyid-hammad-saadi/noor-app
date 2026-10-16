import {
  BookOpen,
  CalendarDays,
  Coins,
  Compass,
  Grid2x2Plus,
  type LucideIcon,
  MessageCircleQuestionMark,
  ScrollText,
  Sparkle,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { DuaIcon, TasbihIcon } from '@/components/icons';
import { Icon, Text, Touchable } from '@/components/ui';
import { makeStyles } from '@/theme';

export type FeatureKey =
  | 'quran'
  | 'qibla'
  | 'zakat'
  | 'calendar'
  | 'hadith'
  | 'masail'
  | 'names'
  | 'tasbih'
  | 'dua'
  | 'more';

const FEATURES: readonly { key: FeatureKey; icon: LucideIcon }[] = [
  { key: 'quran', icon: BookOpen },
  { key: 'qibla', icon: Compass },
  { key: 'zakat', icon: Coins },
  { key: 'calendar', icon: CalendarDays },
  { key: 'hadith', icon: ScrollText },
  { key: 'masail', icon: MessageCircleQuestionMark },
  { key: 'names', icon: Sparkle },
  { key: 'tasbih', icon: TasbihIcon },
  { key: 'dua', icon: DuaIcon },
  { key: 'more', icon: Grid2x2Plus },
];

/** 5×2 shortcut grid on the Home sheet. */
export function FeatureGrid({ onPress }: { onPress: (key: FeatureKey) => void }) {
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <View style={styles.grid}>
      {FEATURES.map((f) => {
        const more = f.key === 'more';
        return (
          <Touchable
            key={f.key}
            accessibilityRole="button"
            onPress={() => onPress(f.key)}
            style={styles.item}
          >
            <View style={[styles.tile, more && styles.tileMore]}>
              <Icon icon={f.icon} size={24} color={more ? 'text2' : 'primary'} />
            </View>
            <Text
              variant="caption"
              color="text"
              align="center"
              numberOfLines={2}
              maxFontSizeMultiplier={1.3}
            >
              {t(`home.features.${f.key}`)}
            </Text>
          </Touchable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14, marginHorizontal: -4 },
    item: { width: '20%', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
    tile: {
      width: 56,
      height: 56,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.tint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tileMore: { backgroundColor: t.colors.surface2 },
  }),
);
