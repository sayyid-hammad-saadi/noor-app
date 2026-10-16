import { useLocalSearchParams, useRouter } from 'expo-router';
import { Download, FileX, Printer, Share2, X } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, useToast } from '@/components/feedback';
import { TopBar } from '@/components/layout';
import { Button, IconButton, Text } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles, palettes } from '@/theme';

import { ReportPaper } from './components/ReportPaper';
import { printPdf, renderPdf, savePdf, sharePdf } from './reportFile';
import { reportHtml, reportModel } from './zakatReport';
import { zakatRecords } from './zakatStore';

/** 17 Report preview: the A4 page, share, save and print. */
export default function ReportScreen() {
  const styles = useStyles();
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { year } = useLocalSearchParams<{ year: string }>();
  const record = zakatRecords.use()[year ?? ''] ?? null;
  const [busy, setBusy] = useState(false);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/zakat'));

  if (!record) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <TopBar title={t('zakat.report.title')} />
        <EmptyState icon={FileX} title={t('zakat.report.missing')} />
      </SafeAreaView>
    );
  }

  const model = reportModel(record, t, language);
  const html = () => reportHtml(model, language, palettes.light);
  const fileName = `Zakat-Report-${record.year}.pdf`;
  const run = async (task: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await task();
    } catch {
      toast.show({ message: t('zakat.report.failed') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TopBar
          title={t('zakat.report.title')}
          subtitle={t('zakat.report.file', { year: record.year })}
          onBack={close}
          backIcon={X}
          backLabel={t('zakat.report.close')}
          right={
            <IconButton
              icon={Printer}
              size={22}
              accessibilityLabel={t('zakat.report.print')}
              disabled={busy}
              onPress={() => void run(() => printPdf(html()))}
            />
          }
        />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <ReportPaper model={model} label={t('zakat.report.preview')} />
        <Text variant="caption" align="center" style={styles.page}>
          {model.page}
        </Text>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          label={t('zakat.report.share')}
          icon={Share2}
          variant="secondary"
          grow
          disabled={busy}
          onPress={() => void run(async () => sharePdf(await renderPdf(html()), fileName))}
        />
        <Button
          label={t('zakat.report.download')}
          icon={Download}
          disabled={busy}
          loading={busy}
          style={styles.download}
          onPress={() => void run(async () => savePdf(await renderPdf(html()), fileName, fileName))}
        />
      </View>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.surface2 },
    header: {
      backgroundColor: t.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
      paddingHorizontal: t.space.xs,
    },
    body: { padding: t.size.gutter, paddingTop: t.space.xl },
    page: { marginTop: t.space.lg },
    footer: {
      paddingTop: 14,
      paddingHorizontal: t.size.gutter,
      paddingBottom: t.space.md,
      backgroundColor: t.colors.surface,
      borderTopWidth: 1,
      borderTopColor: t.colors.border,
      flexDirection: 'row',
      gap: 10,
    },
    download: { flex: 1.6 },
  }),
);
