import { useFonts } from 'expo-font';
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider as NavigationThemeProvider,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useMemo } from 'react';
import { I18nextProvider } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/feedback/Toast';
import { LocationProvider, useLocation } from '@/features/location/LocationProvider';
import { AdhanScheduler } from '@/features/prayer/adhanScheduler';
import { QuranAudioProvider } from '@/features/quran/audio/QuranAudioProvider';
import { RamadanReminders } from '@/features/ramadan/ramadanReminders';
import { i18n, LanguageProvider, useLanguage } from '@/i18n';
import { fontAssets, ThemeProvider, useThemeContext } from '@/theme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider>
            <LanguageProvider>
              <LocationProvider>
                <AppShell fontsReady={fontsLoaded || fontError != null} />
              </LocationProvider>
            </LanguageProvider>
          </ThemeProvider>
        </I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Waits for fonts and the stored appearance, language and location before showing anything. */
function AppShell({ fontsReady }: { fontsReady: boolean }) {
  const { theme, ready: themeReady } = useThemeContext();
  const { ready: languageReady } = useLanguage();
  const { ready: locationReady } = useLocation();
  const ready = fontsReady && themeReady && languageReady && locationReady;
  const { colors, scheme } = theme;

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.bg);
  }, [colors.bg]);

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.bg,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.gold,
      },
    };
  }, [scheme, colors]);

  if (!ready) return null;

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <QuranAudioProvider>
        <ToastProvider>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <AdhanScheduler />
          <RamadanReminders />
          <Stack
            screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}
          >
            <Stack.Screen name="quran-player" options={{ presentation: 'modal' }} />
          </Stack>
        </ToastProvider>
      </QuranAudioProvider>
    </NavigationThemeProvider>
  );
}
