import { StyleSheet, View } from 'react-native';

import { makeStyles } from '@/theme';

import type { SegmentOption } from './SegmentedControl';
import { Text } from './Text';
import { Touchable } from './Touchable';

/** Compact pill switcher (Home "Daily Ayah / Hadith"); the active pill is filled. */
export function PillTabs<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}) {
  const styles = useStyles();
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
            hitSlop={{ top: 4, bottom: 4 }}
            style={[styles.pill, selected && styles.on]}
          >
            <Text
              variant="label"
              weight="600"
              color={selected ? 'onBtn' : 'text2'}
              numberOfLines={1}
              maxFontSizeMultiplier={1.3}
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
      minHeight: 40,
      padding: 3,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.surface2,
      flexDirection: 'row',
      gap: 2,
      alignSelf: 'flex-start',
      flexShrink: 1,
    },
    pill: {
      minHeight: 34,
      paddingHorizontal: 14,
      borderRadius: t.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 1,
    },
    on: { backgroundColor: t.colors.btn },
  }),
);
