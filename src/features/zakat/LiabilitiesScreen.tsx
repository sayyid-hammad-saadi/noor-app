import { useRouter } from 'expo-router';
import { ArrowRight, CreditCard, Info, ReceiptText, Store } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Icon, Text } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';

import { AmountRow } from './components/AmountRow';
import { ZakatShell } from './components/ZakatShell';
import { formatMoney } from './money';
import { zakatRoutes } from './routes';
import { calculateZakat, LIABILITY_KEYS, type LiabilityKey } from './zakatCalc';
import { saveRecord, setLiability, zakatDraft } from './zakatStore';

const ICONS: Record<LiabilityKey, typeof CreditCard> = {
  debts: CreditCard,
  bills: ReceiptText,
  payables: Store,
};

/** 16c Zakat step 3: what you owe now. */
export default function LiabilitiesScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { language } = useLanguage();
  const draft = zakatDraft.use();
  const { currency } = draft;
  const result = calculateZakat(draft);

  const calculate = () => {
    saveRecord(zakatDraft.get());
    router.push(zakatRoutes.result);
  };

  return (
    <ZakatShell
      step={3}
      footer={
        <>
          <View style={styles.total} accessible>
            <Text variant="label" weight="600">
              {t('zakat.liabilities.total')}
            </Text>
            <Text size={20} weight="700" tabular>
              {formatMoney(result.totalLiabilities, language, currency)}
            </Text>
          </View>
          <View style={styles.buttons}>
            <Button
              label={t('zakat.back')}
              variant="secondary"
              onPress={() => router.back()}
              style={styles.back}
            />
            <Button
              label={t('zakat.liabilities.calculate')}
              icon={ArrowRight}
              iconPosition="end"
              iconFlipInRTL
              grow
              onPress={calculate}
            />
          </View>
        </>
      }
    >
      <View style={styles.intro}>
        <Text size={20} weight="700" accessibilityRole="header">
          {t('zakat.liabilities.title')}
        </Text>
        <Text variant="subtle" size={14}>
          {t('zakat.liabilities.body')}
        </Text>
      </View>
      <View style={[styles.card, { boxShadow: shadows.card }]}>
        {LIABILITY_KEYS.map((key, i) => (
          <AmountRow
            key={key}
            first={i === 0}
            icon={ICONS[key]}
            label={t(`zakat.liabilities.items.${key}.label`)}
            caption={t(`zakat.liabilities.items.${key}.caption`)}
            value={draft.liabilities[key]}
            onChange={(v) => setLiability(key, v)}
            prefix={currency.symbol}
            lakh={currency.lakh}
          />
        ))}
      </View>
      <View style={styles.note}>
        <Icon icon={Info} size={18} color="link" />
        <Text variant="label" weight="400" style={styles.grow}>
          {t('zakat.liabilities.note')}
        </Text>
      </View>
    </ZakatShell>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    intro: { gap: t.space.xs },
    card: {
      marginTop: 14,
      paddingStart: 14,
      paddingEnd: t.space.md,
      paddingVertical: t.space.xxs,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
    note: {
      marginTop: 14,
      paddingVertical: t.space.md,
      paddingHorizontal: 14,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.surface2,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    grow: { flex: 1 },
    total: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: t.space.md,
    },
    buttons: { flexDirection: 'row', gap: 10 },
    back: { minWidth: 104 },
  }),
);
