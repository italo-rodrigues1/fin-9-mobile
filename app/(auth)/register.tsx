import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import { BrandLogo } from "../../src/components/BrandLogo";
import { FormScreen } from "../../src/components/layout/FormScreen";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { useAuthStore } from "../../src/stores/authStore";
import { useTheme } from "../../src/theme/useTheme";

const emailValid = ["gmail.com", "outlook.com"];

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();
  const { colors } = useTheme();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Atenção", "Preencha todos os campos");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Atenção", "A senha deve ter no mínimo 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Atenção", "As senhas não coincidem");
      return;
    }
    if (!emailValid.some((domain) => email.endsWith(domain))) {
      Alert.alert("Atenção", "Por favor, utilize um e-mail válido");
      return;
    }

    try {
      await register(name.trim(), email.trim(), password);
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
              Crie sua conta
            </Text>
            <Text className="mt-4 text-center text-base" style={{ color: colors.textSecondary }}>
              Já possui uma conta?{" "}
              <Text
                className="font-semibold"
                style={{ color: colors.primary }}
                onPress={() => router.back()}
              >
                Fazer Login
              </Text>
            </Text>
          </View>

          <View className="mt-10">
            <Input
              label=""
              value={name}
              onChangeText={(text) => {
                clearError();
                setName(text);
              }}
              placeholder="Nome"
            />

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

            <Input
              label=""
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirmar senha"
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
                <Text className="text-center text-sm" style={{ color: colors.danger }}>
                  {error}
                </Text>
              </View>
            )}

            <View className="mt-3">
              <Button
                title="Criar conta"
                onPress={handleRegister}
                isLoading={isLoading}
              />
            </View>
          </View>
        </View>
    </FormScreen>
  );
}
