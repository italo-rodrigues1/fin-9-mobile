import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AuthError, AuthScreen } from "../../src/components/auth/AuthScreen";
import { PasswordRequirements } from "../../src/components/auth/PasswordRequirements";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { INPUT_LIMITS } from "../../src/constants";
import { useAuthStore } from "../../src/stores/authStore";
import { notify } from "../../src/stores/feedbackStore";
import { useTheme } from "../../src/theme/ThemeProvider";

export default function RegisterScreen() {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register, isLoading, error, clearError } = useAuthStore();

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
    setErrors((current) => ({
      ...current,
      [field]: "",
      ...(field === "password" ? { confirmPassword: "" } : {}),
    }));
    setValue(value);
  };

  const handleRegister = async () => {
    if (isLoading) return;
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Informe seu nome";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = "Informe um e-mail válido";
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    )
      next.password =
        "Use no mínimo 8 caracteres, uma letra maiúscula e um número";
    if (!confirmPassword) next.confirmPassword = "Confirme sua senha";
    else if (password !== confirmPassword)
      next.confirmPassword = "As senhas não coincidem";
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      await register(name.trim(), email.trim(), password);
    } catch (err: any) {
      notify(err.message);
    }
  };

  return (
    <AuthScreen
      registration
      title="Crie sua conta"
      subtitle={
        <>
          Já possui uma conta?{" "}
          <Link
            href="/(auth)/login"
            replace
            style={{ fontWeight: "bold", color: colors.primaryText }}
          >
            Fazer login
          </Link>
        </>
      }
    >
      <Input
        label="Nome"
        icon="user"
        embeddedLabel
        error={errors.name}
        value={name}
        onChangeText={(text) => updateField("name", text, setName)}
        placeholder="Nome"
        autoCapitalize="words"
        autoComplete="name"
        maxLength={INPUT_LIMITS.name}
      />
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
        autoComplete="new-password"
        maxLength={INPUT_LIMITS.password}
      />
      <PasswordRequirements password={password} />
      <Input
        label="Confirmar senha"
        icon="shield"
        embeddedLabel
        error={errors.confirmPassword}
        value={confirmPassword}
        onChangeText={(text) =>
          updateField("confirmPassword", text, setConfirmPassword)
        }
        placeholder="Confirmar senha"
        secureTextEntry
        autoComplete="new-password"
        returnKeyType="go"
        onSubmitEditing={handleRegister}
        maxLength={INPUT_LIMITS.password}
      />
      <AuthError message={error} />
      <View style={styles.submitContainer}>
        <Button
          title="Criar conta"
          onPress={handleRegister}
          isLoading={isLoading}
        />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  submitContainer: {
    marginTop: 8,
  },
});
