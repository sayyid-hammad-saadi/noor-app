import { Check, type LucideIcon } from 'lucide-react-native';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { Touchable } from '@/components/ui/Touchable';
import { makeStyles, useTheme } from '@/theme';

export type ToastOptions = {
  message: string;
  icon?: LucideIcon;
  action?: { label: string; onPress: () => void };
  /** Milliseconds; defaults to 3500 (5000 with an action). */
  duration?: number;
};

export type ToastProps = Omit<ToastOptions, 'duration'> & { onDismiss?: () => void };

/** Dark pill with an optional underlined action (.toast). */
export function Toast({ message, icon = Check, action, onDismiss }: ToastProps) {
  const styles = useStyles();
  const { shadows } = useTheme();
  return (
    <View
      style={[styles.root, { boxShadow: shadows.toast }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Icon icon={icon} size={18} color="onToast" />
      <Text variant="body" weight="600" color="onToast" style={styles.msg}>
        {message}
      </Text>
      {action ? (
        <Touchable
          accessibilityRole="button"
          onPress={() => {
            action.onPress();
            onDismiss?.();
          }}
          style={styles.action}
        >
          <Text variant="body" weight="700" color="onToast" style={styles.underline}>
            {action.label}
          </Text>
        </Touchable>
      ) : null}
    </View>
  );
}

type ToastContextValue = { show: (options: ToastOptions) => void; hide: () => void };
const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Hosts one toast at a time above the tab bar. Screens without a tab bar can pass a
 * smaller offset through `bottomOffset`.
 */
export function ToastProvider({
  children,
  bottomOffset = 96,
}: PropsWithChildren<{ bottomOffset?: number }>) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = useCallback(
    (options: ToastOptions) => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ ...options, id: Date.now() });
      timer.current = setTimeout(hide, options.duration ?? (options.action ? 5000 : 3500));
    },
    [hide],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const value = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          key={toast.id}
          entering={FadeInDown.duration(200)}
          exiting={FadeOutDown.duration(160)}
          pointerEvents="box-none"
          style={[styles.host, { bottom: bottomOffset + insets.bottom }]}
        >
          <Toast message={toast.message} icon={toast.icon} action={toast.action} onDismiss={hide} />
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      minHeight: 48,
      paddingStart: t.space.lg,
      paddingEnd: t.space.sm,
      paddingVertical: t.space.xs,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.toast,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    msg: { flex: 1 },
    action: { minHeight: t.size.touch, paddingHorizontal: 10, justifyContent: 'center' },
    underline: { textDecorationLine: 'underline' },
    host: { position: 'absolute', start: t.size.gutter, end: t.size.gutter },
  }),
);
