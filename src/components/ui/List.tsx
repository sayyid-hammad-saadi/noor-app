import { ChevronRight } from 'lucide-react-native';
import { Children, Fragment, isValidElement, type PropsWithChildren, type ReactNode } from 'react';
import { StyleSheet, type StyleProp, View, type ViewStyle } from 'react-native';

import { makeStyles, useTheme } from '@/theme';

import { Icon } from './Icon';
import { Text } from './Text';
import { Touchable } from './Touchable';

/** Grouped list container (.list). Inserts hairline dividers between rows. */
export function List({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const styles = useStyles();
  const { shadows } = useTheme();
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <View style={[styles.list, { boxShadow: shadows.card }, style]}>
      {rows.map((row, i) => (
        <Fragment key={row.key ?? i}>
          {i > 0 ? <View style={styles.divider} /> : null}
          {row}
        </Fragment>
      ))}
    </View>
  );
}

export type ListRowProps = {
  title: string;
  caption?: string;
  /** Icon tile, avatar, radio… */
  leading?: ReactNode;
  /** 'chevron' for navigation rows, a string for value rows, or any node (switch). */
  trailing?: 'chevron' | string | ReactNode;
  onPress?: () => void;
  accessibilityRole?: 'button' | 'radio' | 'link';
  accessibilityState?: { checked?: boolean; selected?: boolean };
  accessibilityHint?: string;
};

export function ListRow({
  title,
  caption,
  leading,
  trailing,
  onPress,
  accessibilityRole = 'button',
  accessibilityState,
  accessibilityHint,
}: ListRowProps) {
  const styles = useStyles();
  const trailingNode =
    trailing === 'chevron' ? (
      <Icon icon={ChevronRight} size={18} color="text2" flipInRTL />
    ) : typeof trailing === 'string' ? (
      <Text variant="label" color="text2" numberOfLines={2} style={styles.value}>
        {trailing}
      </Text>
    ) : (
      trailing
    );

  const content = (
    <>
      {leading}
      <View style={styles.tx}>
        <Text variant="bodyStrong">{title}</Text>
        {caption ? <Text variant="caption">{caption}</Text> : null}
      </View>
      {trailingNode}
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Touchable
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={styles.row}
    >
      {content}
    </Touchable>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    list: {
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
      paddingStart: 14,
      paddingEnd: t.space.md,
    },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: t.colors.border },
    row: {
      minHeight: t.size.listRow,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
      paddingVertical: t.space.sm,
    },
    tx: { flex: 1, minWidth: 0, gap: t.space.xxs },
    value: { maxWidth: '45%', textAlign: 'right' },
  }),
);
