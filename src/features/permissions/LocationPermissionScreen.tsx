import { useRouter } from 'expo-router';
import { Navigation, Search, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Banner } from '@/components/feedback';
import { Button, Icon, Text } from '@/components/ui';
import { CityPickerSheet } from '@/features/location/CityPickerSheet';
import { requestDeviceLocation } from '@/features/location/deviceLocation';
import { useLocation } from '@/features/location/LocationProvider';
import { routes } from '@/lib/routes';
import { makeStyles } from '@/theme';

import { LocationArt } from './illustrations/LocationArt';
import { PermissionLayout } from './PermissionLayout';

type Problem = 'denied' | 'unavailable' | null;

/** 04a Permission — Location. */
export default function LocationPermissionScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const { setLocation, saved } = useLocation();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<Problem>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const goNext = () => router.replace(routes.permissionNotifications);

  const allow = async () => {
    setBusy(true);
    setProblem(null);
    const result = await requestDeviceLocation();
    setBusy(false);
    if (result.status === 'ok') {
      await setLocation(result.location);
      goNext();
    } else {
      setProblem(result.status);
    }
  };

  return (
    <>
      <PermissionLayout
        art={<LocationArt size={Math.min(260, height * 0.3)} />}
        title={t('permissions.location.title')}
        body={t('permissions.location.body')}
        actions={
          <>
            <Button
              size="lg"
              icon={Navigation}
              label={t('permissions.location.allow')}
              loading={busy}
              onPress={() => void allow()}
            />
            <Button
              size="lg"
              variant="secondary"
              label={t('permissions.location.notNow')}
              onPress={goNext}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={Search}
              label={t('permissions.location.manual')}
              onPress={() => setPickerOpen(true)}
            />
          </>
        }
      >
        <View style={styles.privacy}>
          <Icon icon={ShieldCheck} size={16} color="primary" />
          <Text variant="label" weight="500" style={styles.privacyText}>
            {t('permissions.location.privacy')}
          </Text>
        </View>
        {problem ? (
          <View style={styles.banner}>
            <Banner tone="warn" message={t(`permissions.location.${problem}`)} />
          </View>
        ) : null}
      </PermissionLayout>

      <CityPickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedId={saved?.source === 'city' ? saved.cityId : undefined}
        onSelect={async (city) => {
          setPickerOpen(false);
          await setLocation({ source: 'city', cityId: city.id });
          goNext();
        }}
      />
    </>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    privacy: {
      marginTop: t.space.xl,
      alignSelf: 'center',
      minHeight: 36,
      paddingHorizontal: 14,
      paddingVertical: t.space.xs,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.surface2,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.sm,
    },
    privacyText: { flexShrink: 1 },
    banner: { marginTop: t.space.lg },
  }),
);
