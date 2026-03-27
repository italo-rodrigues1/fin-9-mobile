import { Sentry } from "@/lib/sentry";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { BrandLogo } from "../../src/components/BrandLogo";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { useAuthStore } from "../../src/stores/authStore";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Atenção", "Preencha todos os campos");
      return;
    }
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F7F8FA]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 32,
          paddingVertical: 48,
          paddingBottom: 72,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <View className="mb-14 items-center">
            <BrandLogo muted />
          </View>

          <View>
            <Text className="text-center text-[18px] font-bold text-[#1F2937]">
              Entre em sua conta
            </Text>
            <Text className="mt-4 text-center text-base text-[#667085]">
              Novo por aqui?{" "}
              <Text
                className="font-semibold text-[#169670]"
                onPress={() => router.push("/(auth)/register")}
              >
                Crie uma conta
              </Text>
            </Text>
          </View>
          <Button
            title="Try!"
            onPress={() => {
              Sentry.captureException(new Error("First error"));
            }}
          />
          <View className="mt-10">
            <Input
              label=""
              value={email}
              onChangeText={(text) => {
                clearError();
                setEmail(text);
              }}
              placeholder="E-mail"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label=""
              value={password}
              onChangeText={(text) => {
                clearError();
                setPassword(text);
              }}
              placeholder="Senha"
              secureTextEntry
            />

            {error && (
              <View className="mb-4 rounded-[14px] border border-[#FFD2D2] bg-[#FFF1F1] p-4">
                <Text className="text-sm text-[#FF6B6B]">{error}</Text>
              </View>
            )}

            <View className="mt-3">
              <Button
                title="Entrar"
                onPress={handleLogin}
                isLoading={isLoading}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
