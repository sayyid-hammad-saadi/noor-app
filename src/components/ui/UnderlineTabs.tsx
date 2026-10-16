import { ScrollView, StyleSheet, View } from 'react-native';

import { makeStyles } from '@/theme';

import type { SegmentOption } from './SegmentedControl';
import { Text } from './Text';
import { Touchable } from './Touchable';

export type UnderlineTabsProps<T extends string> = {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
};

/** Text tabs with a teal underline (.utabs). Scrolls if labels outgrow the width. */
export function UnderlineTabs<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: UnderlineTabsProps<T>) {
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        accessibilityRole="tablist"
        accessibilityLabel={accessibilityLabel}
      >
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Touchable
              key={o.value}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => onChange(o.value)}
              style={[styles.tab, selected && styles.selected]}
            >
              <Text
                variant="body"
                weight={selected ? '700' : '500'}
                color={selected ? 'link' : 'text2'}
                numberOfLines={1}
              >
                {o.label}
              </Text>
            </Touchable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { borderBottomWidth: 1, borderBottomColor: t.colors.border },
    row: { gap: 22 },
    tab: {
      minHeight: t.size.touch,
      justifyContent: 'center',
      borderBottomWidth: 2.5,
      borderBottomColor: 'transparent',
      marginBottom: -1,
    },
    selected: { borderBottomColor: t.colors.primary },
  }),
);
