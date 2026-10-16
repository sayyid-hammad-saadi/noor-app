import * as Haptics from 'expo-haptics';
import {
  Check,
  Compass,
  Info,
  MapPin,
  RotateCcw,
  RotateCw,
  Smartphone,
  TriangleAlert,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

import { BottomSheet, EmptyState } from '@/components/feedback';
import { TopBar } from '@/components/layout';
import { Button, Icon, IconButton, IconTile, Switch, Text } from '@/components/ui';
import { useLocation } from '@/features/location/LocationProvider';
import { distanceToKaaba, qiblaBearing } from '@/features/prayer/prayerTimes';
import { useLanguage } from '@/i18n';
import { getItem, setItem, StorageKeys } from '@/lib/storage';
import { makeStyles, useTheme } from '@/theme';

import { QiblaDial } from './QiblaDial';
import { angleDelta, useHeading } from './useHeading';

/** Within this many degrees counts as facing the Qibla; leaving needs a wider gap. */
const ALIGN_IN = 3;
const ALIGN_OUT = 5;

/** 08a/08b Qibla compass. */
export default function QiblaScreen() {
  const styles = useStyles();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { formatNumber, localizeDigits } = useLanguage();
  const { place } = useLocation();
  const { state, requestPermission } = useHeading();
  const [infoOpen, setInfoOpen] = useState(false);
  const [vibrate, setVibrate] = useVibratePref();
  const [aligned, setAligned] = useState(false);

  const qibla = qiblaBearing(place.latitude, place.longitude);
  const km = Math.round(distanceToKaaba(place.latitude, place.longitude));
  const qiblaDeg = localizeDigits(Math.round(qibla));
  const delta = state.status === 'ok' ? angleDelta(qibla, state.heading) : null;

  // Hysteresis so jitter at the edge doesn't flicker or buzz repeatedly.
  if (delta !== null) {
    const abs = Math.abs(delta);
    if (!aligned && abs <= ALIGN_IN) setAligned(true);
    else if (aligned && abs > ALIGN_OUT) setAligned(false);
  }

  useEffect(() => {
    if (aligned && vibrate) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => undefined,
      );
    }
    // Only when alignment is gained, not when the setting changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aligned]);

  const dialSize = Math.min(300, width - 80);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <TopBar
        title={t('qibla.title')}
        right={
          <IconButton
            icon={Info}
            size={22}
            accessibilityLabel={t('qibla.howItWorks')}
            onPress={() => setInfoOpen(true)}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {state.status === 'ok' && state.accuracy <= 1 && !aligned ? <CalibrateBanner /> : null}

        <View style={styles.place}>
          <Icon icon={MapPin} size={16} color="primary" />
          <Text variant="label" weight="500" style={styles.shrink}>
            {t('qibla.distance', { place: place.shortLabel ?? '', km: formatNumber(km) })}
          </Text>
        </View>

        {state.status === 'ok' ? (
          <>
            {aligned || state.accuracy >= 3 ? (
              <AccuracyChip level="high" label={t('qibla.accuracyHigh')} />
            ) : null}
            <View
              style={[styles.dialWrap, { marginTop: aligned || state.accuracy >= 3 ? 48 : 40 }]}
            >
              <QiblaDial
                size={dialSize}
                heading={state.heading}
                qibla={qibla}
                aligned={aligned}
                accessibilityLabel={t('qibla.dialLabel', {
                  heading: localizeDigits(Math.round(state.heading)),
                  qibla: qiblaDeg,
                })}
              />
            </View>
            <Readout heading={state.heading} delta={delta ?? 0} aligned={aligned} />
            {!aligned && state.accuracy < 3 ? (
              <View style={styles.center}>
                <AccuracyChip
                  level={state.accuracy <= 1 ? 'low' : 'medium'}
                  label={t(state.accuracy <= 1 ? 'qibla.accuracyLow' : 'qibla.accuracyMedium', {
                    deg: qiblaDeg,
                  })}
                />
              </View>
            ) : null}
            {!state.trueNorth ? (
              <Text variant="caption" align="center" style={styles.note}>
                {t('qibla.needsLocationBody')}
              </Text>
            ) : null}
          </>
        ) : state.status === 'needsPermission' ? (
          <View style={styles.state}>
            <EmptyState
              icon={Compass}
              title={t('qibla.needsLocation')}
              body={t('qibla.needsLocationBody')}
              action={{ label: t('qibla.allow'), onPress: () => void requestPermission() }}
            />
          </View>
        ) : state.status === 'unavailable' ? (
          <View style={styles.state}>
            <EmptyState
              icon={Compass}
              tone="neutral"
              title={t('qibla.noSensor')}
              body={t('qibla.noSensorBody', { deg: qiblaDeg })}
            />
          </View>
        ) : (
          <View style={[styles.dialWrap, { marginTop: 40, height: dialSize }]} />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <VibrateCard value={vibrate} onChange={setVibrate} />
      </View>

      <BottomSheet
        visible={infoOpen}
        onClose={() => setInfoOpen(false)}
        title={t('qibla.infoTitle')}
      >
        {(['info1', 'info2', 'info3'] as const).map((k) => (
          <Text key={k} variant="subtle">
            {t(`qibla.${k}`)}
          </Text>
        ))}
        <Button label={t('actions.done')} size="sm" onPress={() => setInfoOpen(false)} />
      </BottomSheet>
    </SafeAreaView>
  );
}

function Readout({
  heading,
  delta,
  aligned,
}: {
  heading: number;
  delta: number;
  aligned: boolean;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { localizeDigits } = useLanguage();
  const points = t('qibla.points', { returnObjects: true }) as string[];
  const point = points[Math.round(heading / (360 / points.length)) % points.length] ?? '';
  const turn = localizeDigits(Math.round(Math.abs(delta)));
  return (
    <View style={styles.readout}>
      <View style={styles.headingRow}>
        <Text size={40} weight="700" tabular style={styles.headingNum}>
          {`${localizeDigits(Math.round(heading))}°`}
        </Text>
        <Text size={17} weight="600" color="text2">
          {point}
        </Text>
      </View>
      {aligned ? (
        <View style={styles.facing} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <Icon icon={Check} size={18} color="okFg" strokeWidth={2.25} />
          <Text variant="bodyStrong" weight="700" color="okFg">
            {t('qibla.facing')}
          </Text>
        </View>
      ) : (
        <View style={styles.turn}>
          <Text variant="bodyStrong" color="link" align="center" style={styles.shrink}>
            {t(delta > 0 ? 'qibla.turnRight' : 'qibla.turnLeft', { deg: turn })}
          </Text>
          <Icon icon={delta > 0 ? RotateCw : RotateCcw} size={18} color="link" />
        </View>
      )}
    </View>
  );
}

function AccuracyChip({ level, label }: { level: 'low' | 'medium' | 'high'; label: string }) {
  const styles = useStyles();
  const high = level === 'high';
  return (
    <View style={[styles.chip, high ? styles.chipOk : styles.chipWarn]}>
      <View style={[styles.dot, high ? styles.dotOk : styles.dotWarn]} />
      <Text variant="caption" weight="700" color={high ? 'okFg' : 'goldText'}>
        {label}
      </Text>
    </View>
  );
}

function CalibrateBanner() {
  const styles = useStyles();
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Icon icon={TriangleAlert} size={22} color="goldText" style={styles.bannerIcon} />
      <View style={styles.bannerText}>
        <Text variant="bodyStrong" weight="700" color="goldText">
          {t('qibla.calibrateTitle')}
        </Text>
        <Text variant="label" weight="400" color="text">
          {t('qibla.calibrateBody')}
        </Text>
      </View>
      <Svg width={56} height={36} viewBox="0 0 56 36" accessibilityElementsHidden>
        <Path
          d="M28 18c-6-8-12-12-18-12a12 12 0 0 0 0 24c6 0 12-4 18-12s12-12 18-12a12 12 0 0 1 0 24c-6 0-12-4-18-12z"
          fill="none"
          stroke={colors.goldText}
          strokeWidth={2}
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
        <Rect x={40} y={1} width={9} height={15} rx={2.5} fill={colors.goldText} />
      </Svg>
    </View>
  );
}

function VibrateCard({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  return (
    <View style={[styles.vibrate, { boxShadow: shadows.card }]}>
      <IconTile icon={Smartphone} />
      <View style={styles.bannerText}>
        <Text variant="bodyStrong">{t('qibla.vibrate')}</Text>
        <Text variant="caption">{t('qibla.vibrateCaption')}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} accessibilityLabel={t('qibla.vibrate')} />
    </View>
  );
}

function useVibratePref(): [boolean, (v: boolean) => void] {
  const [value, setValue] = useState(true);
  useEffect(() => {
    getItem(StorageKeys.qiblaVibrate).then((raw) => {
      if (raw !== null) setValue(raw === '1');
    });
  }, []);
  return [
    value,
    (v) => {
      setValue(v);
      void setItem(StorageKeys.qiblaVibrate, v ? '1' : '0');
    },
  ];
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    content: {
      paddingHorizontal: t.size.gutter,
      paddingBottom: t.space.xxl,
      alignItems: 'stretch',
    },
    shrink: { flexShrink: 1 },
    center: { alignItems: 'center' },
    banner: {
      marginTop: t.space.sm,
      padding: 14,
      paddingStart: t.space.lg,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.goldTint,
      borderWidth: 1,
      borderColor: t.colors.goldBorder,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    bannerIcon: { alignSelf: 'flex-start', marginTop: 1 },
    bannerText: { flex: 1, gap: t.space.xxs },
    place: {
      marginTop: t.space.xl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    chip: {
      marginTop: t.space.md,
      alignSelf: 'center',
      minHeight: 28,
      paddingHorizontal: t.space.md,
      borderRadius: t.radius.pill,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    chipOk: { backgroundColor: t.colors.okBg },
    chipWarn: { backgroundColor: t.colors.goldTint },
    dot: { width: 8, height: 8, borderRadius: t.radius.pill },
    dotOk: { backgroundColor: t.colors.success },
    dotWarn: { backgroundColor: t.colors.gold },
    dialWrap: { alignItems: 'center' },
    readout: { marginTop: 28, alignItems: 'center', gap: 6 },
    headingRow: { flexDirection: 'row', alignItems: 'baseline', gap: t.space.sm },
    headingNum: { lineHeight: 46, letterSpacing: -0.8 },
    turn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: t.space.lg },
    facing: {
      marginTop: t.space.xs,
      minHeight: 32,
      paddingHorizontal: 14,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.okBg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    note: { marginTop: t.space.md, paddingHorizontal: t.space.lg },
    state: { marginTop: t.space.xxxl, minHeight: 320 },
    footer: { paddingHorizontal: t.size.gutter, paddingBottom: t.space.sm, paddingTop: t.space.sm },
    vibrate: {
      paddingVertical: t.space.md,
      paddingStart: t.space.lg,
      paddingEnd: t.space.md,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
  }),
);
