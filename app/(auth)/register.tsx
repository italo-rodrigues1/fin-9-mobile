import {
  KeyboardScreen as SafeAreaView,
  KeyboardScrollView as ScrollView,
} from '../../src/components/KeyboardForm';
import { notify } from '../../src/stores/feedbackStore';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Keyboard, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { BrandLogo } from '../../src/components/BrandLogo';
import { BackButton } from '../../src/components/BackButton';
import { INPUT_LIMITS } from '../../src/constants';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleRegister = async () => {
    if (isLoading) return;
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = 'Informe um e-mail válido';
    if (!password) next.password = 'Informe sua senha';
    if (!name.trim()) next.name = 'Informe seu nome';
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    )
      next.password =
        'Use no mínimo 8 caracteres, uma letra maiúscula e um número';
    if (password !== confirmPassword)
      next.confirmPassword = 'As senhas não coincidem';
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      await register(name.trim(), email.trim(), password);
    } catch (err: any) {
      notify(err.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-background">
      <View className="absolute left-4 top-3 z-10">
        <BackButton fallbackHref="/(auth)/login" />
      </View>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 32,
          paddingVertical: 48,
          paddingBottom: 48,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full">
          <View className="mb-14 items-center">
            <BrandLogo muted />
          </View>

          <View>
            <Text className="text-center text-[18px] font-bold text-app-text">
              Crie sua conta
            </Text>
            <Text className="mt-4 text-center text-base text-app-textMuted">
              Já possui uma conta?{' '}
              <Text
                className="font-semibold text-app-primaryText"
                onPress={() => router.replace('/(auth)/login')}
              >
                Fazer Login
              </Text>
            </Text>
          </View>

          <View className="mt-10">
            <Input
              label=""
              error={errors.name}
              value={name}
              onChangeText={(text) => {
                clearError();
                setName(text);
              }}
              placeholder="Nome"
              maxLength={INPUT_LIMITS.name}
            />

            <Input
              label=""
              error={errors.email}
              value={email}
              onChangeText={(text) => {
                clearError();
                setEmail(text);
              }}
              placeholder="E-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={INPUT_LIMITS.email}
            />

            <Input
              label=""
              error={errors.password}
              value={password}
              onChangeText={(text) => {
                clearError();
                setPassword(text);
              }}
              placeholder="Senha"
              secureTextEntry
              maxLength={INPUT_LIMITS.password}
            />

            <Text className="mb-4 text-sm text-app-textSecondary">
              Mínimo de 8 caracteres, uma letra maiúscula e um número.
            </Text>
            <Input
              label=""
              error={errors.confirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirmar senha"
              secureTextEntry
              maxLength={INPUT_LIMITS.password}
            />

            {error && (
              <View className="mb-4 rounded-lg border border-app-dangerBorder bg-app-dangerBackground p-4">
                <Text className="text-center text-sm text-app-danger">
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
      </ScrollView>
    </SafeAreaView>
  );
}
