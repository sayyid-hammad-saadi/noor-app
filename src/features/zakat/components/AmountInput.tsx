import { useState } from 'react';
import { StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui';
import { toAsciiDigits } from '@/features/quran/data/digits';
import { formatNumber, useLanguage } from '@/i18n';
import { fontFamily, makeStyles, useTheme } from '@/theme';

/** Keeps digits and one decimal point; accepts Bangla and Arabic-Indic digits. */
function clean(text: string, decimals: boolean): string {
  const ascii = toAsciiDigits(text).replace(/[٫,]/g, (c) => (c === '٫' ? '.' : ''));
  const [int = '', ...rest] = ascii.replace(/[^0-9.]/g, '').split('.');
  return decimals && rest.length ? `${int}.${rest.join('').slice(0, 2)}` : int;
}

/** Numeric field that shows grouped, localized digits and edits plain ones. */
export function AmountInput({
  value,
  onChange,
  accessibilityLabel,
  prefix,
  suffix,
  decimals = false,
  lakh,
  size = 'md',
  style,
}: {
  value: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
  prefix?: string;
  suffix?: string;
  decimals?: boolean;
  lakh?: boolean;
  /** md: 124px row field; lg: full-width 52px field. */
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { language, script, localizeDigits } = useLanguage();
  // Raw text while editing; null shows the formatted value.
  const [editing, setEditing] = useState<string | null>(null);
  const shown =
    editing !== null ? localizeDigits(editing) : formatNumber(value, language, { lakh });

  return (
    <View style={[styles.box, styles[size], editing !== null && styles.focus, style]}>
      {prefix ? (
        // ৳ only exists in the Bangla face.
        <Text variant="label" weight="600" script={prefix === '৳' ? 'bn' : undefined}>
          {prefix}
        </Text>
      ) : null}
      <TextInput
        value={shown}
        onChangeText={(text) => {
          const raw = clean(text, decimals);
          setEditing(raw);
          onChange(Number(raw) || 0);
        }}
        onFocus={() => setEditing(value ? String(value) : '')}
        onBlur={() => setEditing(null)}
        keyboardType={decimals ? 'decimal-pad' : 'number-pad'}
        selectTextOnFocus
        accessibilityLabel={accessibilityLabel}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        placeholder={localizeDigits('0')}
        placeholderTextColor={colors.text2}
        style={[
          styles.input,
          size === 'lg' ? styles.inputLg : null,
          { fontFamily: fontFamily(script, '700') },
        ]}
      />
      {suffix ? (
        <Text variant="label" weight="600">
          {suffix}
        </Text>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    box: {
      borderWidth: 1.5,
      borderColor: t.colors.ctl,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.xs,
    },
    md: {
      width: 124,
      minHeight: t.size.touch,
      paddingHorizontal: 10,
      borderRadius: t.radius.md,
      backgroundColor: t.colors.surface2,
    },
    lg: {
      minHeight: t.size.input,
      paddingHorizontal: 14,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.surface,
      gap: t.space.sm,
    },
    focus: { borderColor: t.colors.primary },
    input: {
      flex: 1,
      minWidth: 0,
      paddingVertical: t.space.sm,
      fontSize: 15,
      color: t.colors.text,
      textAlign: 'right',
      fontVariant: ['tabular-nums'],
    },
    inputLg: { fontSize: 17, textAlign: 'left' },
  }),
);
