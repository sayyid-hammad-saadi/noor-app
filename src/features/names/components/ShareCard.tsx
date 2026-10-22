import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { GradientHeader, Logo } from '@/components/layout';
import { Text } from '@/components/ui';
import { makeStyles } from '@/theme';

import type { IslamicName } from '../names';

/** The image shared by "Share as card": rendered off-screen and captured. */
export const ShareCard = forwardRef<View, { name: IslamicName }>(function ShareCard({ name }, ref) {
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <View ref={ref} collapsable={false} style={styles.offscreen} pointerEvents="none">
      <GradientHeader style={styles.card}>
        <Text script="quran" size={56} color="onHeader" align="center">
          {name.ar}
        </Text>
        <Text size={30} weight="700" color="onHeader" align="center" script="latin">
          {name.en}
        </Text>
        <Text script="bn" size={18} color="onHeader" align="center" style={styles.soft}>
          {name.bn}
        </Text>
        <Text size={16} color="onHeader" align="center" style={styles.meaning}>
          {t(`names.items.${name.id as 'nur'}`)}
        </Text>
        <View style={styles.brand}>
          <Logo size={22} sparkle={false} />
          <Text size={13} weight="700" color="onHeader" script="latin">
            Noor
          </Text>
        </View>
      </GradientHeader>
    </View>
  );
});

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    offscreen: { position: 'absolute', top: 0, start: -10000, width: 360 },
    card: { padding: t.space.xxl, gap: t.space.xs, borderRadius: t.radius.card },
    soft: { opacity: 0.9 },
    meaning: { marginTop: t.space.md, opacity: 0.95 },
    brand: {
      marginTop: t.space.xl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
  }),
);
