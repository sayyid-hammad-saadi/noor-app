import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { makeStyles } from '@/theme';

import { Icon } from './Icon';
import type { ColorToken } from './Text';

export type IconTileTone = 'tint' | 'gold' | 'danger' | 'neutral';

const FG: Record<IconTileTone, ColorToken> = {
  tint: 'primary',
  gold: 'goldText',
  danger: 'dangerText',
  neutral: 'text2',
};

/** Rounded square icon holder (.ti). */
export function IconTile({
  icon,
  tone = 'tint',
  size = 'md',
}: {
  icon: LucideIcon;
  tone?: IconTileTone;
  size?: 'md' | 'sm' | 'lg';
}) {
  const styles = useStyles();
  return (
    <View style={[styles.base, styles[size], styles[tone]]}>
      <Icon icon={icon} size={size === 'sm' ? 18 : size === 'lg' ? 24 : 20} color={FG[tone]} />
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    base: { alignItems: 'center', justifyContent: 'center' },
    md: { width: t.size.iconTile, height: t.size.iconTile, borderRadius: t.radius.md },
    sm: { width: t.size.iconTileSm, height: t.size.iconTileSm, borderRadius: t.radius.sm },
    lg: { width: 44, height: 44, borderRadius: t.radius.md },
    tint: { backgroundColor: t.colors.tint },
    gold: { backgroundColor: t.colors.goldTint },
    danger: { backgroundColor: t.colors.dangerTint },
    neutral: { backgroundColor: t.colors.surface2 },
  }),
);
