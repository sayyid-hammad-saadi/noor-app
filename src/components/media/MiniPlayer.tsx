import { Pause, Play } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { Touchable } from '@/components/ui/Touchable';
import { makeStyles, useTheme } from '@/theme';

/** Round 44px play / pause button (.play). */
export function PlayButton({
  playing,
  onPress,
  size = 44,
}: {
  playing: boolean;
  onPress: () => void;
  size?: number;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={playing ? t('actions.pause') : t('actions.play')}
      onPress={onPress}
      style={[styles.play, { width: size, height: size }]}
    >
      <Icon icon={playing ? Pause : Play} size={size * 0.4} color="onBtn" filled />
    </Touchable>
  );
}

export type MiniPlayerProps = {
  title: string;
  subtitle: string;
  initials: string;
  /** 0–1 */
  progress: number;
  playing: boolean;
  onTogglePlay: () => void;
  /** Opens the full player. */
  onPress?: () => void;
};

/** Persistent audio strip: progress line, reciter, track and play button (.mini). */
export function MiniPlayer({
  title,
  subtitle,
  initials,
  progress,
  playing,
  onTogglePlay,
  onPress,
}: MiniPlayerProps) {
  const styles = useStyles();
  const { shadows } = useTheme();
  const pct = `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` as const;
  return (
    <View style={[styles.root, { boxShadow: shadows.player }]}>
      <View
        style={styles.bar}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      >
        <View style={[styles.fill, { width: pct }]} />
      </View>
      <View style={styles.row}>
        <Touchable
          accessibilityRole="button"
          accessibilityLabel={`${title}, ${subtitle}`}
          onPress={onPress}
          disabled={!onPress}
          style={styles.info}
        >
          <Avatar initials={initials} />
          <View style={styles.text}>
            <Text variant="bodyStrong" numberOfLines={1}>
              {title}
            </Text>
            <Text variant="caption" numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        </Touchable>
        <PlayButton playing={playing} onPress={onTogglePlay} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { backgroundColor: t.colors.surface, borderTopWidth: 1, borderTopColor: t.colors.border },
    bar: { height: 3, backgroundColor: t.colors.surface2, flexDirection: 'row' },
    fill: { backgroundColor: t.colors.primary },
    row: {
      minHeight: 68,
      paddingStart: t.space.lg,
      paddingEnd: t.space.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
    },
    info: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: t.space.md },
    text: { flex: 1, minWidth: 0 },
    play: {
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.btn,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);
