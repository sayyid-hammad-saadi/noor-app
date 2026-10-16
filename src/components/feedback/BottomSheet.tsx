import { type PropsWithChildren, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { Text } from '@/components/ui/Text';
import { makeStyles, useTheme } from '@/theme';

export type BottomSheetProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}>;

const OFFSCREEN = 600;

/** Modal sheet: 28px top radius, grab handle, 48% overlay (.sheet). */
export function BottomSheet({ visible, onClose, title, subtitle, children }: BottomSheetProps) {
  const styles = useStyles();
  const { shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  // Mount as soon as it becomes visible; unmount only after the close animation.
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      progress.value = withTiming(1, { duration: 240 });
    } else {
      progress.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) scheduleOnRN(setMounted, false);
      });
    }
  }, [visible, progress]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * OFFSCREEN }],
  }));

  if (!mounted) return null;

  return (
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.fill}>
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <Pressable
            style={styles.fill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('actions.close')}
          />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 16) + 8, boxShadow: shadows.sheet },
            sheetStyle,
          ]}
        >
          <View style={styles.grab} />
          {title ? (
            <View style={styles.head}>
              <Text variant="title" accessibilityRole="header">
                {title}
              </Text>
              {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
            </View>
          ) : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    fill: { flex: 1 },
    overlay: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      start: 0,
      end: 0,
      backgroundColor: t.colors.overlay,
    },
    sheet: {
      position: 'absolute',
      start: 0,
      end: 0,
      bottom: 0,
      backgroundColor: t.colors.surface,
      borderTopStartRadius: t.radius.sheet,
      borderTopEndRadius: t.radius.sheet,
      borderTopWidth: 1,
      borderColor: t.colors.edge,
      paddingTop: 10,
      paddingHorizontal: t.size.gutter,
      gap: t.space.md,
    },
    grab: {
      alignSelf: 'center',
      width: 36,
      height: 5,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.ctl,
      opacity: 0.6,
    },
    head: { gap: t.space.xxs, marginTop: t.space.xs },
  }),
);
