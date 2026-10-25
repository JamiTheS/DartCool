import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { LogBox, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initAds } from '@/ads';
import { AppProvider, useApp } from '@/store/app';
import { C } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 320, fade: true });
LogBox.ignoreAllLogs(true);

/**
 * Attend l'hydratation du stockage avant d'afficher quoi que ce soit, avec un
 * filet de sécurité : au bout de 2,5 s le splash s'efface de toute façon.
 * (Leçon d'un lancement bloqué sur un splash qui attendait une ressource.)
 */
function Gate({ children }: { children: React.ReactNode }) {
  const { ready } = useApp();

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  // Consentement puis SDK publicitaire, une fois l'app affichée : le
  // formulaire RGPD ne doit pas se superposer au splash, et un échec ici ne
  // doit jamais retarder le lancement.
  useEffect(() => {
    if (ready) initAds();
  }, [ready]);

  useEffect(() => {
    const t = setTimeout(() => SplashScreen.hide(), 2500);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return <View style={{ flex: 1, backgroundColor: C.bg }} />;
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Gate>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: C.bg },
              animation: 'slide_from_right',
            }}>
            <Stack.Screen name="index" options={{ animation: 'fade' }} />
            <Stack.Screen name="match" options={{ animation: 'fade', gestureEnabled: false }} />
            <Stack.Screen name="summary" options={{ animation: 'fade', gestureEnabled: false }} />
          </Stack>
        </Gate>
      </AppProvider>
    </SafeAreaProvider>
  );
}
