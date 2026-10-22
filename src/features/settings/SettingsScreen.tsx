import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { BatteryWarning, Check, Cloud, Flag, Mic, Play, Square, Trash2 } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/feedback';
import { TopBar } from '@/components/layout';
import {
  Button,
  Icon,
  IconButton,
  List,
  SegmentedControl,
  Slider,
  Stepper,
  Switch,
  Text,
  Touchable,
} from '@/components/ui';
import { account } from '@/features/auth/auth';
import { useLocation } from '@/features/location/LocationProvider';
import { setAdhan, useAdhanPrefs } from '@/features/prayer/adhanPrefs';
import { clockLabel } from '@/features/prayer/formatTime';
import { notificationPrefs, REMINDER_OPTIONS } from '@/features/prayer/adhanVoices';
import {
  ADJUST_LIMIT,
  HIGH_LAT_RULES,
  HIJRI_OFFSET_LIMIT,
  type HighLatRule,
  type MadhabKey,
  SEHRI_MARGINS,
  updatePrayerSettings,
} from '@/features/prayer/prayerSettings';
import { methodFor, PRAYERS, type PrayerName } from '@/features/prayer/prayerTimes';
import { playerPrefs } from '@/features/quran/audio/QuranAudioProvider';
import { readingPrefs } from '@/features/quran/data/library';
import { RECITERS } from '@/features/quran/data/reciters';
import { reminderPrefs } from '@/features/ramadan/ramadanStore';
import { type Language, LANGUAGES, languageMeta, useLanguage } from '@/i18n';
import { hijriLocalized } from '@/lib/dateLabels';
import { routes } from '@/lib/routes';
import { makeStyles, useTheme, useThemeContext, type Appearance } from '@/theme';
import { type Accent, ACCENTS, accentSwatch } from '@/theme/palette';

import { useAdhanPreview } from './adhanPreview';
import { OptionSheet } from './components/OptionSheet';
import { SettingRow } from './components/SettingRow';
import { LINKS } from './links';
import { settingsRoutes } from './routes';
import {
  audioUsage,
  cacheBytes,
  clearCache,
  deleteReciterAudio,
  exportData,
  formatBytes,
} from './storage';

const APPEARANCES: readonly Appearance[] = ['light', 'dark', 'system'];
type Sheet = 'highLat' | 'reminder' | 'qari' | null;

