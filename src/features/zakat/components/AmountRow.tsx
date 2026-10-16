import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Icon, Text, type ColorToken } from '@/components/ui';
import { makeStyles } from '@/theme';

import { AmountInput } from './AmountInput';

export type RowTone = 'tint' | 'gold' | 'neutral';

const FG: Record<RowTone, ColorToken> = { tint: 'primary', gold: 'goldText', neutral: 'text2' };

/** Icon, label and caption with an amount field at the end (16b/16c rows). */
export function AmountRow({
  icon,
  tone = 'tint',
  label,
  caption,
  value,
  onChange,
  prefix,
  suffix,
  decimals,
  lakh,
  first,
}: {
  icon: LucideIcon;
  tone?: RowTone;
  label: string;
  caption: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  decimals?: boolean;
  lakh?: boolean;
  first?: boolean;
}) {
  const styles = useStyles();
  return (
    <View style={[styles.row, !first && styles.rule]}>
      <View style={[styles.tile, styles[tone]]}>
        <Icon icon={icon} size={18} color={FG[tone]} />
      </View>
      <View style={styles.label}>
        <Text variant="body" weight="600">
          {label}
        </Text>
        <Text variant="caption" weight="400">
          {caption}
        </Text>
      </View>
      <AmountInput
        value={value}
        onChange={onChange}
        accessibilityLabel={label}
        prefix={prefix}
        suffix={suffix}
        decimals={decimals}
        lakh={lakh}
      />
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: {
      minHeight: 60,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
      paddingVertical: t.space.sm,
    },
    rule: { borderTopWidth: 1, borderTopColor: t.colors.border },
    tile: {
      width: 36,
      height: 36,
      borderRadius: t.radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tint: { backgroundColor: t.colors.tint },
    gold: { backgroundColor: t.colors.goldTint },
    neutral: { backgroundColor: t.colors.surface2 },
    label: { flex: 1, minWidth: 0, gap: 1 },
  }),
);
