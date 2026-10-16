import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Logo } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { markOnboardingDone } from '@/features/onboarding/onboardingState';
import { PRAYER_CHANNEL_ID } from '@/features/prayer/adhanScheduler';
import { clockParts } from '@/features/prayer/formatTime';
import { usePrayerTimes } from '@/features/prayer/usePrayerTimes';
import { useLanguage } from '@/i18n';
import { routes } from '@/lib/routes';
import { brand, makeStyles, useTheme } from '@/theme';

import { BellArt } from './illustrations/BellArt';
import { PermissionLayout } from './PermissionLayout';

/** 04b Permission — Notifications. Last step of first run; then Home. */
export default function NotificationPermissionScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const [busy, setBusy] = useState(false);

  const finish = async () => {
    await markOnboardingDone();
    router.replace(routes.home);
  };

  const turnOn = async () => {
    setBusy(true);
    try {
      // Android 13+ only shows the permission prompt once a channel exists.
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(PRAYER_CHANNEL_ID, {
          name: t('permissions.notifications.channelName'),
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
      await Notifications.requestPermissionsAsync();
    } catch {
      // A failed prompt shouldn't block first run; Settings can retry later.
    }
    setBusy(false);
    await finish();
  };

  const artSize = Math.min(260, height * 0.28);

  return (
    <PermissionLayout
      art={
        <View style={[styles.artBox, { height: artSize + 40 }]}>
          <BellArt size={artSize} />
          <NotificationPreview />
        </View>
      }
      title={t('permissions.notifications.title')}
      body={t('permissions.notifications.body')}
      actions={
        <>
          <Button
            size="lg"
            icon={Bell}
            label={t('permissions.notifications.turnOn')}
            loading={busy}
            onPress={() => void turnOn()}
          />
          <Button
            size="lg"
            variant="secondary"
            label={t('permissions.notifications.later')}
            onPress={() => void finish()}
          />
        </>
      }
    />
  );
}

/** A mock system notification showing tomorrow's-style Fajr alert with real times. */
function NotificationPreview() {
  const styles = useStyles();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { language, script } = useLanguage();
  const { today, place } = usePrayerTimes();
  const fajr = clockParts(today.fajr, language, place.timeZone, { padHour: true });

  return (
    <View
      style={[styles.preview, { boxShadow: shadows.card }]}
      accessible
      accessibilityLabel={`${t('permissions.notifications.appName')}: ${t('permissions.notifications.previewBody')}`}
    >
      <LinearGradient
        colors={[brand.teal, brand.tealDark]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={styles.appIcon}
      >
        <Logo size={24} sparkle={false} />
      </LinearGradient>
      <View style={styles.previewText}>
        <View style={styles.previewMeta}>
          <Text variant="caption" style={script === 'latin' ? styles.tracked : null}>
            {t('permissions.notifications.appName')}
          </Text>
          <Text variant="caption">{t('permissions.notifications.now')}</Text>
        </View>
        <Text variant="bodyStrong" tabular>
          {t('permissions.notifications.previewTitle', {
            prayer: t('prayers.fajr'),
            time: `${fajr.time} ${t(`time.${fajr.period}`)}`,
          })}
        </Text>
        <Text variant="label" weight="400">
          {t('permissions.notifications.previewBody')}
        </Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    artBox: { alignSelf: 'stretch', alignItems: 'center' },
    preview: {
      position: 'absolute',
      start: t.space.sm,
      end: t.space.sm,
      bottom: 0,
      padding: 14,
      borderRadius: t.space.xl,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: t.space.md,
    },
    appIcon: {
      width: 38,
      height: 38,
      borderRadius: t.radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewText: { flex: 1, minWidth: 0, gap: t.space.xxs },
    previewMeta: { flexDirection: 'row', justifyContent: 'space-between' },
    tracked: { letterSpacing: 0.5 },
  }),
);
