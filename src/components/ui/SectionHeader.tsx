import { StyleSheet, View } from 'react-native';

import { makeStyles } from '@/theme';

import { Text } from './Text';
import { Touchable } from './Touchable';

export type SectionHeaderProps = {
  title: string;
  action?: { label: string; onPress: () => void };
  /** 'list' is the small grey label above grouped lists (.sec); 'content' is a bold 17px title. */
  kind?: 'list' | 'content';
};

export function SectionHeader({ title, action, kind = 'list' }: SectionHeaderProps) {
  const styles = useStyles();
  return (
    <View style={[styles.root, kind === 'list' ? styles.list : styles.content]}>
      <Text
        variant={kind === 'list' ? 'section' : 'title'}
        accessibilityRole="header"
        style={styles.title}
      >
        {title}
      </Text>
      {action ? (
        <Touchable accessibilityRole="button" onPress={action.onPress} hitSlop={12}>
          <Text variant="label" weight="600" color="link">
            {action.label}
          </Text>
        </Touchable>
      ) : null}
    </View>
  );
}

/** Small explanatory text under a list (.note). */
export function Note({ children }: { children: string }) {
  const styles = useStyles();
  return (
    <Text variant="caption" weight="400" style={styles.note}>
      {children}
    </Text>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.space.md,
    },
    list: { marginTop: t.space.xl, marginBottom: t.space.sm, marginHorizontal: t.space.xs },
    content: { marginTop: t.space.xxl, marginBottom: t.space.md },
    title: { flexShrink: 1 },
    note: { marginTop: t.space.sm, marginHorizontal: t.space.xs },
  }),
);
