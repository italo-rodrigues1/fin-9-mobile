import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { AuthError, AuthScreen } from "../../src/components/auth/AuthScreen";
import { GoogleButton } from "../../src/components/auth/GoogleButton";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { INPUT_LIMITS } from "../../src/constants";
import { useAuthStore } from "../../src/stores/authStore";
import { notify } from "../../src/stores/feedbackStore";

export default function LoginScreen() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, clearError } = useAuthStore();

  useFocusEffect(
    useCallback(() => {
      clearError();
    }, [clearError]),
  );

  const updateField = (
    field: string,
    value: string,
    setValue: (value: string) => void,
  ) => {
    clearError();
    setErrors((current) => ({ ...current, [field]: "" }));
    setValue(value);
  };

  const handleLogin = async () => {
    if (isLoading) return;
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = "Informe um e-mail válido";
    if (!password) next.password = "Informe sua senha";
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      notify(err.message);
    }
  };

  return (
    <AuthScreen
      title="Entre em sua conta"
      subtitle={
        <>
          Novo por aqui?{" "}
          <Link
            href="/(auth)/register"
            style={{ fontWeight: "bold", color: "#E7F8F1" }}
          >
            Crie uma conta
          </Link>
        </>
      }
    >
      <Input
        label="E-mail"
        icon="mail"
        embeddedLabel
        error={errors.email}
        value={email}
        onChangeText={(text) => updateField("email", text, setEmail)}
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        maxLength={INPUT_LIMITS.email}
      />
      <Input
        label="Senha"
        icon="lock"
        embeddedLabel
        error={errors.password}
        value={password}
        onChangeText={(text) => updateField("password", text, setPassword)}
        placeholder="Senha"
        secureTextEntry
        autoComplete="current-password"
        returnKeyType="go"
        onSubmitEditing={handleLogin}
        maxLength={INPUT_LIMITS.password}
      />
      <AuthError message={error} />
      <View>
        <Button title="Entrar" onPress={handleLogin} isLoading={isLoading} />
      </View>
      <GoogleButton />
    </AuthScreen>
  );
}
