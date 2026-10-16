import type { PropsWithChildren, ReactNode } from 'react';
import {
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { makeStyles, type Palette, useTheme } from '@/theme';

export type ScreenProps = PropsWithChildren<{
  /** Wrap content in a ScrollView. */
  scroll?: boolean;
  /** Apply the 20px horizontal gutter. */
  padded?: boolean;
  /** Safe-area edges to inset. Tab screens usually omit 'bottom' (the tab bar handles it). */
  edges?: Edge[];
  background?: keyof Palette;
  /** Rendered above the scroll area, outside the gutter (top bar, header). */
  header?: ReactNode;
  /** Rendered below the scroll area (sticky CTA, mini player). */
  footer?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollProps?: Omit<ScrollViewProps, 'contentContainerStyle'>;
}>;

export function Screen({
  scroll,
  padded = true,
  edges = ['top', 'bottom'],
  background = 'bg',
  header,
  footer,
  contentContainerStyle,
  scrollProps,
  children,
}: ScreenProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const pad = padded ? styles.padded : null;
  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: colors[background] }]}>
      {header}
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[pad, styles.scrollContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...scrollProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, pad, contentContainerStyle]}>{children}</View>
      )}
      {footer}
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1 },
    flex: { flex: 1 },
    padded: { paddingHorizontal: t.size.gutter },
    scrollContent: { paddingBottom: t.space.xxl },
  }),
);
