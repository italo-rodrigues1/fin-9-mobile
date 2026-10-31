import { ConfirmationDialog } from '../src/components/ConfirmationDialog';
import '../global.css';
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { LoadingSkeleton } from '../src/components/LoadingSkeleton';
import { useAuthStore } from '../src/stores/authStore';
import { Feedback } from '../src/components/Feedback';
import { COLORS } from '../src/constants';

export default function RootLayout() {
  const { isAuthenticated, isHydrated, loadToken } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isHydrated, segments]);

  if (!isHydrated) {
    return (
      <View
        className="flex-1 pt-14"
        style={{ backgroundColor: COLORS.background }}
      >
        <LoadingSkeleton variant="screen" label="Preparando aplicativo" />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="accounts/create" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="categories" />
      </Stack>
      <Feedback />
      <ConfirmationDialog />
    </>
  );
}

export function SuspenseFallback() {
  return (
    <View className="flex-1 bg-[#F7F8FA] pt-14">
      <LoadingSkeleton variant="screen" label="Carregando tela" />
    </View>
  );
}
