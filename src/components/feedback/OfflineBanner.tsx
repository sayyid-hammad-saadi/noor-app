import { WifiOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { Touchable } from '@/components/ui/Touchable';
import { useOnline } from '@/lib/network';
import { makeStyles } from '@/theme';

/**
 * Dark strip shown while the device is offline (34d). Renders nothing when online.
 * `onRetry` re-runs whatever the screen was loading.
 */
export function OfflineBanner({ onRetry }: { onRetry?: () => void }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const online = useOnline();
  if (online) return null;
  return (
    <View style={styles.root} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Icon icon={WifiOff} size={18} color="onToast" />
      <Text variant="label" weight="400" color="onToast" style={styles.msg}>
        <Text variant="label" weight="700" color="onToast">
          {t('states.offlineShort')}
        </Text>{' '}
        {t('states.offlineBody')}
      </Text>
      {onRetry ? (
        <Touchable accessibilityRole="button" onPress={onRetry} hitSlop={8} style={styles.retry}>
          <Text variant="label" weight="700" color="onToast" style={styles.underline}>
            {t('actions.retry')}
          </Text>
        </Touchable>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      paddingVertical: t.space.md,
      paddingHorizontal: 14,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.toast,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    msg: { flex: 1 },
    retry: { minHeight: t.size.touch, justifyContent: 'center' },
    underline: { textDecorationLine: 'underline' },
  }),
);
