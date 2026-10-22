import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, Navigation } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/feedback';
import { TopBar } from '@/components/layout';
import { Chip, Icon, IconTile, List, SearchField, Text, Touchable } from '@/components/ui';
import { Highlight } from '@/features/search/Highlight';
import { useLanguage } from '@/i18n';
import { routes } from '@/lib/routes';
import { makeStyles } from '@/theme';

import { CITIES, type City } from './cities';
import { requestDeviceLocation } from './deviceLocation';
import { useLocation } from './LocationProvider';

/** "GMT+6" for a time zone, or null where Intl can't tell. */
function gmtOffset(timeZone: string): string | null {
  try {
    const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value;
    return part?.replace('-', '−') ?? null;
  } catch {
    return null;
  }
}

/**
 * 34e Choose your city: manual location, with a notice and a settings link when
 * location access is off. `then=onboarding` continues the first-run flow afterwards.
 */
export default function ChooseCityScreen() {
  const styles = useStyles();
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const { language, localizeDigits } = useLanguage();
  const { place, saved, setLocation } = useLocation();
  const params = useLocalSearchParams<{ denied?: string; then?: string }>();
  const [denied, setDenied] = useState(params.denied === '1');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let cancelled = false;
    Location.getForegroundPermissionsAsync().then(
      (p) => !cancelled && setDenied(p.status === Location.PermissionStatus.DENIED),
      () => undefined,
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return CITIES.filter((c) =>
      [c.name.bn, c.name.en, c.name.ar, c.country[language]].some((n) =>
        n.toLowerCase().includes(q),
      ),
    );
  }, [query, language]);

  const popular = useMemo(() => {
    const local = CITIES.filter((c) => c.countryCode === (place.countryCode ?? 'BD')).slice(0, 3);
    const extra = CITIES.filter((c) => ['makkah', 'london'].includes(c.id) && !local.includes(c));
    return [...local, ...extra];
  }, [place.countryCode]);

  const done = () => {
    if (params.then === 'onboarding') router.replace(routes.permissionNotifications);
    else if (router.canGoBack()) router.back();
    else router.replace(routes.home);
  };

  const pick = async (city: City) => {
    await setLocation({ source: 'city', cityId: city.id });
    done();
  };

  const locateDevice = async () => {
    const result = await requestDeviceLocation();
    if (result.status === 'ok') {
      await setLocation(result.location);
      done();
    } else if (result.status === 'denied') setDenied(true);
    else toast.show({ message: t('permissions.location.unavailable') });
  };

  const caption = (c: City) => {
    const offset = gmtOffset(c.timeZone);
    // Isolate keeps "GMT+6" in order inside right-to-left text.
    return offset
      ? `${c.country[language]} · \u2066${localizeDigits(offset)}\u2069`
      : c.country[language];
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar title={t('location.pickerTitle')} />
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {denied ? (
          <View style={styles.warn} accessibilityRole="alert">
            <Icon icon={MapPin} size={20} color="goldText" />
            <View style={styles.grow}>
              <Text variant="label" weight="700" color="text">
                {t('location.deniedTitle')}
              </Text>
              <Text variant="label" weight="400" color="text">
                {t('location.deniedBody')}
              </Text>
              {Platform.OS !== 'web' ? (
                <Touchable
                  accessibilityRole="link"
                  onPress={() => void Linking.openSettings()}
                  hitSlop={8}
                  style={styles.link}
                >
                  <Text variant="label" weight="700" color="link" style={styles.underline}>
                    {t('location.openSettings')}
                  </Text>
                </Touchable>
              ) : null}
            </View>
          </View>
        ) : null}

        <SearchField
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          placeholder={t('location.searchPlaceholder')}
          autoFocus
        />

        {query.trim() ? (
          <>
            <Text variant="section" style={styles.section} accessibilityRole="header">
              {t('location.results')}
            </Text>
            {results.length ? (
              <List>
                {results.map((c, i) => (
                  <Touchable
                    key={c.id}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: saved?.source === 'city' && saved.cityId === c.id,
                    }}
                    onPress={() => void pick(c)}
                    style={styles.row}
                  >
                    <IconTile icon={MapPin} size="sm" tone={i === 0 ? 'tint' : 'neutral'} />
                    <View style={styles.grow}>
                      <Highlight text={c.name[language]} query={query} variant="bodyStrong" />
                      <Text variant="caption">{caption(c)}</Text>
                    </View>
                  </Touchable>
                ))}
              </List>
            ) : (
              <Text variant="subtle" align="center" style={styles.empty}>
                {t('location.noResults', { q: query.trim() })}
              </Text>
            )}
          </>
        ) : (
          <>
            {!denied && Platform.OS !== 'web' ? (
              <List style={styles.device}>
                <Touchable
                  accessibilityRole="button"
                  onPress={() => void locateDevice()}
                  style={styles.row}
                >
                  <IconTile icon={Navigation} size="sm" />
                  <Text variant="bodyStrong" style={styles.grow}>
                    {t('location.useCurrent')}
                  </Text>
                </Touchable>
              </List>
            ) : null}
            <Text variant="section" style={styles.section} accessibilityRole="header">
              {t('location.popular')}
            </Text>
            <View style={styles.chips}>
              {popular.map((c) => (
                <Chip key={c.id} label={c.name[language]} onPress={() => void pick(c)} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    body: { paddingHorizontal: t.size.gutter, paddingBottom: t.space.xxl, gap: t.space.md },
    warn: {
      padding: 14,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.goldTint,
      borderWidth: 1,
      borderColor: t.colors.goldBorder,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    grow: { flex: 1 },
    link: {
      marginTop: t.space.xs,
      minHeight: 28,
      justifyContent: 'center',
      alignSelf: 'flex-start',
    },
    underline: { textDecorationLine: 'underline' },
    section: { marginTop: t.space.xs },
    row: {
      minHeight: 60,
      paddingVertical: 10,
      paddingHorizontal: t.space.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    device: { marginTop: t.space.xs },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm },
    empty: { marginTop: t.space.lg },
  }),
);
