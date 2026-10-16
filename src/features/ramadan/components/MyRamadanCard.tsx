import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Text, Touchable } from '@/components/ui';
import { ProgressRing } from '@/features/home/components/ProgressRing';
import { useLanguage } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';

/** Fasts kept, Taraweeh nights and Quran paras this Ramadan. */
export function MyRamadanCard({
  fasts,
  taraweeh,
  paras,
  length,
  onLog,
}: {
  fasts: number;
  taraweeh: number;
  paras: number;
  length: number;
  onLog: () => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { localizeDigits } = useLanguage();
  const rings = [
    {
      key: 'fasting',
      label: t('ramadan.my.fasting'),
      sub: t('ramadan.my.ofDays', { n: localizeDigits(length) }),
      value: fasts,
      total: length,
      color: 'primary' as const,
    },
    {
      key: 'taraweeh',
      label: t('ramadan.my.taraweeh'),
      sub: t('ramadan.my.ofNights', { n: localizeDigits(length) }),
      value: taraweeh,
      total: length,
      color: 'primary' as const,
    },
    {
      key: 'khatam',
      label: t('ramadan.my.khatam'),
      sub: t('ramadan.my.ofParas'),
      value: paras,
      total: 30,
      color: 'gold' as const,
    },
  ];

  return (
    <View style={[styles.card, { boxShadow: shadows.card }]}>
      <View style={styles.head}>
        <Text variant="title" accessibilityRole="header" style={styles.shrink}>
          {t('ramadan.my.title')}
        </Text>
        <Touchable accessibilityRole="button" onPress={onLog} style={styles.log}>
          <Text variant="label" weight="600" color="link">
            {t('ramadan.my.logToday')}
          </Text>
        </Touchable>
      </View>
      <View style={styles.rings}>
        {rings.map((r) => (
          <View key={r.key} style={styles.ring}>
            <ProgressRing
              size={64}
              stroke={6}
              color={r.color}
              labelSize={15}
              progress={r.value / r.total}
              label={localizeDigits(r.value)}
              accessibilityLabel={t('ramadan.my.ringA11y', {
                label: r.label,
                done: localizeDigits(r.value),
                total: localizeDigits(r.total),
              })}
            />
            <Text variant="label" weight="600" color="text" align="center">
              {r.label}
            </Text>
            <Text size={11} color="text2" align="center" style={styles.sub}>
              {r.sub}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    card: {
      padding: t.space.lg,
      gap: 14,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
    head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    shrink: { flexShrink: 1 },
    log: { minHeight: t.size.touch, justifyContent: 'center', paddingStart: t.space.sm },
    rings: { flexDirection: 'row', gap: t.space.sm },
    ring: { flex: 1, alignItems: 'center', gap: 6 },
    sub: { marginTop: -4 },
  }),
);
