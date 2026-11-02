import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, IconTile, type IconTileTone, Text, Touchable } from '@/components/ui';
import { makeStyles } from '@/theme';

/**
 * One settings row (.li): title and caption, with a value, control or chevron at the
 * end. `stacked` puts the control under the text (segmented controls, sliders).
 */
export function SettingRow({
  title,
  caption,
  value,
  control,
  icon,
  tone,
  stacked,
  danger,
  onPress,
}: {
  title: string;
  caption?: string;
  value?: string;
  control?: ReactNode;
  icon?: LucideIcon;
  tone?: IconTileTone;
  stacked?: boolean;
  danger?: boolean;
  onPress?: () => void;
}) {
  const styles = useStyles();
  const text = (
    <View style={styles.text}>
      <Text variant="bodyStrong" weight="600" color={danger ? 'dangerText' : 'text'}>
        {title}
      </Text>
      {caption ? <Text variant="caption">{caption}</Text> : null}
    </View>
  );
  const head = (
    <>
      {icon ? <IconTile icon={icon} tone={tone} size="sm" /> : null}
      {text}
      {value ? (
        <Text variant="label" color="text2" align="end" numberOfLines={2} style={styles.value}>
          {value}
        </Text>
      ) : null}
      {!stacked ? control : null}
      {onPress ? <Icon icon={ChevronRight} size={18} color="text2" flipInRTL /> : null}
    </>
  );
  if (onPress) {
    return (
      <Touchable accessibilityRole="button" onPress={onPress} style={[styles.row, styles.inline]}>
        {head}
      </Touchable>
    );
  }
  return stacked ? (
    <View style={[styles.row, styles.stacked]}>
      <View style={styles.inline}>{head}</View>
      {control}
    </View>
  ) : (
    <View style={[styles.row, styles.inline]}>{head}</View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: { minHeight: 56, paddingVertical: 10, paddingHorizontal: t.space.lg },
    inline: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
    stacked: { gap: 10 },
    text: { flex: 1, gap: 2 },
    value: { maxWidth: '45%' },
  }),
);
