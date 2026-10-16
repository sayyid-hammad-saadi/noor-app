import { useRouter } from 'expo-router';
import { ChevronLeft, CircleHelp, type LucideIcon, X } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton, Text } from '@/components/ui';
import { routes } from '@/lib/routes';
import { makeStyles } from '@/theme';

import { HelpSheet } from './HelpSheet';
import { StepIndicator } from './StepIndicator';

/** Calculator frame: top bar, step indicator, scrolling body and a fixed footer. */
export function ZakatShell({
  step,
  leading = 'back',
  trailing,
  footer,
  children,
}: {
  step: 1 | 2 | 3 | 4;
  leading?: 'close' | 'back';
  /** Defaults to the help button. */
  trailing?: { icon: LucideIcon; label: string; onPress: () => void };
  footer: ReactNode;
  children: ReactNode;
}) {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const [helpOpen, setHelpOpen] = useState(false);
  const leave = () => (router.canGoBack() ? router.back() : router.replace(routes.home));

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <View style={styles.pad}>
          <View style={styles.topBar}>
            <IconButton
              icon={leading === 'close' ? X : ChevronLeft}
              size={leading === 'close' ? 22 : 24}
              flipInRTL={leading === 'back'}
              accessibilityLabel={leading === 'close' ? t('zakat.close') : t('zakat.back')}
              onPress={leave}
              style={styles.edgeStart}
            />
            <Text variant="title" align="center" accessibilityRole="header" style={styles.title}>
              {t('zakat.title')}
            </Text>
            <IconButton
              icon={trailing?.icon ?? CircleHelp}
              size={22}
              accessibilityLabel={trailing?.label ?? t('zakat.help.title')}
              onPress={trailing?.onPress ?? (() => setHelpOpen(true))}
              style={styles.edgeEnd}
            />
          </View>
          <StepIndicator step={step} />
        </View>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          {footer}
        </SafeAreaView>
      </KeyboardAvoidingView>
      <HelpSheet visible={helpOpen} onClose={() => setHelpOpen(false)} />
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    flex: { flex: 1 },
    pad: { paddingHorizontal: t.size.gutter },
    topBar: { minHeight: t.size.topBar, flexDirection: 'row', alignItems: 'center' },
    title: { flex: 1 },
    edgeStart: { marginStart: -t.space.sm },
    edgeEnd: { marginEnd: -t.space.sm },
    body: { paddingHorizontal: t.size.gutter, paddingTop: t.space.xl, paddingBottom: t.space.xxl },
    footer: {
      paddingTop: t.space.md,
      paddingHorizontal: t.size.gutter,
      paddingBottom: t.space.md,
      backgroundColor: t.colors.surface,
      borderTopWidth: 1,
      borderTopColor: t.colors.border,
      gap: t.space.md,
    },
  }),
);
