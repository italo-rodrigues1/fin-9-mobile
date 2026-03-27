import {
  Slot,
  useNavigationContainerRef,
  useRouter,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "../global.css";
import { COLORS } from "../src/constants";
import { Sentry, navigationIntegration } from "../src/lib/sentry";
import { useAuthStore } from "../src/stores/authStore";

function RootLayout() {
  const { isAuthenticated, isLoading, loadToken } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationContainerRef = useNavigationContainerRef();

  useEffect(() => {
    loadToken();
  }, []);

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
        style={{ backgroundColor: COLORS.primary }}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Slot />
    </>
  );
}

export default Sentry.wrap(RootLayout);
