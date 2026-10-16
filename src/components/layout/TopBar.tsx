import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/ui/IconButton';
import { Text } from '@/components/ui/Text';
import { makeStyles } from '@/theme';

export type TopBarProps = {
  title?: string;
  subtitle?: string;
  /** Defaults to router.back(). Pass null to hide the back button. */
  onBack?: (() => void) | null;
  /** Trailing slot (icon buttons). */
  right?: ReactNode;
};

/** 52px bar: back · centred title/subtitle · actions (.top). */
export function TopBar({ title, subtitle, onBack, right }: TopBarProps) {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const back = onBack === undefined ? (router.canGoBack() ? router.back : null) : onBack;

  return (
    <View style={styles.root}>
      <View style={styles.side}>
        {back ? (
          <IconButton
            icon={ChevronLeft}
            accessibilityLabel={t('actions.back')}
            onPress={back}
            flipInRTL
          />
        ) : null}
      </View>
      <View style={styles.center}>
        {title ? (
          <Text variant="title" align="center" numberOfLines={1} accessibilityRole="header">
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text variant="caption" align="center" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[styles.side, styles.end]}>{right}</View>
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      minHeight: t.size.topBar,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: t.space.md,
    },
    side: { minWidth: t.size.touch, flexDirection: 'row', alignItems: 'center' },
    end: { justifyContent: 'flex-end' },
    center: { flex: 1, alignItems: 'center', paddingHorizontal: t.space.xs },
  }),
);
