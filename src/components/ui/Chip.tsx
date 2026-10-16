import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { makeStyles } from '@/theme';

import { Icon } from './Icon';
import { Text, type ColorToken } from './Text';
import { Touchable } from './Touchable';

export type ChipProps = {
  label: string;
  selected?: boolean;
  /** Soft tinted chip (filters that are on by default, tags). */
  tint?: boolean;
  icon?: LucideIcon;
  onPress?: () => void;
};

export function Chip({ label, selected, tint, icon, onPress }: ChipProps) {
  const styles = useStyles();
  const fg: ColorToken = selected ? 'onBtn' : tint ? 'link' : 'text';
  const content = (
    <>
      {icon ? <Icon icon={icon} size={16} color={fg} /> : null}
      <Text variant="label" weight="600" color={fg} numberOfLines={1}>
        {label}
      </Text>
    </>
  );
  const style = [styles.root, selected ? styles.on : tint ? styles.tint : null];

  if (!onPress) return <View style={style}>{content}</View>;
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      hitSlop={4}
      style={style}
    >
      {content}
    </Touchable>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      minHeight: 36,
      paddingHorizontal: 14,
      borderRadius: t.radius.pill,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.ctl,
      alignSelf: 'flex-start',
    },
    on: { backgroundColor: t.colors.btn, borderColor: t.colors.btn },
    tint: { backgroundColor: t.colors.tint, borderColor: 'transparent' },
  }),
);
