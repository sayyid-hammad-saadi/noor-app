import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/feedback';
import { Switch, Text } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

import { EMPTY_YEAR, ramadanLog, toggleLogDay } from '../ramadanStore';

/** Mark today's fast and tonight's Taraweeh. */
export function LogTodaySheet({
  visible,
  onClose,
  year,
  day,
}: {
  visible: boolean;
  onClose: () => void;
  year: number;
  day: number;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { localizeDigits } = useLanguage();
  const log = ramadanLog.use()[year] ?? EMPTY_YEAR;
  const rows = [
    {
      kind: 'fasts' as const,
      label: t('ramadan.log.fasted'),
      caption: t('ramadan.log.fastedCaption'),
    },
    {
      kind: 'taraweeh' as const,
      label: t('ramadan.log.taraweeh'),
      caption: t('ramadan.log.taraweehCaption'),
    },
  ];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t('ramadan.log.title')}
      subtitle={t('ramadan.log.subtitle', { day: localizeDigits(day) })}
    >
      <View style={styles.group}>
        {rows.map((r, i) => (
          <View key={r.kind} style={[styles.row, i > 0 && styles.rowBorder]}>
            <View style={styles.grow}>
              <Text variant="bodyStrong">{r.label}</Text>
              <Text variant="caption">{r.caption}</Text>
            </View>
            <Switch
              value={log[r.kind].includes(day)}
              onValueChange={() => toggleLogDay(year, r.kind, day)}
              accessibilityLabel={r.label}
            />
          </View>
        ))}
      </View>
      <Text variant="caption">{t('ramadan.log.khatamNote')}</Text>
    </BottomSheet>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    group: {
      paddingStart: 14,
      paddingEnd: t.space.xs,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface2,
    },
    row: {
      minHeight: 60,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
      paddingVertical: t.space.xs,
    },
    rowBorder: { borderTopWidth: 1, borderTopColor: t.colors.border },
    grow: { flex: 1 },
  }),
);
