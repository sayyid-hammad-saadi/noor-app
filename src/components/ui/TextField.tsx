import { forwardRef, type ReactNode, useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { useLanguage } from '@/i18n';
import { fontFamily, makeStyles, useTheme } from '@/theme';

import { Text } from './Text';

export type TextFieldProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  label?: string;
  error?: string;
  /** Leading adornment, e.g. a currency sign. */
  prefix?: ReactNode;
  suffix?: ReactNode;
};

/** Labelled 52px input (.inp) with focus ring and error state. */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, prefix, suffix, onFocus, onBlur, accessibilityLabel, ...rest },
  ref,
) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { script } = useLanguage();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label ? <Text variant="label">{label}</Text> : null}
      <View style={[styles.box, focused && styles.focus, !!error && styles.error]}>
        {prefix}
        <TextInput
          ref={ref}
          accessibilityLabel={accessibilityLabel ?? label}
          placeholderTextColor={colors.text2}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          style={[styles.input, { fontFamily: fontFamily(script, '500') }]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {suffix}
      </View>
      {error ? (
        <Text variant="caption" weight="600" color="dangerText" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
});

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    wrap: { gap: 6 },
    box: {
      minHeight: t.size.input,
      paddingHorizontal: 14,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.surface,
      borderWidth: 1.5,
      borderColor: t.colors.ctl,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.sm,
    },
    focus: { borderColor: t.colors.btn, boxShadow: `0px 0px 0px 3px ${t.colors.tint}` },
    error: { borderColor: t.colors.dangerText },
    input: {
      flex: 1,
      minWidth: 0,
      fontSize: 16,
      color: t.colors.text,
      paddingVertical: t.space.sm,
    },
  }),
);
