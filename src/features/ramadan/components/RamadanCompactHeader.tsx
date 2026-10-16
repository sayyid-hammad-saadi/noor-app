import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { GradientHeader } from '@/components/layout';
import { Text } from '@/components/ui';
import { NotificationsButton } from '@/features/home/components/HeaderButton';
import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

import type { FastPhase } from '../fastTimes';
import { ashraOf, type RamadanInfo } from '../ramadanCalendar';
import { Lanterns } from './Lanterns';
import { LiveCountdown } from './LiveCountdown';

/** 13b collapsed header: day and ashra, live countdown, reminders. */
export function RamadanCompactHeader({
  info,
  fast,
  onRemindersPress,
}: {
  info: RamadanInfo;
  fast: FastPhase;
  onRemindersPress: () => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { localizeDigits } = useLanguage();
  const label = fast.target.kind === 'iftar' ? t('ramadan.iftarIn') : t('ramadan.sehriEndsIn');

  return (
    <GradientHeader tone="ramadan" insetTop style={styles.root}>
      <View style={styles.art} pointerEvents="none">
        <Lanterns single opacity={0.55} />
      </View>
      <View style={styles.row}>
        <View style={styles.text}>
          <Text variant="caption" weight="700" color="headerGold" numberOfLines={1}>
            {info.day !== null
              ? t('ramadan.compactEyebrow', {
                  day: localizeDigits(info.day),
                  ashra: t(`ramadan.ashra.${ashraOf(info.day)}.name`),
                }).toUpperCase()
              : t('ramadan.upcoming', { year: localizeDigits(info.year) }).toUpperCase()}
          </Text>
          {info.day !== null ? (
            <LiveCountdown
              target={fast.target.time}
              label={label}
              prefix={label}
              size={20}
              weight="700"
              color="onHeader"
              numberOfLines={1}
            />
          ) : (
            <Text size={20} weight="700" color="onHeader" numberOfLines={1}>
              {`${t('ramadan.beginsIn')} ${
                info.daysUntil === 1
                  ? t('ramadan.startsTomorrow')
                  : t('ramadan.days', { n: localizeDigits(info.daysUntil) })
              }`}
            </Text>
          )}
        </View>
        <NotificationsButton
          onPress={onRemindersPress}
          accessibilityLabel={t('ramadan.remindersButton')}
        />
      </View>
    </GradientHeader>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { paddingBottom: t.space.lg },
    art: { position: 'absolute', end: 70, bottom: 0 },
    row: {
      minHeight: 52,
      marginTop: t.space.xxs,
      paddingHorizontal: t.size.gutter,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    text: { flex: 1, minWidth: 0 },
  }),
);
