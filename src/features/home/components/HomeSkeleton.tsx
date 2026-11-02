import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Skeleton } from '@/components/feedback';
import { GradientHeader } from '@/components/layout';
import { makeStyles, useTheme } from '@/theme';

/** 34a Home while the saved location and prayer times load. */
export function HomeSkeleton() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { shadows } = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={styles.root}
      accessible
      accessibilityLabel={t('states.loadingPrayer')}
      accessibilityState={{ busy: true }}
    >
      <GradientHeader style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.row}>
          <View style={styles.titles}>
            <Skeleton onHeader width={180} height={22} />
            <Skeleton onHeader width={220} height={14} />
          </View>
          <Skeleton onHeader width={44} height={44} radius={22} />
        </View>
        <Skeleton onHeader width={160} height={36} radius={18} style={styles.chip} />
        <View style={styles.center}>
          <Skeleton onHeader width={110} height={14} />
          <Skeleton onHeader width={150} height={44} radius={12} />
          <Skeleton onHeader width={120} height={26} radius={13} />
        </View>
        <View style={styles.prayers}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.prayer}>
              <Skeleton onHeader height={80} radius={16} />
            </View>
          ))}
        </View>
      </GradientHeader>
      <View style={[styles.sheet, { boxShadow: shadows.sheet }]}>
        <View style={styles.grab} />
        <Skeleton width={120} height={18} style={styles.section} />
        <View style={styles.grid}>
          {Array.from({ length: 10 }, (_, i) => (
            <View key={i} style={styles.cell}>
              <Skeleton width={56} height={56} radius={16} />
              <Skeleton width={44} height={10} />
            </View>
          ))}
        </View>
        <View style={[styles.card, { boxShadow: shadows.card }]}>
          <Skeleton width={150} height={32} radius={16} />
          <Skeleton height={16} />
          <Skeleton width="70%" height={16} />
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    header: { paddingHorizontal: t.size.gutter, paddingBottom: 58 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    titles: { gap: t.space.sm },
    chip: { marginTop: 14 },
    center: { marginTop: 22, alignItems: 'center', gap: 10 },
    prayers: { marginTop: 22, flexDirection: 'row', gap: 6 },
    prayer: { flex: 1 },
    sheet: {
      flex: 1,
      marginTop: -30,
      paddingHorizontal: t.size.gutter,
      borderTopStartRadius: 28,
      borderTopEndRadius: 28,
      backgroundColor: t.colors.bg,
    },
    grab: {
      alignSelf: 'center',
      marginTop: 10,
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.colors.border,
    },
    section: { marginTop: 18 },
    grid: { marginTop: t.space.lg, flexDirection: 'row', flexWrap: 'wrap', rowGap: t.space.lg },
    cell: { width: '20%', alignItems: 'center', gap: t.space.sm },
    card: {
      marginTop: 22,
      padding: t.space.lg,
      gap: 10,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.cardRaised,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
  }),
);
