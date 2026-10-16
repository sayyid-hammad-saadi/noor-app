import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { makeStyles, useTheme } from '@/theme';

import { Text, type ColorToken } from './Text';

export type HadithGrade = 'sahih' | 'hasan' | 'daif';

const FG: Record<HadithGrade, ColorToken> = { sahih: 'okFg', hasan: 'link', daif: 'goldText' };

/** Hadith grade. Grades differ by icon as well as colour, never colour alone. */
export function GradeChip({ grade }: { grade: HadithGrade }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const c = colors[FG[grade]];
  return (
    <View style={[styles.root, styles[grade]]}>
      <Svg width={10} height={10} viewBox="0 0 24 24">
        {grade === 'sahih' ? (
          <Path
            d="M20 6 9 17l-5-5"
            stroke={c}
            strokeWidth={3.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : grade === 'hasan' ? (
          <>
            <Circle cx={12} cy={12} r={9} stroke={c} strokeWidth={3} fill="none" />
            <Path d="M12 3a9 9 0 0 1 0 18z" fill={c} />
          </>
        ) : (
          <Path
            d="M12 8v5M12 17h.01"
            stroke={c}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
        )}
      </Svg>
      <Text variant="micro" weight="700" color={FG[grade]}>
        {t(`grades.${grade}`)}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      minHeight: 22,
      paddingHorizontal: t.space.sm,
      borderRadius: t.radius.pill,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.xs,
      alignSelf: 'flex-start',
    },
    sahih: { backgroundColor: t.colors.okBg },
    hasan: { backgroundColor: t.colors.tint },
    daif: { backgroundColor: t.colors.goldTint },
  }),
);
