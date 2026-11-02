import { StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/feedback';
import { Radio, Text, Touchable } from '@/components/ui';
import { makeStyles } from '@/theme';

/** Bottom sheet with a single-choice list. */
export function OptionSheet<T extends string | number>({
  visible,
  title,
  note,
  options,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  note?: string;
  options: readonly { value: T; label: string; caption?: string }[];
  value: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}) {
  const styles = useStyles();
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      <View accessibilityRole="radiogroup" style={styles.list}>
        {options.map((o) => (
          <Touchable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: value === o.value }}
            onPress={() => {
              onSelect(o.value);
              onClose();
            }}
            style={styles.row}
          >
            <View style={styles.grow}>
              <Text variant="bodyStrong">{o.label}</Text>
              {o.caption ? <Text variant="caption">{o.caption}</Text> : null}
            </View>
            <Radio selected={value === o.value} />
          </Touchable>
        ))}
      </View>
      {note ? (
        <Text variant="caption" style={styles.note}>
          {note}
        </Text>
      ) : null}
    </BottomSheet>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    list: { paddingBottom: t.space.sm },
    row: {
      minHeight: t.size.touch + 8,
      paddingVertical: t.space.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    grow: { flex: 1 },
    note: { marginBottom: t.space.md },
  }),
);
