import { Sentry } from "@/lib/sentry";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import { BrandLogo } from "../../src/components/BrandLogo";
import { FormScreen } from "../../src/components/layout/FormScreen";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { useAuthStore } from "../../src/stores/authStore";
import { useTheme } from "../../src/theme/useTheme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();
  const { colors } = useTheme();

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
    <FormScreen
      padded={false}
      includeTopInset
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 32,
        paddingVertical: 48,
        paddingBottom: 72,
      }}
    >
        <View>
          <View className="mb-14 items-center">
            <BrandLogo muted />
          </View>

          <View>
            <Text className="text-center text-[18px] font-bold" style={{ color: colors.text }}>
              Entre em sua conta
            </Text>
            <Text className="mt-4 text-center text-base" style={{ color: colors.textSecondary }}>
              Novo por aqui?{" "}
              <Text
                className="font-semibold"
                style={{ color: colors.primary }}
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
              <View
                className="mb-4 rounded-[14px] border p-4"
                style={{
                  borderColor: `${colors.danger}55`,
                  backgroundColor: `${colors.danger}12`,
                }}
              >
                <Text className="text-sm" style={{ color: colors.danger }}>
                  {error}
                </Text>
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
    </FormScreen>
  );
}
