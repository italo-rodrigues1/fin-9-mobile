import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { BrandLogo } from '../../src/components/BrandLogo';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem');
      return;
    }
    try {
      await register(name.trim(), email.trim(), password);
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F7F8FA]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-8 py-12">
          <View className="mb-14 items-center">
            <BrandLogo muted />
          </View>

          <View>
            <Text className="text-center text-[18px] font-bold text-[#1F2937]">Crie sua conta</Text>
            <Text className="mt-4 text-center text-base text-[#667085]">
              Já possui uma conta?{' '}
              <Text
                className="font-semibold text-[#169670]"
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
              onChangeText={(text) => { clearError(); setName(text); }}
              placeholder="Nome"
            />

            <Input
              label=""
              value={email}
              onChangeText={(text) => { clearError(); setEmail(text); }}
              placeholder="E-mail"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label=""
              value={password}
              onChangeText={(text) => { clearError(); setPassword(text); }}
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
              <View className="mb-4 rounded-[14px] border border-[#FFD2D2] bg-[#FFF1F1] p-4">
                <Text className="text-center text-sm text-[#FF6B6B]">{error}</Text>
              </View>
            )}

            <View className="mt-3">
              <Button title="Criar conta" onPress={handleRegister} isLoading={isLoading} />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
