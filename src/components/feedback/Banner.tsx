import { CircleAlert, Info, TriangleAlert, WifiOff, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text, type ColorToken } from '@/components/ui/Text';
import { makeStyles } from '@/theme';

export type BannerTone = 'warn' | 'info' | 'dark' | 'danger';

const ICONS: Record<BannerTone, LucideIcon> = {
  warn: TriangleAlert,
  info: Info,
  dark: WifiOff,
  danger: CircleAlert,
};
const ICON_COLOR: Record<BannerTone, ColorToken> = {
  warn: 'goldText',
  info: 'link',
  dark: 'onToast',
  danger: 'dangerText',
};

export type BannerProps = {
  tone?: BannerTone;
  message: string;
  icon?: LucideIcon;
  /** Optional trailing action (button). */
  action?: ReactNode;
};

/** Inline message strip (.banner): warning, info, offline (dark) or error. */
export function Banner({ tone = 'info', message, icon, action }: BannerProps) {
  const styles = useStyles();
  return (
    <View style={[styles.root, styles[tone]]} accessibilityRole="alert">
      <Icon icon={icon ?? ICONS[tone]} size={18} color={ICON_COLOR[tone]} />
      <Text
        variant="label"
        weight="500"
        color={tone === 'dark' ? 'onToast' : 'text'}
        style={styles.msg}
      >
        {message}
      </Text>
      {action}
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      paddingVertical: t.space.md,
      paddingHorizontal: 14,
      borderRadius: t.radius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    msg: { flex: 1 },
    warn: { backgroundColor: t.colors.goldTint, borderWidth: 1, borderColor: t.colors.goldBorder },
    info: { backgroundColor: t.colors.tint },
    dark: { backgroundColor: t.colors.toast },
    danger: { backgroundColor: t.colors.dangerTint },
  }),
);
