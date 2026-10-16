import { StyleSheet, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { useLanguage } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';

import { Text } from './Text';

/** Octagon with a number: surah and para indexes in lists. */
export function OctagonBadge({ value, size = 40 }: { value: number; size?: number }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { formatNumber } = useLanguage();
  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 40 40" style={StyleSheet.absoluteFill}>
        <Polygon
          points="37.5,12.7 37.5,27.3 27.3,37.5 12.7,37.5 2.5,27.3 2.5,12.7 12.7,2.5 27.3,2.5"
          fill={colors.tint}
          stroke={colors.primary}
          strokeWidth={1.5}
        />
      </Svg>
      <Text
        variant="label"
        weight="700"
        color="link"
        tabular
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatNumber(value, { grouping: false })}
      </Text>
    </View>
  );
}

const useStyles = makeStyles(() =>
  StyleSheet.create({
    root: { alignItems: 'center', justifyContent: 'center' },
  }),
);
