import { StyleSheet, View } from 'react-native';

import { makeStyles, useTheme } from '@/theme';

import { Text } from './Text';
import { Touchable } from './Touchable';

export type SegmentOption<T extends string> = { value: T; label: string };

export type SegmentedControlProps<T extends string> = {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
};

/** Pill segmented control (.seg), e.g. Surah / Para / Bookmarks. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const styles = useStyles();
  const { shadows } = useTheme();
  return (
    <View style={styles.root} accessibilityRole="tablist" accessibilityLabel={accessibilityLabel}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Touchable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            style={[styles.item, selected && [styles.selected, { boxShadow: shadows.segment }]]}
          >
            <Text
              variant="label"
              weight={selected ? '700' : '600'}
              color={selected ? 'text' : 'text2'}
              align="center"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {o.label}
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
      minHeight: t.size.segment,
      padding: t.space.xs,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.surface2,
      flexDirection: 'row',
      gap: t.space.xs,
    },
    item: {
      flex: 1,
      borderRadius: t.radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: t.space.xs,
      paddingVertical: t.space.xs,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    selected: { backgroundColor: t.colors.surface, borderColor: t.colors.edge },
  }),
);