/** 31a–d Settings: language, appearance, prayer, notifications, Quran, storage, account, about. */
export default function SettingsScreen() {
  const styles = useStyles();
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const { appearance, setAppearance, accent, setAccent } = useThemeContext();
  const { language, setLanguage, localizeDigits } = useLanguage();
  const { place, settings } = useLocation();
  const adhan = useAdhanPrefs();
  const notif = notificationPrefs.use();
  const ramadan = reminderPrefs.use();
  const reading = readingPrefs.use();
  const player = playerPrefs.use();
  const user = account.use();
  const preview = useAdhanPreview();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [usage, setUsage] = useState(audioUsage);
  const [cache, setCache] = useState(cacheBytes);

  const { method, madhab } = methodFor(place.countryCode);
  const units = {
    mb: (n: string) => t('profile.mb', { n }),
    gb: (n: string) => t('profile.gb', { n }),
  };
  const signed = (n: number) =>
    n === 0 ? localizeDigits(0) : `${n > 0 ? '+' : '−'}${localizeDigits(Math.abs(n))}`;
  const minutes = (n: number) => t('settings.minutes', { n: localizeDigits(n) });
  const reciter = RECITERS.find((r) => r.id === player.reciter) ?? RECITERS[0]!;
  const jumuahTime = new Date();
  jumuahTime.setHours(11, 30, 0, 0);
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const adjust = (p: PrayerName, d: number) =>
    updatePrayerSettings({
      adjust: {
        ...settings.adjust,
        [p]: Math.max(-ADJUST_LIMIT, Math.min(ADJUST_LIMIT, settings.adjust[p] + d)),
      },
    });
  const sehriIndex = SEHRI_MARGINS.indexOf(settings.sehriMargin as (typeof SEHRI_MARGINS)[number]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar title={t('settings.title')} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Language */}
        <Section title={t('settings.sections.language')}>
          <SegmentedControl<Language>
            value={language}
            onChange={(l) => void setLanguage(l)}
            accessibilityLabel={t('profile.language')}
            options={LANGUAGES.map((l) => ({ value: l, label: languageMeta[l].nativeName }))}
          />
          <Text variant="caption" style={styles.note}>
            {t('settings.languageNote')}
          </Text>
        </Section>

        {/* Appearance */}
        <Section title={t('settings.sections.appearance')}>
          <List>
            <SettingRow
              title={t('profile.theme')}
              stacked
              control={
                <SegmentedControl<Appearance>
                  value={appearance}
                  onChange={setAppearance}
                  accessibilityLabel={t('profile.theme')}
                  options={APPEARANCES.map((a) => ({ value: a, label: t(`appearance.${a}`) }))}
                />
              }
            />
            <SettingRow
              title={t('settings.accent')}
              caption={t(`settings.accents.${accent}`)}
              control={<AccentPicker value={accent} onChange={setAccent} />}
            />
          </List>
        </Section>

        {/* Prayer */}
        <Section title={t('settings.sections.prayer')}>
          <List>
            <SettingRow
              title={t('settings.method')}
              caption={t(`prayerTimes.methods.${method}`)}
              onPress={() => router.push(settingsRoutes.method)}
            />
            <SettingRow
              title={t('settings.asr')}
              stacked
              control={
                <SegmentedControl<MadhabKey>
                  value={madhab}
                  onChange={(m) => updatePrayerSettings({ madhab: m })}
                  accessibilityLabel={t('settings.asr')}
                  options={(['hanafi', 'shafi'] as const).map((m) => ({
                    value: m,
                    label: t(`prayerTimes.madhabs.${m}`),
                  }))}
                />
              }
            />
            <View style={styles.adjust}>
              <Text variant="bodyStrong" weight="600">
                {t('settings.adjust')}
              </Text>
              <Text variant="caption">{t('settings.adjustNote')}</Text>
              {PRAYERS.map((p) => (
                <View key={p} style={styles.adjustRow}>
                  <Text variant="body" style={styles.grow}>
                    {t(`prayers.${p}`)}
                  </Text>
                  <Stepper
                    value={signed(settings.adjust[p])}
                    onIncrement={() => adjust(p, 1)}
                    onDecrement={() => adjust(p, -1)}
                    canIncrement={settings.adjust[p] < ADJUST_LIMIT}
                    canDecrement={settings.adjust[p] > -ADJUST_LIMIT}
                    accessibilityLabel={t('settings.adjustLabel', { prayer: t(`prayers.${p}`) })}
                  />
                </View>
              ))}
            </View>
            <SettingRow
              title={t('settings.highLat')}
              caption={t('settings.highLatNote')}
              value={t(`settings.highLatRules.${settings.highLat}`)}
              onPress={() => setSheet('highLat')}
            />
            <SettingRow
              title={t('settings.hijriOffset')}
              caption={t('settings.hijriToday', { date: hijriLocalized(new Date(), t, language) })}
              control={
                <Stepper
                  value={signed(settings.hijriOffset)}
                  onIncrement={() =>
                    updatePrayerSettings({ hijriOffset: settings.hijriOffset + 1 })
                  }
                  onDecrement={() =>
                    updatePrayerSettings({ hijriOffset: settings.hijriOffset - 1 })
                  }
                  canIncrement={settings.hijriOffset < HIJRI_OFFSET_LIMIT}
                  canDecrement={settings.hijriOffset > -HIJRI_OFFSET_LIMIT}
                  accessibilityLabel={t('settings.hijriOffset')}
                />
              }
            />
            <SettingRow
              title={t('settings.sehri')}
              caption={t('settings.sehriNote')}
              control={
                <Stepper
                  value={minutes(settings.sehriMargin)}
                  onIncrement={() =>
                    updatePrayerSettings({ sehriMargin: SEHRI_MARGINS[sehriIndex + 1] ?? 15 })
                  }
                  onDecrement={() =>
                    updatePrayerSettings({ sehriMargin: SEHRI_MARGINS[sehriIndex - 1] ?? 0 })
                  }
                  canIncrement={sehriIndex < SEHRI_MARGINS.length - 1}
                  canDecrement={sehriIndex !== 0}
                  accessibilityLabel={t('settings.sehri')}
                />
              }
            />
          </List>
        </Section>

        {/* Notifications */}
        <Section title={t('settings.sections.notifications')}>
          <List>
            <SettingRow
              title={t('settings.adhanEach')}
              caption={t('settings.adhanEachNote')}
              stacked
              control={
                <View style={styles.pills}>
                  {PRAYERS.map((p) => (
                    <Touchable
                      key={p}
                      accessibilityRole="switch"
                      accessibilityState={{ checked: adhan[p] }}
                      onPress={() => setAdhan(p, !adhan[p])}
                      style={[styles.pill, adhan[p] && styles.pillOn]}
                    >
                      {adhan[p] ? (
                        <Icon icon={Check} size={14} color="onBtn" strokeWidth={3} />
                      ) : null}
                      <Text variant="label" weight="600" color={adhan[p] ? 'onBtn' : 'text2'}>
                        {t(`prayers.${p}`)}
                      </Text>
                    </Touchable>
                  ))}
                </View>
              }
            />
            <View style={styles.soundRow}>
              {preview.canPreview ? (
                <IconButton
                  icon={preview.playing ? Square : Play}
                  size={16}
                  color="onBtn"
                  accessibilityLabel={t(preview.playing ? 'adhan.stop' : 'adhan.previewCurrent')}
                  onPress={preview.toggleCurrent}
                  style={styles.play}
                />
              ) : (
                <View style={[styles.play, styles.playIdle]}>
                  <Icon icon={Mic} size={16} color="primary" />
                </View>
              )}
              <View style={styles.grow}>
                <SettingRow
                  title={t('adhan.title')}
                  caption={preview.summary}
                  onPress={() => router.push(settingsRoutes.adhan)}
                />
              </View>
            </View>
            <SettingRow
              title={t('settings.reminder')}
              value={
                notif.reminderBefore
                  ? t('settings.reminderValue', { n: localizeDigits(notif.reminderBefore) })
                  : t('settings.off')
              }
              onPress={() => setSheet('reminder')}
            />
            <SettingRow
              title={t('settings.jumuah')}
              caption={t('settings.jumuahNote', {
                time: clockLabel(jumuahTime, language, place.timeZone, t),
              })}
              control={
                <Switch
                  value={notif.jumuah}
                  onValueChange={(v) => notificationPrefs.set((s) => ({ ...s, jumuah: v }))}
                  accessibilityLabel={t('settings.jumuah')}
                />
              }
            />
            <SettingRow
              title={t('settings.ramadan')}
              caption={t('settings.ramadanNote')}
              control={
                <Switch
                  value={ramadan.sehri || ramadan.iftar}
                  onValueChange={(v) => reminderPrefs.set({ sehri: v, iftar: v })}
                  accessibilityLabel={t('settings.ramadan')}
                />
              }
            />
            {Platform.OS === 'android' ? (
              <SettingRow
                icon={BatteryWarning}
                tone="gold"
                title={t('settings.notRinging')}
                caption={t('settings.notRingingNote')}
                onPress={() => void Linking.openSettings()}
              />
            ) : null}
          </List>
        </Section>

        {/* Quran */}
        <Section title={t('settings.sections.quran')}>
          <List>
            <SettingRow
              title={t('settings.arabicSize')}
              value={t('quran.settings.fontPx', { size: localizeDigits(reading.arabicSize) })}
              stacked
              control={
                <View style={styles.sizeRow}>
                  <Text script="quran" size={16} maxFontSizeMultiplier={1}>
                    ا
                  </Text>
                  <View style={styles.grow}>
                    <Slider
                      value={reading.arabicSize}
                      min={24}
                      max={40}
                      step={2}
                      onChange={(arabicSize) => readingPrefs.set((p) => ({ ...p, arabicSize }))}
                      accessibilityLabel={t('settings.arabicSize')}
                      accessibilityValueText={t('quran.settings.fontPx', {
                        size: reading.arabicSize,
                      })}
                    />
                  </View>
                  <Text script="quran" size={28} maxFontSizeMultiplier={1}>
                    ا
                  </Text>
                </View>
              }
            />
            <SettingRow
              title={t('settings.translationBn')}
              caption={t('settings.translationBnNote')}
              control={
                <Switch
                  value={reading.bangla}
                  onValueChange={(bangla) => readingPrefs.set((p) => ({ ...p, bangla }))}
                  accessibilityLabel={t('settings.translationBn')}
                />
              }
            />
            <SettingRow
              title={t('settings.translationEn')}
              caption={t('settings.translationEnNote')}
              control={
                <Switch
                  value={reading.english}
                  onValueChange={(english) => readingPrefs.set((p) => ({ ...p, english }))}
                  accessibilityLabel={t('settings.translationEn')}
                />
              }
            />
            <SettingRow
              title={t('settings.qari')}
              caption={reciter.name[language]}
              onPress={() => setSheet('qari')}
            />
          </List>
        </Section>

        {/* Storage */}
        {Platform.OS !== 'web' ? (
          <Section title={t('settings.sections.storage')}>
            <List>
              <SettingRow
                title={t('profile.audio')}
                value={t('settings.used', {
                  size: formatBytes(
                    usage.reduce((n, u) => n + u.bytes, 0),
                    localizeDigits,
                    units,
                  ),
                })}
              />
              {usage.map((u) => (
                <SettingRow
                  key={u.reciter.id}
                  title={u.reciter.name[language]}
                  caption={formatBytes(u.bytes, localizeDigits, units)}
                  control={
                    <IconButton
                      icon={Trash2}
                      size={20}
                      color="dangerText"
                      accessibilityLabel={t('settings.deleteAudio', {
                        name: u.reciter.name[language],
                      })}
                      onPress={() => {
                        deleteReciterAudio(u.reciter);
                        setUsage(audioUsage());
                      }}
                    />
                  }
                />
              ))}
              <SettingRow
                title={t('settings.clearCache')}
                caption={t('settings.clearCacheNote', {
                  size: formatBytes(cache, localizeDigits, units),
                })}
                control={
                  <Button
                    label={t('settings.clear')}
                    variant="secondary"
                    size="sm"
                    disabled={!cache}
                    onPress={() => {
                      clearCache();
                      setCache(cacheBytes());
                      toast.show({ message: t('settings.cleared') });
                    }}
                  />
                }
              />
            </List>
          </Section>
        ) : null}

        {/* Account */}
        <Section title={t('settings.sections.account')}>
          <List>
            {user ? (
              <SettingRow icon={Cloud} title={t('settings.syncOn')} caption={user.email} />
            ) : (
              <SettingRow
                icon={Cloud}
                title={t('profile.syncTitle')}
                caption={t('profile.guestNote')}
                onPress={() => router.push(routes.login)}
              />
            )}
            <SettingRow
              title={t('settings.export')}
              caption={t('settings.exportNote')}
              onPress={() =>
                void exportData().then(
                  (ok) => !ok && toast.show({ message: t('settings.exportUnavailable') }),
                )
              }
            />
          </List>
        </Section>

        {/* About */}
        <Section title={t('settings.sections.about')}>
          <List>
            <SettingRow title={t('settings.version')} value={localizeDigits(version)} />
            <View style={styles.credits}>
              <Text variant="bodyStrong" weight="600">
                {t('settings.credits')}
              </Text>
              {(['quranText', 'translation', 'audio', 'hadith', 'times'] as const).map((k) => (
                <View key={k} style={styles.credit}>
                  <Text variant="caption" weight="600" style={styles.creditKey}>
                    {t(`settings.creditItems.${k}.label`)}
                  </Text>
                  <Text variant="caption" style={styles.grow}>
                    {t(`settings.creditItems.${k}.value`)}
                  </Text>
                </View>
              ))}
            </View>
            {LINKS.privacy ? (
              <SettingRow
                title={t('settings.privacy')}
                onPress={() => void Linking.openURL(LINKS.privacy!)}
              />
            ) : null}
            {LINKS.terms ? (
              <SettingRow
                title={t('settings.terms')}
                onPress={() => void Linking.openURL(LINKS.terms!)}
              />
            ) : null}
            {LINKS.contactEmail ? (
              <SettingRow
                title={t('settings.contact')}
                onPress={() => void Linking.openURL(`mailto:${LINKS.contactEmail}`)}
              />
            ) : null}
            {LINKS.rate ? (
              <SettingRow
                title={t('settings.rate')}
                onPress={() => void Linking.openURL(LINKS.rate!)}
              />
            ) : null}
            {LINKS.contactEmail ? (
              <SettingRow
                icon={Flag}
                tone="gold"
                title={t('settings.report')}
                caption={t('settings.reportNote')}
                onPress={() =>
                  void Linking.openURL(
                    `mailto:${LINKS.contactEmail}?subject=${encodeURIComponent(t('settings.report'))}`,
                  )
                }
              />
            ) : null}
          </List>
        </Section>
      </ScrollView>

      <OptionSheet<HighLatRule>
        visible={sheet === 'highLat'}
        title={t('settings.highLat')}
        note={t('settings.highLatNote')}
        value={settings.highLat}
        options={HIGH_LAT_RULES.map((r) => ({
          value: r,
          label: t(`settings.highLatRules.${r}`),
          caption: t(`settings.highLatCaptions.${r}`),
        }))}
        onSelect={(highLat) => updatePrayerSettings({ highLat })}
        onClose={() => setSheet(null)}
      />
      <OptionSheet<number>
        visible={sheet === 'reminder'}
        title={t('settings.reminder')}
        value={notif.reminderBefore}
        options={REMINDER_OPTIONS.map((n) => ({
          value: n,
          label: n ? t('settings.reminderValue', { n: localizeDigits(n) }) : t('settings.off'),
        }))}
        onSelect={(reminderBefore) => notificationPrefs.set((s) => ({ ...s, reminderBefore }))}
        onClose={() => setSheet(null)}
      />
      <OptionSheet<string>
        visible={sheet === 'qari'}
        title={t('settings.qari')}
        value={reciter.id}
        options={RECITERS.map((r) => ({ value: r.id, label: r.name[language] }))}
        onSelect={(id) => playerPrefs.set((p) => ({ ...p, reciter: id }))}
        onClose={() => setSheet(null)}
      />
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles();
  return (
    <View>
      <Text variant="section" style={styles.section} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

function AccentPicker({ value, onChange }: { value: Accent; onChange: (a: Accent) => void }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={styles.swatches} accessibilityRole="radiogroup">
      {ACCENTS.map((a) => (
        <Touchable
          key={a}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === a }}
          accessibilityLabel={t(`settings.accents.${a}`)}
          onPress={() => onChange(a)}
          hitSlop={4}
          style={[
            styles.swatch,
            { backgroundColor: accentSwatch[a] },
            value === a && { borderColor: colors.text },
          ]}
        >
          {value === a ? <Icon icon={Check} size={16} color="onBtn" strokeWidth={3} /> : null}
        </Touchable>
      ))}
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    body: { paddingHorizontal: t.size.gutter, paddingBottom: t.space.xxxl },
    section: { marginTop: t.space.lg, marginBottom: t.space.sm },
    note: { marginTop: t.space.sm },
    grow: { flex: 1 },
    adjust: { paddingVertical: t.space.md, paddingHorizontal: t.space.lg, gap: 2 },
    adjustRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: t.space.md },
    pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    pill: {
      minHeight: 36,
      paddingHorizontal: t.space.md,
      borderRadius: t.radius.pill,
      borderWidth: 1,
      borderColor: t.colors.ctl,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    pillOn: { backgroundColor: t.colors.btn, borderColor: t.colors.btn },
    soundRow: { flexDirection: 'row', alignItems: 'center', paddingStart: t.space.lg },
    play: {
      width: 36,
      height: 36,
      minWidth: 36,
      minHeight: 36,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.btn,
      alignItems: 'center',
      justifyContent: 'center',
    },
    playIdle: { backgroundColor: t.colors.tint },
    sizeRow: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
    swatches: { flexDirection: 'row', gap: t.space.sm },
    swatch: {
      width: 36,
      height: 36,
      borderRadius: t.radius.pill,
      borderWidth: 2,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    credits: { paddingVertical: t.space.md, paddingHorizontal: t.space.lg, gap: 6 },
    credit: { flexDirection: 'row', gap: t.space.md },
    creditKey: { width: 96 },
  }),
);
