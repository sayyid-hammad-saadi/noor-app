import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { makeStyles } from '@/theme';

import { Icon } from './Icon';
import type { ColorToken } from './Text';
import { Touchable } from './Touchable';

export type IconButtonProps = {
  icon: LucideIcon;
  /** Required: icon-only buttons need a spoken label. */
  accessibilityLabel: string;
  onPress?: () => void;
  color?: ColorToken;
  size?: number;
  flipInRTL?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** 44×44 round hit area around a single icon (.ib). */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  color = 'text',
  size = 24,
  flipInRTL,
  disabled,
  style,
}: IconButtonProps) {
  const styles = useStyles();
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.root, style]}
    >
      <Icon icon={icon} size={size} color={color} flipInRTL={flipInRTL} />
    </Touchable>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      width: t.size.touch,
      height: t.size.touch,
      borderRadius: t.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);
