import { StyleSheet, View } from 'react-native';

import { Logo } from '@/components/layout';
import { Text } from '@/components/ui';
import { makeStyles, ThemeOverride, useTheme } from '@/theme';

import type { ReportLine, ReportModel } from '../zakatReport';

/** On-screen A4 page. Paper is always light, whatever the app theme. */
export function ReportPaper({ model, label }: { model: ReportModel; label: string }) {
  return (
    <ThemeOverride theme="light">
      <Paper model={model} label={label} />
    </ThemeOverride>
  );
}

const S = { maxFontSizeMultiplier: 1 } as const;

function Paper({ model, label }: { model: ReportModel; label: string }) {
  const styles = useStyles();
  const { shadows } = useTheme();
  const line = (l: ReportLine, key: string, sub = false) => (
    <View key={key} style={[styles.tr, !sub && styles.trRule]}>
      <Text
        {...S}
        size={8}
        weight={sub ? '700' : '400'}
        color={sub ? 'text' : 'text2'}
        style={styles.grow}
      >
        {l.label}
      </Text>
      <Text {...S} size={8} weight={sub ? '700' : '400'} tabular>
        {l.value}
      </Text>
    </View>
  );
  return (
    <View
      style={[styles.page, { boxShadow: shadows.sheet }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      <View style={styles.bar} />
      <View style={styles.head}>
        <View style={styles.brand}>
          <View style={styles.mark}>
            <Logo size={20} sparkle={false} />
          </View>
          <Text {...S} size={11} weight="700" script="latin">
            Noor
          </Text>
        </View>
        <View style={styles.titleBox}>
          <Text {...S} size={11} weight="700" align="end">
            {model.heading}
          </Text>
          <Text {...S} size={7.5} color="text2" align="end">
            {model.ref}
          </Text>
        </View>
      </View>
      <View style={styles.meta}>
        {model.meta.map((m, i) => (
          <View key={i} style={styles.metaRow}>
            <Text {...S} size={7.5} color="text2" style={styles.metaLabel}>
              {m.label}
            </Text>
            <Text {...S} size={7.5} weight="600" style={styles.grow}>
              {m.value}
            </Text>
          </View>
        ))}
      </View>

      <Text {...S} size={8.5} weight="700" color="link" style={styles.h3}>
        {model.assetsTitle}
      </Text>
      {model.assets.map((l, i) => line(l, `a${i}`))}
      {line(model.totalAssets, 'assets', true)}

      <Text {...S} size={8.5} weight="700" color="link" style={styles.h3}>
        {model.liabilitiesTitle}
      </Text>
      {model.liabilities.map((l, i) => line(l, `l${i}`))}
      {line(model.totalLiabilities, 'liabilities', true)}

      <View style={styles.totals}>
        <View style={styles.tr}>
          <Text {...S} size={8} color="text2" style={styles.grow}>
            {model.net.label}
          </Text>
          <Text {...S} size={8} weight="700" tabular>
            {model.net.value}
          </Text>
        </View>
        <View style={styles.tr}>
          <Text {...S} size={8} color="text2" style={styles.grow}>
            {model.above.label}
          </Text>
          <Text {...S} size={8} weight="600" color={model.above.yes ? 'okFg' : 'text'}>
            {model.above.value}
          </Text>
        </View>
        <View style={styles.pay}>
          <Text {...S} size={9} weight="700" style={styles.grow}>
            {model.payable.label}
          </Text>
          <Text {...S} size={13} weight="700" color="link" tabular>
            {model.payable.value}
          </Text>
        </View>
      </View>

      <View style={styles.grow} />
      <View style={styles.foot}>
        <Text {...S} size={6.5} color="text2" style={styles.grow}>
          {model.footer}
        </Text>
        <Text {...S} size={6.5} color="text2">
          {model.page}
        </Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    page: {
      width: '100%',
      aspectRatio: 1 / 1.414,
      paddingHorizontal: 22,
      paddingBottom: t.space.lg,
      backgroundColor: t.colors.surface,
      borderRadius: t.space.xs,
      overflow: 'hidden',
    },
    bar: { height: 4, marginHorizontal: -22, backgroundColor: t.colors.primary },
    head: {
      marginTop: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: t.space.md,
    },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    mark: { borderRadius: 5, backgroundColor: t.colors.primary, overflow: 'hidden' },
    titleBox: { flexShrink: 1, alignItems: 'flex-end' },
    meta: {
      marginTop: 10,
      paddingVertical: 7,
      paddingHorizontal: t.space.sm,
      borderRadius: t.space.xs,
      backgroundColor: t.colors.bg,
      gap: 2,
    },
    metaRow: { flexDirection: 'row', gap: t.space.sm },
    metaLabel: { width: 62 },
    h3: { marginTop: 10, marginBottom: 3, letterSpacing: 0.5 },
    tr: { minHeight: 14, flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
    trRule: { borderBottomWidth: 0.5, borderBottomColor: t.colors.border },
    grow: { flex: 1 },
    totals: {
      marginTop: 10,
      borderTopWidth: 1,
      borderTopColor: t.colors.text,
      paddingTop: t.space.xs,
    },
    pay: {
      marginTop: t.space.xs,
      paddingVertical: 6,
      paddingHorizontal: t.space.sm,
      borderRadius: t.space.xs,
      backgroundColor: t.colors.tint,
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: t.space.sm,
    },
    foot: {
      borderTopWidth: 0.5,
      borderTopColor: t.colors.border,
      paddingTop: 6,
      flexDirection: 'row',
      gap: t.space.md,
    },
  }),
);
