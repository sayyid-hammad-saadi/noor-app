import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, ChevronRight, FileText } from 'lucide-react-native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Icon, IconTile, Radio, Text, Touchable } from '@/components/ui';
import { useLocation } from '@/features/location/LocationProvider';
import { formatNumber, useLanguage } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';

import { AmountInput } from './components/AmountInput';
import { ZakatShell } from './components/ZakatShell';
import { currencyFor, formatMoney } from './money';
import { zakatRoutes } from './routes';
import { type Metal, NISAB_GRAMS, NISAB_TOLA, nisabValue } from './zakatCalc';
import { setBasis, setRate, zakatDraft, zakatRecords } from './zakatStore';

const METALS: readonly Metal[] = ['silver', 'gold'];

/** 16a Zakat step 1: nisab basis and today's metal rates. */
export default function NisabScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { language } = useLanguage();
  const { place } = useLocation();
  const draft = zakatDraft.use();
  const hasHistory = Object.keys(zakatRecords.use()).length > 0;
  const { currency } = draft;
  const nisab = nisabValue(draft);

  // A fresh calculation uses the local currency of the saved location.
  const localCode = currencyFor(place.countryCode).code;
  const untouched = !draft.rates.silver && !draft.rates.gold;
  useEffect(() => {
    if (untouched && localCode !== zakatDraft.get().currency.code) {
      zakatDraft.set((d) => ({ ...d, currency: currencyFor(place.countryCode) }));
    }
  }, [untouched, localCode, place.countryCode]);

  return (
    <ZakatShell
      step={1}
      leading="close"
      footer={
        <Button
          label={t('zakat.nisab.next')}
          icon={ArrowRight}
          iconPosition="end"
          iconFlipInRTL
          disabled={nisab <= 0}
          onPress={() => router.push(zakatRoutes.assets)}
        />
      }
    >
      <View style={styles.intro}>
        <Text size={20} weight="700" accessibilityRole="header">
          {t('zakat.nisab.title')}
        </Text>
        <Text variant="subtle" size={14}>
          {t('zakat.nisab.body')}
        </Text>
      </View>

      <View
        style={styles.options}
        accessibilityRole="radiogroup"
        accessibilityLabel={t('zakat.nisab.basis')}
      >
        {METALS.map((metal) => {
          const selected = draft.basis === metal;
          return (
            <Touchable
              key={metal}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => setBasis(metal)}
              style={[styles.option, selected && styles.optionOn]}
            >
              <LinearGradient
                colors={
                  metal === 'silver'
                    ? [colors.metalSilver1, colors.metalSilver2]
                    : [colors.metalGold1, colors.metalGold2]
                }
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={styles.swatch}
              />
              <View style={styles.optionText}>
                <View style={styles.optionTitle}>
                  <Text size={17} weight="700">
                    {t(`zakat.metals.${metal}`)}
                  </Text>
                  {metal === 'silver' ? (
                    <View style={styles.badge}>
                      <Text size={11} weight="700" color="onBtn">
                        {t('zakat.nisab.recommended')}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text variant="label" weight="600" color="text" tabular>
                  {t('zakat.nisab.weight', {
                    grams: formatNumber(NISAB_GRAMS[metal], language),
                    tola: formatNumber(NISAB_TOLA[metal], language),
                  })}
                </Text>
                <Text variant="caption" weight="400">
                  {t(metal === 'silver' ? 'zakat.nisab.silverNote' : 'zakat.nisab.goldNote')}
                </Text>
              </View>
              <Radio selected={selected} />
            </Touchable>
          );
        })}
      </View>

      <View style={styles.rateHead}>
        <Text variant="bodyStrong" weight="700" style={styles.shrink}>
          {t('zakat.nisab.rateTitle')}
        </Text>
        <Text variant="caption">{t('zakat.nisab.rateNote')}</Text>
      </View>
      <View style={styles.rates}>
        {METALS.map((metal) => (
          <View key={metal} style={styles.rate}>
            <Text variant="caption" weight="600">
              {t(`zakat.metals.${metal}`)}
            </Text>
            <AmountInput
              size="lg"
              decimals
              lakh={currency.lakh}
              value={draft.rates[metal]}
              onChange={(v) => setRate(metal, v)}
              prefix={currency.symbol}
              suffix={t('zakat.nisab.perGram')}
              accessibilityLabel={t('zakat.nisab.rateLabel', { metal: t(`zakat.metals.${metal}`) })}
              style={draft.basis === metal && !draft.rates[metal] ? styles.rateNeeded : null}
            />
          </View>
        ))}
      </View>

      <View style={styles.threshold} accessible>
        <Text variant="label" weight="600" style={styles.shrink}>
          {t('zakat.nisab.threshold')}
        </Text>
        {nisab > 0 ? (
          <Text size={17} weight="700" tabular>
            {formatMoney(nisab, language, currency)}
          </Text>
        ) : (
          <Text variant="caption" weight="600" color="goldText">
            {t('zakat.nisab.enterRate', { metal: t(`zakat.metals.${draft.basis}`) })}
          </Text>
        )}
      </View>

      {hasHistory ? (
        <Touchable
          accessibilityRole="link"
          onPress={() => router.push(zakatRoutes.history)}
          style={styles.history}
        >
          <IconTile icon={FileText} size="sm" />
          <View style={styles.grow}>
            <Text variant="bodyStrong">{t('zakat.nisab.history')}</Text>
            <Text variant="caption">{t('zakat.nisab.historyCaption')}</Text>
          </View>
          <Icon icon={ChevronRight} size={18} color="text2" flipInRTL />
        </Touchable>
      ) : null}
    </ZakatShell>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    intro: { gap: 6 },
    options: { marginTop: t.space.lg, gap: 10 },
    option: {
      padding: 14,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1.5,
      borderColor: t.colors.border,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: t.space.md,
    },
    optionOn: { backgroundColor: t.colors.tint, borderColor: t.colors.primary },
    swatch: { width: 40, height: 40, borderRadius: t.radius.pill },
    optionText: { flex: 1, gap: 2 },
    optionTitle: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm, flexWrap: 'wrap' },
    badge: {
      minHeight: 20,
      paddingHorizontal: t.space.sm,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.btn,
      justifyContent: 'center',
    },
    rateHead: {
      marginTop: 18,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: t.space.sm,
      flexWrap: 'wrap',
    },
    shrink: { flexShrink: 1 },
    rates: { marginTop: t.space.sm, flexDirection: 'row', gap: 10 },
    rate: { flex: 1, gap: 6 },
    rateNeeded: { borderColor: t.colors.gold },
    threshold: {
      marginTop: 14,
      minHeight: 48,
      paddingVertical: t.space.md,
      paddingHorizontal: 14,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.surface2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.space.md,
    },
    history: {
      marginTop: t.space.lg,
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    grow: { flex: 1 },
  }),
);
