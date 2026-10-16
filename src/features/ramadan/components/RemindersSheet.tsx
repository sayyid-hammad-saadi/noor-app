import { BellOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { BottomSheet, useToast } from '@/components/feedback';
import { Switch, Text } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { ensureNotificationPermission } from '@/lib/notifications';
import { makeStyles } from '@/theme';

import { REMINDER_LEAD_MIN, reminderPrefs } from '../ramadanStore';

/** Sehri and Iftar reminder switches. */
export function RemindersSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const toast = useToast();
  const { localizeDigits } = useLanguage();
  const prefs = reminderPrefs.use();

  const toggle = async (kind: 'sehri' | 'iftar', on: boolean) => {
    if (on) {
      const granted = await ensureNotificationPermission(
        t('permissions.notifications.channelName'),
      ).catch(() => false);
      if (!granted) {
        toast.show({ message: t('ramadan.reminders.denied'), icon: BellOff });
        return;
      }
    }
    reminderPrefs.set((p) => ({ ...p, [kind]: on }));
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t('ramadan.reminders.title')}
      subtitle={t('ramadan.reminders.subtitle')}
    >
      <View style={styles.group}>
        {(['sehri', 'iftar'] as const).map((kind, i) => (
          <View key={kind} style={[styles.row, i > 0 && styles.rowBorder]}>
            <View style={styles.grow}>
              <Text variant="bodyStrong">{t(`ramadan.reminders.${kind}`)}</Text>
              <Text variant="caption">
                {t(`ramadan.reminders.${kind}Caption`, {
                  minutes: localizeDigits(REMINDER_LEAD_MIN[kind]),
                })}
              </Text>
            </View>
            <Switch
              value={prefs[kind]}
              onValueChange={(v) => void toggle(kind, v)}
              accessibilityLabel={t(`ramadan.reminders.${kind}`)}
            />
          </View>
        ))}
      </View>
    </BottomSheet>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    group: {
      paddingStart: 14,
      paddingEnd: t.space.xs,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface2,
    },
    row: {
      minHeight: 60,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
      paddingVertical: t.space.xs,
    },
    rowBorder: { borderTopWidth: 1, borderTopColor: t.colors.border },
    grow: { flex: 1 },
  }),
);
