import { Info } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TopBar } from '@/components/layout';
import { Chip, Icon, List, Radio, Stepper, Text, Touchable } from '@/components/ui';
import { useLocation } from '@/features/location/LocationProvider';
import { clockLabel } from '@/features/prayer/formatTime';
import {
  METHOD_ANGLES,
  METHODS,
  type MethodKey,
  updatePrayerSettings,
} from '@/features/prayer/prayerSettings';
import { computeDay, methodFor, regionalMethod } from '@/features/prayer/prayerTimes';
import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

const ANGLE_STEP = 0.5;

/** 32a Calculation method: Fajr/Isha conventions with today's result for the place. */
export default function CalcMethodScreen() {
  const styles = useStyles();
  const { t } = useTranslation();
  const { language, localizeDigits } = useLanguage();
  const { place, settings } = useLocation();
  const { method } = methodFor(place.countryCode);
  const regional = regionalMethod(place.countryCode).method;
  const today = computeDay(place.latitude, place.longitude, new Date(), place.countryCode);
  const fmt = (d: Date) => clockLabel(d, language, place.timeZone, t);
  const deg = (n: number) => `${localizeDigits(n)}°`;

  const angles = (m: (typeof METHODS)[number]) => {
    const a = METHOD_ANGLES[m];
    return t('settings.methodAngles', {
      fajr: deg(a.fajr),
      isha:
        typeof a.isha === 'number'
          ? deg(a.isha)
          : t('settings.ishaAfterMaghrib', { n: localizeDigits(parseInt(a.isha, 10)) }),
    });
  };

  const choose = (m: MethodKey) => updatePrayerSettings({ method: m === regional ? null : m });
  const setCustom = (key: 'fajr' | 'isha', d: number) =>
    updatePrayerSettings({
      method: 'custom',
      custom: {
        ...settings.custom,
        [key]: Math.min(22, Math.max(10, settings.custom[key] + d)),
      },
    });

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar title={t('settings.method')} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.banner} accessibilityLiveRegion="polite">
          <Icon icon={Info} size={18} color="link" />
          <Text variant="label" weight="500" color="text" style={styles.grow}>
            {t('settings.methodToday', { place: place.shortLabel ?? '' })}{' '}
            <Text variant="label" weight="700" color="text">
              {t('settings.methodTimes', { fajr: fmt(today.fajr), isha: fmt(today.isha) })}
            </Text>
          </Text>
        </View>

        <List style={styles.list}>
          {[...METHODS, 'custom' as const].map((m) => {
            const selected = method === m;
            return (
              <View key={m}>
                <Touchable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => choose(m)}
                  style={styles.row}
                >
                  <Radio selected={selected} />
                  <View style={styles.grow}>
                    <View style={styles.titleRow}>
                      <Text variant="bodyStrong" weight="600" style={styles.shrink}>
                        {t(`prayerTimes.methods.${m}`)}
                      </Text>
                      {m === regional ? <Chip label={t('settings.recommended')} tint /> : null}
                    </View>
                    <Text variant="caption">
                      {m === 'custom'
                        ? t('settings.customNote')
                        : `${angles(m)} · ${t(`settings.methodRegions.${m}`)}`}
                    </Text>
                  </View>
                </Touchable>
                {m === 'custom' && selected ? (
                  <View style={styles.custom}>
                    {(['fajr', 'isha'] as const).map((k) => (
                      <View key={k} style={styles.customRow}>
                        <Text variant="body" style={styles.grow}>
                          {t('settings.angleOf', { prayer: t(`prayers.${k}`) })}
                        </Text>
                        <Stepper
                          value={deg(settings.custom[k])}
                          onIncrement={() => setCustom(k, ANGLE_STEP)}
                          onDecrement={() => setCustom(k, -ANGLE_STEP)}
                          canIncrement={settings.custom[k] < 22}
                          canDecrement={settings.custom[k] > 10}
                          accessibilityLabel={t('settings.angleOf', { prayer: t(`prayers.${k}`) })}
                        />
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </List>
        <Text variant="caption" align="center" style={styles.note}>
          {t('settings.methodNote')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    body: { paddingHorizontal: t.size.gutter, paddingBottom: t.space.xxl },
    banner: {
      marginTop: t.space.xs,
      padding: 14,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.tint,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    grow: { flex: 1 },
    shrink: { flexShrink: 1 },
    list: { marginTop: t.space.md },
    row: {
      minHeight: 64,
      paddingVertical: t.space.md,
      paddingHorizontal: t.space.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
    custom: { paddingStart: 54, paddingEnd: t.space.lg, paddingBottom: t.space.md, gap: 4 },
    customRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: t.space.md },
    note: { marginTop: t.space.lg },
  }),
);
