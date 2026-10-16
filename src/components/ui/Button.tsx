import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { makeStyles, useTheme } from '@/theme';

import { Icon } from './Icon';
import { Text, type ColorToken } from './Text';
import { Touchable } from './Touchable';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'lg' | 'md' | 'sm';
  icon?: LucideIcon;
  /** Put the icon after the label (e.g. a forward arrow). */
  iconPosition?: 'start' | 'end';
  /** Mirror the icon in RTL (directional arrows). */
  iconFlipInRTL?: boolean;
  disabled?: boolean;
  loading?: boolean;
  /** Stretch to fill the row (flex: 1). */
  grow?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

const FG: Record<ButtonVariant, ColorToken> = {
  primary: 'onBtn',
  secondary: 'text',
  ghost: 'link',
  destructive: 'dangerText',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'start',
  iconFlipInRTL,
  disabled,
  loading,
  grow,
  accessibilityHint,
  style,
}: ButtonProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const inactive = disabled || loading;
  const fg: ColorToken = disabled ? 'disFg' : FG[variant];
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={[
        styles.base,
        styles[size],
        styles[variant],
        disabled && styles.disabled,
        grow && styles.grow,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors[fg]} />
      ) : (
        <>
          {icon && iconPosition === 'start' ? (
            <Icon icon={icon} size={iconSize} color={fg} flipInRTL={iconFlipInRTL} />
          ) : null}
          <Text
            variant={size === 'sm' ? 'buttonSm' : 'button'}
            weight={variant === 'secondary' ? '600' : '700'}
            color={fg}
            align="center"
            numberOfLines={2}
            style={styles.label}
          >
            {label}
          </Text>
          {icon && iconPosition === 'end' ? (
            <Icon icon={icon} size={iconSize} color={fg} flipInRTL={iconFlipInRTL} />
          ) : null}
        </>
      )}
    </Touchable>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: t.space.sm,
      paddingHorizontal: 18,
      paddingVertical: t.space.sm,
    },
    // minHeight rather than height so long Bangla labels and large text never clip.
    lg: { minHeight: t.size.buttonLg, borderRadius: t.radius.lg },
    md: { minHeight: t.size.button, borderRadius: t.radius.lg },
    sm: { minHeight: t.size.buttonSm, borderRadius: t.radius.md },
    primary: { backgroundColor: t.colors.btn },
    secondary: { backgroundColor: t.colors.surface, borderWidth: 1.5, borderColor: t.colors.ctl },
    ghost: { backgroundColor: 'transparent' },
    destructive: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: t.colors.dangerText,
    },
    disabled: { backgroundColor: t.colors.disBg, borderColor: 'transparent' },
    grow: { flex: 1 },
    label: { flexShrink: 1 },
  }),
);
