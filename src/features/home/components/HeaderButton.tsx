import { Bell } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon, Touchable } from '@/components/ui';
import { makeStyles } from '@/theme';

/** Translucent round bell button on the gradient header. */
export function NotificationsButton({
  onPress,
  accessibilityLabel,
  unread = false,
}: {
  onPress: () => void;
  accessibilityLabel?: string;
  /** Shows a dot for unread notifications. */
  unread?: boolean;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? t('home.notifications')}
      accessibilityHint={unread ? t('notifications.unread') : undefined}
      onPress={onPress}
      style={styles.bell}
    >
      <Icon icon={Bell} size={22} color="onHeader" />
      {unread ? <View style={styles.dot} /> : null}
    </Touchable>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    bell: {
      width: t.size.touch,
      height: t.size.touch,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.onHeaderChip,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dot: {
      position: 'absolute',
      top: 10,
      end: 11,
      width: 9,
      height: 9,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.headerGold,
      borderWidth: 1.5,
      borderColor: t.colors.onHeader,
    },
  }),
);
