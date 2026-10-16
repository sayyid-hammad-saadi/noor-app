import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconButton, Text, Touchable, type ColorToken } from '@/components/ui';
import { makeStyles } from '@/theme';

export type BarAction = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  /** Filled icon in this colour (e.g. Saved). */
  active?: ColorToken;
};

/** Reader footer: optional previous/next arrows around labelled actions (21b, 25b). */
export function ActionBar({
  actions,
  previous,
  next,
}: {
  actions: BarAction[];
  previous?: { label: string; onPress: (() => void) | null };
  next?: { label: string; onPress: (() => void) | null };
}) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {previous ? (
        <IconButton
          icon={ChevronLeft}
          flipInRTL
          accessibilityLabel={previous.label}
          disabled={!previous.onPress}
          onPress={previous.onPress ?? undefined}
        />
      ) : null}
      {actions.map((a) => (
        <Touchable
          key={a.label}
          accessibilityRole="button"
          accessibilityState={a.active ? { selected: true } : undefined}
          onPress={a.onPress}
          style={styles.action}
        >
          <Icon icon={a.icon} size={22} color={a.active ?? 'link'} filled={!!a.active} />
          <Text variant="caption" weight="600" color="text" numberOfLines={1}>
            {a.label}
          </Text>
        </Touchable>
      ))}
      {next ? (
        <IconButton
          icon={ChevronRight}
          flipInRTL
          accessibilityLabel={next.label}
          disabled={!next.onPress}
          onPress={next.onPress ?? undefined}
        />
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      paddingTop: 6,
      paddingHorizontal: t.space.md,
      borderTopWidth: 1,
      borderTopColor: t.colors.border,
      backgroundColor: t.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
    },
    action: {
      flex: 1,
      minHeight: 56,
      alignItems: 'center',
      justifyContent: 'center',
      gap: t.space.xs,
    },
  }),
);
