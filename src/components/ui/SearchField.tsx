import { Search, X } from 'lucide-react-native';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { useLanguage } from '@/i18n';
import { fontFamily, makeStyles, useTheme } from '@/theme';

import { Icon } from './Icon';
import { IconButton } from './IconButton';

export type SearchFieldProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  onClear?: () => void;
};

/** 44px search input (.search) with a clear button once there is text. */
export const SearchField = forwardRef<TextInput, SearchFieldProps>(function SearchField(
  { value, onClear, placeholder, ...rest },
  ref,
) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { script } = useLanguage();
  const { t } = useTranslation();
  const label = placeholder ?? t('search.placeholder');
  return (
    <View style={styles.root}>
      <Icon icon={Search} size={18} color="text2" />
      <TextInput
        ref={ref}
        value={value}
        placeholder={label}
        accessibilityLabel={label}
        placeholderTextColor={colors.text2}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        returnKeyType="search"
        style={[styles.input, { fontFamily: fontFamily(script, '400') }]}
        {...rest}
      />
      {value && onClear ? (
        <IconButton
          icon={X}
          size={18}
          color="text2"
          accessibilityLabel={t('actions.clear')}
          onPress={onClear}
          style={styles.clear}
        />
      ) : null}
    </View>
  );
});

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      minHeight: t.size.search,
      paddingHorizontal: 14,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.surface,
      borderWidth: 1.5,
      borderColor: t.colors.ctl,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    input: { flex: 1, minWidth: 0, fontSize: 15, color: t.colors.text, paddingVertical: 6 },
    clear: { marginEnd: -12 },
  }),
);
