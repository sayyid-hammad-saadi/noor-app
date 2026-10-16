import { StyleSheet, View } from 'react-native';

import { formatNumber } from '@/i18n';
import { makeStyles } from '@/theme';

import { Text } from './Text';

/** Round end-of-ayah marker with an Arabic-Indic numeral (.orn); always Arabic digits. */
export function AyahMarker({
  number,
  size = 32,
  textSize = 13,
}: {
  number: number;
  size?: number;
  textSize?: number;
}) {
  const styles = useStyles();
  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <Text script="ar" variant="label" weight="600" color="link" size={textSize} numberOfLines={1}>
        {formatNumber(number, 'ar', { grouping: false })}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      borderRadius: t.radius.pill,
      borderWidth: 1.5,
      borderColor: t.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);
