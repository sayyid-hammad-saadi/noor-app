import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { makeStyles } from '@/theme';

/** Shared frame for 04a/04b: illustration, title, body, extras and stacked actions. */
export function PermissionLayout({
  art,
  title,
  body,
  actions,
  children,
}: PropsWithChildren<{ art: ReactNode; title: string; body: string; actions: ReactNode }>) {
  const styles = useStyles();
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.art}>{art}</View>
        <View style={styles.copy}>
          <Text variant="h1" align="center" accessibilityRole="header">
            {title}
          </Text>
          <Text variant="subtle" align="center">
            {body}
          </Text>
        </View>
        {children}
      </ScrollView>
      <View style={styles.actions}>{actions}</View>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    flex: { flex: 1 },
    content: {
      flexGrow: 1,
      paddingHorizontal: t.space.xxl,
      paddingTop: 52,
      paddingBottom: t.space.lg,
    },
    art: { alignItems: 'center' },
    copy: { marginTop: t.space.xxxl, gap: t.space.md, paddingHorizontal: t.space.sm },
    actions: {
      paddingHorizontal: t.space.xxl,
      paddingTop: t.space.md,
      paddingBottom: t.space.sm,
      gap: t.space.md,
    },
  }),
);
