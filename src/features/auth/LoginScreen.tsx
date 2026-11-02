import { useRouter } from 'expo-router';
import { Apple, ArrowRight, Mail, ShieldCheck, UserRound, X } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/feedback';
import { Logo } from '@/components/layout';
import { Button, Icon, IconButton, Text, TextField, Touchable } from '@/components/ui';
import { routes } from '@/lib/routes';
import { makeStyles, useTheme } from '@/theme';

import {
  isValidEmail,
  sendEmailCode,
  type SignInResult,
  signInWithApple,
  signInWithGoogle,
} from './auth';

/** 28 Login: guest first; optional email code, Google or Apple sign-in for sync. */
export default function LoginScreen() {
  const styles = useStyles();
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const close = () => (router.canGoBack() ? router.back() : router.replace(routes.home));

  const run = async (action: () => Promise<SignInResult>) => {
    setBusy(true);
    const result = await action().catch((): SignInResult => ({ status: 'error' }));
    setBusy(false);
    if (result.status === 'ok') close();
    else
      toast.show({
        message: t(result.status === 'unavailable' ? 'login.unavailable' : 'login.error'),
        icon: ShieldCheck,
      });
  };

  const sendCode = () => {
    if (!isValidEmail(email)) {
      setError(t('login.invalidEmail'));
      return;
    }
    setError(undefined);
    void run(() => sendEmailCode(email.trim()));
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.grow}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.top}>
          <IconButton icon={X} size={22} accessibilityLabel={t('actions.close')} onPress={close} />
        </View>
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Logo size={64} sparkle={false} accessibilityLabel={t('appName')} />
            <Text variant="h1" align="center" accessibilityRole="header">
              {t('login.title')}
            </Text>
            <Text variant="subtle" align="center">
              {t('login.body')}
            </Text>
          </View>

          <Touchable
            accessibilityRole="button"
            onPress={close}
            style={[styles.guest, { boxShadow: shadows.card }]}
          >
            <View style={styles.guestIcon}>
              <Icon icon={UserRound} size={22} color="primary" />
            </View>
            <View style={styles.grow}>
              <Text variant="bodyStrong" weight="700">
                {t('login.guest')}
              </Text>
              <Text variant="caption">{t('login.guestNote')}</Text>
            </View>
            <Icon icon={ArrowRight} size={20} color="primary" flipInRTL />
          </Touchable>

          <View style={styles.or} accessibilityRole="text">
            <View style={styles.rule} />
            <Text variant="caption" align="center" style={styles.orText}>
              {t('login.or')}
            </Text>
            <View style={styles.rule} />
          </View>

          <View style={styles.emailRow}>
            <View style={styles.grow}>
              <TextField
                label={t('login.email')}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (error) setError(undefined);
                }}
                placeholder={t('login.emailPlaceholder')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="send"
                onSubmitEditing={sendCode}
                prefix={<Icon icon={Mail} size={18} color="text2" />}
                aria-invalid={!!error}
              />
            </View>
            <Button
              label={t('login.sendCode')}
              variant="secondary"
              disabled={busy}
              onPress={sendCode}
              style={styles.send}
            />
          </View>
          {error ? (
            <Text variant="caption" color="dangerText" accessibilityRole="alert">
              {error}
            </Text>
          ) : null}
          <Text variant="caption">{t('login.codeNote')}</Text>

          <View style={styles.social}>
            <SocialButton
              label={t('login.google')}
              mark={
                <Text weight="700" size={18} color="text" script="latin">
                  G
                </Text>
              }
              disabled={busy}
              onPress={() => void run(signInWithGoogle)}
            />
            {Platform.OS !== 'android' ? (
              <SocialButton
                label={t('login.apple')}
                mark={<Icon icon={Apple} size={20} color="text" />}
                disabled={busy}
                onPress={() => void run(signInWithApple)}
              />
            ) : null}
          </View>

          <View style={styles.privacy} accessibilityRole="text">
            <Icon icon={ShieldCheck} size={18} color="link" />
            <Text variant="label" weight="500" color="text" style={styles.grow}>
              {t('login.privacy')}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SocialButton({
  label,
  mark,
  disabled,
  onPress,
}: {
  label: string;
  mark: ReactNode;
  disabled: boolean;
  onPress: () => void;
}) {
  const styles = useStyles();
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={styles.socialBtn}
    >
      <View style={styles.mark}>{mark}</View>
      <Text variant="bodyStrong" weight="600">
        {label}
      </Text>
    </Touchable>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    grow: { flex: 1 },
    top: { minHeight: t.size.topBar, paddingHorizontal: t.space.md, justifyContent: 'center' },
    body: { paddingHorizontal: t.size.gutter, paddingBottom: t.space.xl, gap: t.space.md },
    hero: { alignItems: 'center', gap: t.space.sm, paddingBottom: t.space.sm },
    guest: {
      minHeight: 72,
      padding: t.space.lg,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1.5,
      borderColor: t.colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    guestIcon: {
      width: 44,
      height: 44,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.tint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    or: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
    rule: { flex: 1, height: 1, backgroundColor: t.colors.border },
    orText: { flexShrink: 1 },
    emailRow: { flexDirection: 'row', alignItems: 'flex-end', gap: t.space.sm },
    send: { minHeight: 52 },
    social: { gap: t.space.sm, marginTop: t.space.xs },
    socialBtn: {
      minHeight: 52,
      paddingHorizontal: t.space.lg,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.surface,
      borderWidth: 1.5,
      borderColor: t.colors.ctl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    mark: { width: 22, alignItems: 'center' },
    privacy: {
      marginTop: t.space.sm,
      padding: 14,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.tint,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
  }),
);
