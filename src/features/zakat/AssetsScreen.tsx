import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Gem,
  HandCoins,
  type LucideIcon,
  Package,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { formatNumber, useLanguage } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';

import { AmountRow, type RowTone } from './components/AmountRow';
import { ZakatShell } from './components/ZakatShell';
import { formatMoney } from './money';
import { zakatRoutes } from './routes';
import { ASSET_KEYS, type AssetKey, calculateZakat, GRAM_ASSETS } from './zakatCalc';
import { setAsset, zakatDraft } from './zakatStore';

const ROWS: Record<AssetKey, { icon: LucideIcon; tone: RowTone }> = {
  cash: { icon: Wallet, tone: 'tint' },
  gold: { icon: Gem, tone: 'gold' },
  silver: { icon: Gem, tone: 'neutral' },
  business: { icon: Package, tone: 'tint' },
  receivables: { icon: HandCoins, tone: 'tint' },
  investments: { icon: TrendingUp, tone: 'tint' },
};

/** 16b Zakat step 2: what you own. */
export default function AssetsScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { language } = useLanguage();
  const draft = zakatDraft.use();
  const { currency } = draft;
  const result = calculateZakat(draft);
  const money = (v: number) => formatMoney(v, language, currency);

  const caption = (key: AssetKey) => {
    if (!GRAM_ASSETS.includes(key) || !draft.assets[key])
      return t(`zakat.assets.items.${key}.caption`);
    const metal = key as 'gold' | 'silver';
    if (!draft.rates[metal]) return t('zakat.assets.noRate', { metal: t(`zakat.metals.${metal}`) });
    return t('zakat.assets.gramValue', {
      grams: formatNumber(draft.assets[key], language),
      rate: money(draft.rates[metal]),
      value: money(result.assetValues[key]),
    });
  };

  return (
    <ZakatShell
      step={2}
      footer={
        <>
          <View style={styles.total} accessible>
            <Text variant="label" weight="600">
              {t('zakat.assets.total')}
            </Text>
            <Text size={20} weight="700" tabular>
              {money(result.totalAssets)}
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
              label={t('zakat.assets.next')}
              icon={ArrowRight}
              iconPosition="end"
              iconFlipInRTL
              grow
              onPress={() => router.push(zakatRoutes.liabilities)}
            />
          </View>
        </>
      }
    >
      <View style={styles.intro}>
        <Text size={20} weight="700" accessibilityRole="header">
          {t('zakat.assets.title')}
        </Text>
        <Text variant="subtle" size={14}>
          {t('zakat.assets.body')}
        </Text>
      </View>
      <View style={[styles.card, { boxShadow: shadows.card }]}>
        {ASSET_KEYS.map((key, i) => {
          const grams = GRAM_ASSETS.includes(key);
          return (
            <AmountRow
              key={key}
              first={i === 0}
              icon={ROWS[key].icon}
              tone={ROWS[key].tone}
              label={t(`zakat.assets.items.${key}.label`)}
              caption={caption(key)}
              value={draft.assets[key]}
              onChange={(v) => setAsset(key, v)}
              prefix={grams ? undefined : currency.symbol}
              suffix={grams ? t('zakat.assets.grams') : undefined}
              decimals={grams}
              lakh={currency.lakh}
            />
          );
        })}
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
