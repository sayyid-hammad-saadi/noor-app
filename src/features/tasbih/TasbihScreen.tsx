import * as Haptics from 'expo-haptics';
import {
  Check,
  ChevronDown,
  CircleCheck,
  Plus,
  RotateCcw,
  Smartphone,
  SmartphoneNfc,
  Trash2,
} from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { BottomSheet, useToast } from '@/components/feedback';
import { TopBar } from '@/components/layout';
import { Button, Chip, Icon, IconButton, Text, TextField, Touchable } from '@/components/ui';
import { formatNumber, useLanguage } from '@/i18n';
import { dayKey, dayMonthLabel } from '@/lib/dateLabels';
import { makeStyles, useTheme } from '@/theme';

import {
  addCustom,
  countOne,
  PRESET_ARABIC,
  PRESETS,
  type PresetId,
  removeCustom,
  resetCount,
  stats,
  tasbih,
  TARGETS,
} from './tasbihStore';

const RING = 260;
const STROKE = 12;
const R = (RING - STROKE) / 2 - 4;
const C = 2 * Math.PI * R;

const haptic = (fn: () => Promise<void>) => {
  if (Platform.OS !== 'web') void fn().catch(() => undefined);
};

/** 24 Tasbih: tap counter with target, haptics, custom dhikr and daily history. */
export default function TasbihScreen() {
  const styles = useStyles();
  const toast = useToast();
  const { t } = useTranslation();
  const { colors, shadows } = useTheme();
  const { language, localizeDigits } = useLanguage();
  const state = tasbih.use();
  const [targetOpen, setTargetOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const count = state.counts[state.dhikr] ?? 0;
  const progress = Math.min(1, count / state.target);
  const reached = count >= state.target;
  const preset = (PRESETS as readonly string[]).includes(state.dhikr)
    ? (state.dhikr as PresetId)
    : null;
  const custom = state.custom.find((c) => c.id === state.dhikr);
  const label = preset ? t(`tasbih.presets.${preset}.label`) : (custom?.label ?? '');
  const meaning = preset ? t(`tasbih.presets.${preset}.meaning`) : (custom?.meaning ?? '');
  const { today, week, streak } = stats(state.daily);

  const tap = () => {
    const n = countOne();
    if (n === state.target) {
      if (state.vibrate)
        haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
      toast.show({
        message: t('tasbih.reachedToast', { target: localizeDigits(state.target) }),
        icon: CircleCheck,
      });
    } else if (state.vibrate) {
      haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        title={t('tasbih.title')}
        right={
          <IconButton
            icon={state.vibrate ? SmartphoneNfc : Smartphone}
            size={22}
            color={state.vibrate ? 'link' : 'text2'}
            accessibilityLabel={state.vibrate ? t('tasbih.vibrationOn') : t('tasbih.vibrationOff')}
            onPress={() => tasbih.set((s) => ({ ...s, vibrate: !s.vibrate }))}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsWrap}
          contentContainerStyle={styles.chips}
          accessibilityRole="radiogroup"
          accessibilityLabel={t('tasbih.dhikr')}
        >
          {PRESETS.map((id) => (
            <Chip
              key={id}
              label={t(`tasbih.presets.${id}.label`)}
              selected={state.dhikr === id}
              onPress={() => tasbih.set((s) => ({ ...s, dhikr: id }))}
            />
          ))}
          {state.custom.map((c) => (
            <Chip
              key={c.id}
              label={c.label}
              selected={state.dhikr === c.id}
              onPress={() => tasbih.set((s) => ({ ...s, dhikr: c.id }))}
            />
          ))}
          <Chip label={t('tasbih.custom')} icon={Plus} onPress={() => setCustomOpen(true)} />
        </ScrollView>

        <View style={styles.dhikr}>
          {preset ? (
            <Text script="quran" size={32} align="center">
              {PRESET_ARABIC[preset]}
            </Text>
          ) : null}
          <Text variant="bodyStrong" weight="600" color="link" align="center">
            {label}
          </Text>
          {meaning ? (
            <Text variant="caption" align="center">
              {meaning}
            </Text>
          ) : null}
          {custom ? (
            <IconButton
              icon={Trash2}
              size={18}
              color="text2"
              accessibilityLabel={t('tasbih.remove', { name: custom.label })}
              onPress={() => removeCustom(custom.id)}
            />
          ) : null}
        </View>

        <Touchable
          accessibilityRole="button"
          accessibilityLabel={t('tasbih.countA11y', {
            n: localizeDigits(count),
            target: localizeDigits(state.target),
          })}
          onPress={tap}
          pressedOpacity={0.92}
          style={styles.ring}
        >
          <Svg width={RING} height={RING} style={StyleSheet.absoluteFill}>
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={R}
              stroke={colors.surface2}
              strokeWidth={STROKE}
              fill="none"
            />
            {progress > 0 ? (
              <Circle
                cx={RING / 2}
                cy={RING / 2}
                r={R}
                stroke={reached ? colors.gold : colors.primary}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${progress * C} ${C}`}
                transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
                fill="none"
              />
            ) : null}
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={R - 20}
              fill={colors.surface}
              stroke={colors.border}
              strokeWidth={1}
            />
          </Svg>
          <Text
            size={64}
            weight="700"
            tabular
            align="center"
            maxFontSizeMultiplier={1}
            style={styles.count}
          >
            {localizeDigits(count)}
          </Text>
          <Text
            variant="body"
            weight="600"
            color="text2"
            align="center"
            maxFontSizeMultiplier={1.2}
          >
            {t('tasbih.of', { target: localizeDigits(state.target) })}
          </Text>
          <Text
            variant="caption"
            weight="600"
            color={reached ? 'goldText' : 'link'}
            style={styles.tapHint}
          >
            {reached ? t('tasbih.reached') : t('tasbih.tap')}
          </Text>
        </Touchable>

        <View style={styles.controls}>
          <Button
            label={t('tasbih.reset')}
            icon={RotateCcw}
            variant="secondary"
            size="sm"
            onPress={resetCount}
          />
          <Button
            label={t('tasbih.target', { n: localizeDigits(state.target) })}
            icon={ChevronDown}
            iconPosition="end"
            variant="secondary"
            size="sm"
            onPress={() => setTargetOpen(true)}
          />
        </View>

        <View style={[styles.card, { boxShadow: shadows.card }]}>
          <View style={styles.cardHead}>
            <Text variant="title" accessibilityRole="header">
              {t('tasbih.history')}
            </Text>
            <Touchable
              accessibilityRole="button"
              onPress={() => setHistoryOpen(true)}
              style={styles.seeAll}
            >
              <Text variant="caption" weight="600" color="link">
                {t('tasbih.seeAll')}
              </Text>
            </Touchable>
          </View>
          <View style={styles.stats}>
            {[
              [formatNumber(today, language), t('tasbih.today')],
              [formatNumber(week, language), t('tasbih.week')],
              [t('tasbih.streakDays', { n: localizeDigits(streak) }), t('tasbih.streak')],
            ].map(([value, name], i) => (
              <View key={name} style={[styles.stat, i > 0 && styles.statRule]} accessible>
                <Text size={20} weight="700" tabular numberOfLines={1} adjustsFontSizeToFit>
                  {value}
                </Text>
                <Text variant="caption">{name}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomSheet
        visible={targetOpen}
        onClose={() => setTargetOpen(false)}
        title={t('tasbih.targetTitle')}
      >
        {TARGETS.map((n) => (
          <Touchable
            key={n}
            accessibilityRole="radio"
            accessibilityState={{ checked: state.target === n }}
            onPress={() => {
              tasbih.set((s) => ({ ...s, target: n }));
              setTargetOpen(false);
            }}
            style={styles.option}
          >
            <Text variant="body" weight={state.target === n ? '700' : '400'} style={styles.grow}>
              {formatNumber(n, language)}
            </Text>
            {state.target === n ? (
              <Icon icon={Check} size={18} color="link" strokeWidth={2.5} />
            ) : null}
          </Touchable>
        ))}
      </BottomSheet>

      <CustomSheet visible={customOpen} onClose={() => setCustomOpen(false)} />

      <BottomSheet
        visible={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title={t('tasbih.historyTitle')}
      >
        <HistoryList daily={state.daily} />
      </BottomSheet>
    </SafeAreaView>
  );
}

function CustomSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const [label, setLabel] = useState('');
  const [meaning, setMeaning] = useState('');
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('tasbih.customTitle')}>
      <View style={styles.form}>
        <TextField
          label={t('tasbih.customLabel')}
          value={label}
          onChangeText={setLabel}
          placeholder={t('tasbih.customPlaceholder')}
          maxLength={40}
        />
        <TextField
          label={t('tasbih.customMeaning')}
          value={meaning}
          onChangeText={setMeaning}
          maxLength={80}
        />
        <Button
          label={t('tasbih.add')}
          disabled={!label.trim()}
          onPress={() => {
            addCustom(label.trim(), meaning.trim());
            setLabel('');
            setMeaning('');
            onClose();
          }}
        />
      </View>
    </BottomSheet>
  );
}

function HistoryList({ daily }: { daily: Record<string, number> }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return { date: d, count: daily[dayKey(d)] ?? 0 };
  });
  const max = Math.max(1, ...days.map((d) => d.count));
  if (!days.some((d) => d.count)) {
    return (
      <Text variant="subtle" style={styles.empty}>
        {t('tasbih.noHistory')}
      </Text>
    );
  }
  return (
    <View style={styles.history}>
      {days.map((d) => (
        <View key={d.date.toDateString()} style={styles.historyRow} accessible>
          <Text variant="label" weight="500" style={styles.historyDate}>
            {dayMonthLabel(d.date, t, language)}
          </Text>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${(d.count / max) * 100}%` }]} />
          </View>
          <Text variant="label" weight="700" color="text" tabular style={styles.historyCount}>
            {formatNumber(d.count, language)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    body: { paddingHorizontal: t.size.gutter, paddingBottom: t.space.xxl },
    chipsWrap: { marginTop: t.space.sm, marginHorizontal: -t.size.gutter },
    chips: { paddingHorizontal: t.size.gutter, gap: t.space.sm },
    dhikr: {
      marginTop: 18,
      alignItems: 'center',
      gap: 2,
      minHeight: 100,
      justifyContent: 'center',
    },
    ring: {
      marginTop: 18,
      alignSelf: 'center',
      width: RING,
      height: RING,
      borderRadius: t.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    count: { lineHeight: 70, letterSpacing: -1 },
    tapHint: { marginTop: t.space.sm },
    controls: { marginTop: t.space.lg, flexDirection: 'row', justifyContent: 'center', gap: 10 },
    card: {
      marginTop: 18,
      paddingVertical: t.space.md,
      paddingHorizontal: t.space.sm,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
    cardHead: {
      paddingHorizontal: t.space.sm,
      paddingBottom: t.space.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    seeAll: { minHeight: 32, justifyContent: 'center' },
    stats: { flexDirection: 'row' },
    stat: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
      paddingVertical: t.space.xs,
      paddingHorizontal: t.space.xs,
    },
    statRule: { borderStartWidth: 1, borderStartColor: t.colors.border },
    option: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    grow: { flex: 1 },
    form: { gap: t.space.md, paddingBottom: t.space.sm },
    empty: { paddingVertical: t.space.lg },
    history: { gap: t.space.sm, paddingBottom: t.space.sm },
    historyRow: { minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: t.space.md },
    historyDate: { width: 104 },
    bar: {
      flex: 1,
      height: 8,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.surface2,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    barFill: { borderRadius: t.radius.pill, backgroundColor: t.colors.primary },
    historyCount: { minWidth: 48, textAlign: 'right' },
  }),
);
