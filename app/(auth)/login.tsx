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
import { INPUT_LIMITS } from '../../src/constants';

export default function LoginScreen() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (isLoading) return;
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = 'Informe um e-mail válido';
    if (!password) next.password = 'Informe sua senha';
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      notify(err.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-background">
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
              Entre em sua conta
            </Text>
            <Text className="mt-4 text-center text-base text-app-textMuted">
              Novo por aqui?{' '}
              <Text
                className="font-semibold text-app-primaryText"
                onPress={() => router.push('/(auth)/register')}
              >
                Crie uma conta
              </Text>
            </Text>
          </View>

          <View className="mt-10">
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

            {error && (
              <View className="mb-4 rounded-lg border border-app-dangerBorder bg-app-dangerBackground p-4">
                <Text className="text-sm text-app-danger">{error}</Text>
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
    </SafeAreaView>
  );
}
