import { ConfirmationDialog } from '../src/components/ConfirmationDialog';
import '../global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { LoadingSkeleton } from '../src/components/LoadingSkeleton';
import { useAuthStore } from '../src/stores/authStore';
import { Feedback } from '../src/components/Feedback';
import { COLORS } from '../src/constants';

export default function RootLayout() {
  const { isAuthenticated, isHydrated, loadToken } = useAuthStore();

  useEffect(() => {
    loadToken();
  }, []);

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
        <Stack.Screen name="index" />
        <Stack.Protected guard={!isAuthenticated} redirectTo="/(tabs)">
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={isAuthenticated} redirectTo="/(auth)/welcome">
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="accounts/create" />
          <Stack.Screen name="accounts/detail" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="categories" />
          <Stack.Screen name="planning" />
          <Stack.Screen name="recurrence" />
          <Stack.Screen name="budgets" />
          <Stack.Screen name="transfer" />
          <Stack.Screen name="transfers" />
          <Stack.Screen name="goals/index" />
          <Stack.Screen name="goals/detail" />
          <Stack.Screen name="goals/edit" />
          <Stack.Screen name="goals/contribution" />
          <Stack.Screen name="cards/index" />
          <Stack.Screen name="cards/detail" />
          <Stack.Screen name="cards/edit" />
          <Stack.Screen name="cards/purchase" />
          <Stack.Screen name="cards/invoice" />
          <Stack.Screen name="cards/payment" />
        </Stack.Protected>
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
