import { useRouter } from 'expo-router';
import { Check, CircleCheck, FileText, Plus, Share2 } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, useToast } from '@/components/feedback';
import { TopBar } from '@/components/layout';
import { Button, Icon, IconButton, Text } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { toHijri } from '@/lib/calendars';
import { dayMonthLabel } from '@/lib/dateLabels';
import { makeStyles, palettes, useTheme } from '@/theme';

import { formatMoney } from './money';
import { renderPdf, sharePdf } from './reportFile';
import { reportRoute, zakatRoutes } from './routes';
import { reportHtml, reportModel } from './zakatReport';
import { updateRecord, type ZakatRecord, zakatRecords } from './zakatStore';

/** 30b Zakat reports: one card per Hijri year with paid status. */
export default function HistoryScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { language } = useLanguage();
  const records = Object.values(zakatRecords.use()).sort((a, b) => b.year - a.year);
  const thisYear = toHijri(new Date()).year;
  const current = records.find((r) => r.year === thisYear);
  const paid = records.filter((r) => r.paidAt && r.result.due);
  const currency = records[0]?.input.currency;
  const totalPaid = paid.reduce((s, r) => s + r.result.zakat, 0);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        title={t('zakat.history.title')}
        right={
          <IconButton
            icon={Plus}
            accessibilityLabel={t('zakat.history.new')}
            onPress={() => router.push(zakatRoutes.nisab)}
          />
        }
      />
      <FlatList
        data={records}
        keyExtractor={(r) => String(r.year)}
        contentContainerStyle={[styles.list, !records.length && styles.grow]}
        ListHeaderComponent={
          records.length && currency ? (
            <View style={[styles.card, styles.summary, { boxShadow: shadows.card }]} accessible>
              <View style={styles.shrink}>
                <Text variant="caption">{t('zakat.history.totalPaid')}</Text>
                <Text size={24} weight="700" tabular>
                  {formatMoney(totalPaid, language, currency)}
                </Text>
              </View>
              {current && current.result.due && !current.paidAt ? (
                <View style={styles.summaryEnd}>
                  <Text variant="caption">{t('zakat.history.dueThisYear')}</Text>
                  <Text size={17} weight="700" color="goldText" tabular>
                    {formatMoney(current.result.zakat, language, current.input.currency)}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon={FileText}
            title={t('zakat.history.emptyTitle')}
            body={t('zakat.history.emptyBody')}
            action={{
              label: t('zakat.history.start'),
              onPress: () => router.push(zakatRoutes.nisab),
            }}
          />
        }
        renderItem={({ item }) => (
          <RecordCard record={item} onView={() => router.push(reportRoute(item.year))} />
        )}
      />
    </SafeAreaView>
  );
}

function RecordCard({ record, onView }: { record: ZakatRecord; onView: () => void }) {
  const styles = useStyles();
  const toast = useToast();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { language, localizeDigits } = useLanguage();
  const [sharing, setSharing] = useState(false);
  const { result, input } = record;
  const money = (v: number) => formatMoney(v, language, input.currency);
  const created = new Date(record.createdAt);
  const hijriMonths = t('date.hijriMonths', { returnObjects: true }) as string[];
  const h = toHijri(created);
  const status = !result.due ? 'none' : record.paidAt ? 'paid' : 'due';

  const share = async () => {
    setSharing(true);
    try {
      const html = reportHtml(reportModel(record, t, language), language, palettes.light);
      await sharePdf(await renderPdf(html), `Zakat-Report-${record.year}.pdf`);
    } catch {
      toast.show({ message: t('zakat.report.failed') });
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={[styles.card, styles.record, { boxShadow: shadows.card }]}>
      <View style={styles.r1}>
        <View style={styles.shrink}>
          <Text variant="title" accessibilityRole="header">
            {t('zakat.history.yearAh', { year: localizeDigits(record.year) })}
          </Text>
          <Text variant="caption">
            {`${dayMonthLabel(created, t, language)} · ${localizeDigits(h.day)} ${hijriMonths[h.month - 1] ?? ''}`}
          </Text>
        </View>
        <View style={[styles.badge, status === 'paid' ? styles.badgePaid : styles.badgeDue]}>
          {status === 'paid' ? <Icon icon={Check} size={12} color="okFg" strokeWidth={3} /> : null}
          <Text size={11} weight="700" color={status === 'paid' ? 'okFg' : 'goldText'}>
            {status === 'paid'
              ? t('zakat.history.paid')
              : status === 'due'
                ? t('zakat.history.notPaid')
                : t('zakat.history.noZakat')}
          </Text>
        </View>
      </View>
      <Text size={22} weight="700" color="link" tabular>
        {money(result.zakat)}
      </Text>
      <View style={styles.meta}>
        <Text variant="caption" weight="400" style={styles.metaItem}>
          {`${t('zakat.history.net')} `}
          <Text variant="caption" weight="600" color="text" tabular>
            {money(result.net)}
          </Text>
        </Text>
        <Text variant="caption" weight="400" style={styles.metaItem}>
          {`${t('zakat.history.nisab')} `}
          <Text variant="caption" weight="600" color="text">
            {t(`zakat.metals.${input.basis}`)}
          </Text>
        </Text>
      </View>
      <View style={styles.actions}>
        <Button
          label={t('zakat.history.viewPdf')}
          icon={FileText}
          variant="secondary"
          size="sm"
          grow
          onPress={onView}
        />
        {status === 'due' ? (
          <Button
            label={t('zakat.history.markPaid')}
            size="sm"
            grow
            onPress={() => {
              updateRecord(record.year, { paidAt: Date.now() });
              toast.show({
                message: t('zakat.history.paidToast'),
                icon: CircleCheck,
                action: {
                  label: t('actions.undo'),
                  onPress: () => updateRecord(record.year, { paidAt: null }),
                },
              });
            }}
          />
        ) : (
          <IconButton
            icon={Share2}
            size={20}
            accessibilityLabel={t('zakat.history.shareYear', { year: localizeDigits(record.year) })}
            disabled={sharing}
            onPress={() => void share()}
            style={styles.shareBtn}
          />
        )}
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    list: {
      paddingHorizontal: t.space.lg,
      paddingTop: t.space.sm,
      paddingBottom: t.space.xxl,
      gap: 10,
    },
    grow: { flexGrow: 1 },
    shrink: { flexShrink: 1 },
    card: {
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
    summary: {
      marginBottom: t.space.xs,
      padding: t.space.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.space.md,
    },
    summaryEnd: { alignItems: 'flex-end', gap: 2 },
    record: { padding: 14, gap: 10 },
    r1: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: t.space.sm,
    },
    badge: {
      minHeight: 24,
      paddingHorizontal: 9,
      borderRadius: t.radius.pill,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.xs,
    },
    badgePaid: { backgroundColor: t.colors.okBg },
    badgeDue: { backgroundColor: t.colors.goldTint },
    meta: { flexDirection: 'row', flexWrap: 'wrap', columnGap: t.space.md, rowGap: t.space.xs },
    metaItem: { flexBasis: '45%', flexGrow: 1 },
    actions: { flexDirection: 'row', gap: t.space.sm },
    shareBtn: {
      width: 52,
      height: t.size.buttonSm,
      borderRadius: t.radius.md,
      borderWidth: 1.5,
      borderColor: t.colors.border,
    },
  }),
);
