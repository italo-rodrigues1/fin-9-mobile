import {
  Slot,
  useNavigationContainerRef,
  useRouter,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import Toast from "react-native-toast-message";
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

  const toastConfig = {
    confirm: ({ text1, text2, props, hide }: any) => (
      <View
        className="mx-4 mb-10 w-[92%] rounded-[28px] p-6 shadow-2xl"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          elevation: 10,
        }}
      >
        <Text className="mb-2 text-xl font-bold" style={{ color: colors.text }}>
          {text1}
        </Text>
        <Text
          className="mb-6 text-sm leading-6"
          style={{ color: colors.textSecondary }}
        >
          {text2}
        </Text>
        <View className="flex-row justify-end gap-3">
          <TouchableOpacity
            onPress={() => {
              props.onCancel?.();
              Toast.hide();
            }}
            className="rounded-full px-5 py-3"
            style={{ backgroundColor: colors.backgroundMuted }}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.text }}
            >
              {props.cancelText || "Cancelar"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              props.onConfirm();
              Toast.hide();
            }}
            className="rounded-full px-5 py-3"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.white }}
            >
              {props.confirmText || "Confirmar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
  };

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
      <Toast config={toastConfig} />
    </>
  );
}

export default Sentry.wrap(RootLayout);
