import { CloudOff, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { IconTile, type IconTileTone } from '@/components/ui/IconTile';
import { Text } from '@/components/ui/Text';
import { makeStyles } from '@/theme';

export type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  body?: string;
  tone?: IconTileTone;
  action?: { label: string; onPress: () => void };
  secondaryAction?: { label: string; onPress: () => void };
};

/** Centred icon, title, body and actions for empty, offline and error states. */
export function EmptyState({
  icon,
  title,
  body,
  tone = 'tint',
  action,
  secondaryAction,
}: EmptyStateProps) {
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <View style={styles.tile}>
        <IconTile icon={icon} tone={tone} size="lg" />
      </View>
      <Text variant="h2" align="center" accessibilityRole="header">
        {title}
      </Text>
      {body ? (
        <Text variant="subtle" align="center">
          {body}
        </Text>
      ) : null}
      {action || secondaryAction ? (
        <View style={styles.actions}>
          {action ? <Button label={action.label} onPress={action.onPress} /> : null}
          {secondaryAction ? (
            <Button
              label={secondaryAction.label}
              onPress={secondaryAction.onPress}
              variant="ghost"
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/** Error with a retry button (34g). */
export function ErrorState({
  onRetry,
  title,
  body,
}: {
  onRetry: () => void;
  title?: string;
  body?: string;
}) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={CloudOff}
      tone="danger"
      title={title ?? t('states.errorTitle')}
      body={body ?? t('states.errorBody')}
      action={{ label: t('actions.retry'), onPress: onRetry }}
    />
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: t.space.xxxl,
      gap: t.space.sm,
    },
    tile: { marginBottom: t.space.sm },
    actions: { alignSelf: 'stretch', gap: t.space.sm, marginTop: t.space.lg },
  }),
);
