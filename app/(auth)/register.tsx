import { notify } from '../../src/stores/feedbackStore';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Keyboard,
  Platform,
  Alert,
  type ScrollViewInstance,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { BrandLogo } from '../../src/components/BrandLogo';
import { BackButton } from '../../src/components/BackButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { INPUT_LIMITS } from '../../src/constants';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollViewInstance>(null);
  const lowerFieldFocused = useRef(false);
  const { register, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const scrollToLowerFields = () => {
    lowerFieldFocused.current = true;
    setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      100,
    );
  };

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
      if (lowerFieldFocused.current) {
        setTimeout(
          () => scrollViewRef.current?.scrollToEnd({ animated: true }),
          50,
        );
      }
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () =>
      setKeyboardHeight(0),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

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
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <View className="absolute left-4 top-3 z-10">
        <BackButton fallbackHref="/(auth)/login" />
      </View>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 32,
          paddingVertical: 48,
          paddingBottom: 48 + keyboardHeight,
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
            <Text className="text-center text-[18px] font-bold text-[#1F2937]">
              Crie sua conta
            </Text>
            <Text className="mt-4 text-center text-base text-[#667085]">
              Já possui uma conta?{' '}
              <Text
                className="font-semibold text-[#169670]"
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
              onFocus={() => {
                lowerFieldFocused.current = false;
              }}
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
              onFocus={() => {
                lowerFieldFocused.current = false;
              }}
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
              onFocus={scrollToLowerFields}
              maxLength={INPUT_LIMITS.password}
            />

            <Text className="mb-4 text-sm text-[#475467]">
              Mínimo de 8 caracteres, uma letra maiúscula e um número.
            </Text>
            <Input
              label=""
              error={errors.confirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirmar senha"
              secureTextEntry
              onFocus={scrollToLowerFields}
              maxLength={INPUT_LIMITS.password}
            />

            {error && (
              <View className="mb-4 rounded-lg border border-[#FFD2D2] bg-[#FFF1F1] p-4">
                <Text className="text-center text-sm text-[#FF6B6B]">
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
