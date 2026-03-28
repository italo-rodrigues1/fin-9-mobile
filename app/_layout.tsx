import {
  Slot,
  useNavigationContainerRef,
  useRouter,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, View, useColorScheme } from "react-native";
import "../global.css";
import { Sentry, navigationIntegration } from "../src/lib/sentry";
import { useAuthStore } from "../src/stores/authStore";
import { useThemeStore } from "../src/stores/themeStore";
import { useTheme } from "../src/theme/useTheme";

function RootLayout() {
  const { isAuthenticated, isLoading, loadToken } = useAuthStore();
  const systemTheme = useColorScheme();
  const initializeTheme = useThemeStore((state) => state.initialize);
  const hasThemeHydrated = useThemeStore((state) => state.hasHydrated);
  const { colors, isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();
  const navigationContainerRef = useNavigationContainerRef();

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (!hasThemeHydrated) return;
    initializeTheme(systemTheme === "dark" ? "dark" : "light");
  }, [hasThemeHydrated, initializeTheme, systemTheme]);

  useEffect(() => {
    if (navigationContainerRef) {
      navigationIntegration.registerNavigationContainer(navigationContainerRef);
    }
  }, [navigationContainerRef]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.primary }}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Slot />
    </>
  );
}

export default Sentry.wrap(RootLayout);
