import { Bell } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Icon, Touchable } from '@/components/ui';
import { makeStyles } from '@/theme';

/** Translucent round bell button on the gradient header. */
export function NotificationsButton({
  onPress,
  accessibilityLabel,
}: {
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? t('home.notifications')}
      onPress={onPress}
      style={styles.bell}
    >
      <Icon icon={Bell} size={22} color="onHeader" />
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
  }),
);
