import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { Touchable } from '@/components/ui/Touchable';
import { makeStyles } from '@/theme';

export type TabBarItem<K extends string> = {
  key: K;
  label: string;
  icon: LucideIcon;
};

export type TabBarProps<K extends string> = {
  items: readonly TabBarItem<K>[];
  activeKey: K;
  onPress: (key: K) => void;
};

/**
 * Bottom navigation (.tabbar). Presentational: the (tabs) layout adapts router state to it.
 * Active tab: filled icon + teal bold label.
 */
export function TabBar<K extends string>({ items, activeKey, onPress }: TabBarProps<K>) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.root, { paddingBottom: Math.max(insets.bottom, 8) }]}
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <Touchable
            key={item.key}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            onPress={() => onPress(item.key)}
            style={styles.item}
          >
            <Icon icon={item.icon} size={24} color={active ? 'link' : 'text2'} filled={active} />
            <Text
              variant="micro"
              weight={active ? '700' : '500'}
              color={active ? 'link' : 'text2'}
              align="center"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              maxFontSizeMultiplier={1.3}
            >
              {item.label}
            </Text>
          </Touchable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      flexDirection: 'row',
      backgroundColor: t.colors.surface,
      borderTopWidth: 1,
      borderTopColor: t.colors.border,
      paddingTop: 6,
      paddingHorizontal: t.space.xs,
    },
    item: {
      flex: 1,
      minHeight: t.size.touch + 6,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      paddingHorizontal: 2,
    },
  }),
);
