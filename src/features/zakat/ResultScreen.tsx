import { useRouter } from 'expo-router';
import {
  BellOff,
  CalendarClock,
  CircleAlert,
  Check,
  Download,
  RotateCcw,
  Share2,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Share, StyleSheet, View } from 'react-native';

import { useToast } from '@/components/feedback';
import { IslamicPattern } from '@/components/layout';
import { Button, Icon, IconButton, Switch, Text } from '@/components/ui';
import { formatNumber, useLanguage } from '@/i18n';
import { toHijri } from '@/lib/calendars';
import { hijriLocalized } from '@/lib/dateLabels';
import { ensureNotificationPermission } from '@/lib/notifications';
import { makeStyles, useTheme } from '@/theme';

import { ZakatShell } from './components/ZakatShell';
import { formatMoney } from './money';
import { reportRoute, zakatRoutes } from './routes';
import { calculateZakat, NISAB_GRAMS } from './zakatCalc';
import { cancelHawlReminder, hawlDate, scheduleHawlReminder } from './zakatReminder';
import { resetDraft, updateRecord, zakatDraft, zakatRecords } from './zakatStore';

/** 16d Zakat step 4: amount payable, breakdown, next-year reminder. */
export default function ResultScreen() {
  const styles = useStyles();
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { language, localizeDigits } = useLanguage();
  const draft = zakatDraft.use();
  const year = toHijri(new Date()).year;
  const record = zakatRecords.use()[year] ?? null;
  const input = record?.input ?? draft;
  const result = record?.result ?? calculateZakat(draft);
  const money = (v: number) => formatMoney(v, language, input.currency);
  const metal = t(`zakat.metals.${input.basis}`);

  const startOver = () => {
    resetDraft();
    router.dismissTo(zakatRoutes.nisab);
  };

  const toggleReminder = async (on: boolean) => {
    if (!record) return;
    if (on) {
      const granted = await ensureNotificationPermission(
        t('permissions.notifications.channelName'),
      ).catch(() => false);
      if (!granted) {
        toast.show({ message: t('zakat.result.denied'), icon: BellOff });
        return;
      }
      await scheduleHawlReminder(record.year, record.createdAt, {
        title: t('zakat.result.reminderTitle'),
        body: t('zakat.result.reminderBody'),
      }).catch(() => undefined);
    } else {
      await cancelHawlReminder(record.year);
    }
    updateRecord(record.year, { remind: on });
  };

  const share = () =>
    void Share.share({
      message: t('zakat.result.shareText', {
        year: localizeDigits(year),
        amount: money(result.zakat),
        net: money(result.net),
        metal,
        nisab: money(result.nisab),
      }),
    });

  const rows = [
    { label: t('zakat.result.totalAssets'), value: money(result.totalAssets) },
    { label: t('zakat.result.lessLiabilities'), value: `− ${money(result.totalLiabilities)}` },
    { label: t('zakat.result.net'), value: money(result.net), strong: true },
    {
      label: t('zakat.result.nisabRow', {
        metal,
        grams: formatNumber(NISAB_GRAMS[input.basis], language),
      }),
      value: money(result.nisab),
    },
  ];

  return (
    <ZakatShell
      step={4}
      trailing={{ icon: RotateCcw, label: t('zakat.startOver'), onPress: startOver }}
      footer={
        <View style={styles.buttons}>
          <IconButton
            icon={Share2}
            size={20}
            accessibilityLabel={t('zakat.result.share')}
            onPress={share}
            style={styles.shareBtn}
          />
          <Button
            label={t('zakat.result.download')}
            icon={Download}
            grow
            disabled={!record}
            onPress={() => record && router.push(reportRoute(record.year))}
          />
        </View>
      }
    >
      <View style={[styles.hero, { boxShadow: shadows.card }]} accessible>
        <IslamicPattern color="primary" opacity={0.05} id="zakat-result" />
        <View style={[styles.status, result.due ? styles.statusDue : styles.statusNot]}>
          <Icon
            icon={result.due ? Check : CircleAlert}
            size={14}
            color={result.due ? 'okFg' : 'goldText'}
            strokeWidth={2.5}
          />
          <Text variant="caption" weight="700" color={result.due ? 'okFg' : 'goldText'}>
            {t(result.due ? 'zakat.result.due' : 'zakat.result.notDue')}
          </Text>
        </View>
        <Text variant="label" weight="600" align="center" style={styles.payLabel}>
          {t('zakat.result.payable')}
        </Text>
        <Text
          size={44}
          weight="700"
          color="link"
          align="center"
          tabular
          numberOfLines={1}
          adjustsFontSizeToFit
          style={styles.amount}
        >
          {money(result.zakat)}
        </Text>
        <Text variant="label" weight="400" align="center">
          {result.due
            ? t('zakat.result.rateNote')
            : t('zakat.result.notDueNote', { nisab: money(result.nisab) })}
        </Text>
      </View>

      <View
        style={[styles.card, { boxShadow: shadows.card }]}
        accessibilityLabel={t('zakat.result.breakdown')}
      >
        {rows.map((r, i) => (
          <View key={i} style={[styles.row, i > 0 && styles.rule]} accessible>
            <Text
              color={r.strong ? 'text' : 'text2'}
              weight={r.strong ? '700' : '400'}
              style={styles.grow}
            >
              {r.label}
            </Text>
            <Text weight={r.strong ? '700' : '400'} tabular>
              {r.value}
            </Text>
          </View>
        ))}
      </View>

      {record ? (
        <View style={styles.remind}>
          <Icon icon={CalendarClock} size={20} color="link" />
          <View style={styles.grow}>
            <Text variant="body" weight="600" size={14}>
              {t('zakat.result.remind')}
            </Text>
            <Text variant="caption" weight="400">
              {t('zakat.result.remindCaption', {
                date: hijriLocalized(hawlDate(record.createdAt), t, language),
              })}
            </Text>
          </View>
          <Switch
            value={record.remind}
            onValueChange={(v) => void toggleReminder(v)}
            accessibilityLabel={t('zakat.result.remind')}
          />
        </View>
      ) : null}

      <Text variant="caption" weight="400" style={styles.disclaimer}>
        {t('zakat.result.disclaimer')}
      </Text>
    </ZakatShell>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    hero: {
      overflow: 'hidden',
      padding: t.space.xl,
      borderRadius: 20,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
      alignItems: 'center',
      gap: 6,
    },
    status: {
      minHeight: 26,
      paddingHorizontal: 10,
      borderRadius: t.radius.pill,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    statusDue: { backgroundColor: t.colors.okBg },
    statusNot: { backgroundColor: t.colors.goldTint },
    payLabel: { marginTop: 6 },
    amount: { lineHeight: 52, letterSpacing: -0.8 },
    card: {
      marginTop: t.space.md,
      paddingVertical: 6,
      paddingHorizontal: t.space.lg,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
    row: {
      minHeight: t.size.touch,
      paddingVertical: t.space.xs,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.space.md,
    },
    rule: { borderTopWidth: 1, borderTopColor: t.colors.border },
    grow: { flex: 1 },
    remind: {
      marginTop: t.space.md,
      paddingVertical: t.space.xs,
      paddingStart: 14,
      paddingEnd: t.space.xs,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface2,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
      minHeight: 56,
    },
    disclaimer: { marginTop: t.space.md, marginHorizontal: t.space.xs },
    buttons: { flexDirection: 'row', gap: 10 },
    shareBtn: {
      width: 56,
      height: t.size.button,
      borderRadius: t.radius.lg,
      borderWidth: 1.5,
      borderColor: t.colors.border,
    },
  }),
);
