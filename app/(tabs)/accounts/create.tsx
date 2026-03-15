import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Input } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { accountService } from '../../../src/services/accountService';
import { ACCOUNT_COLORS, ACCOUNT_ICON_OPTIONS } from '../../../src/constants';

export default function CreateAccountScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [balance, setBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState(ACCOUNT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ACCOUNT_ICON_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return Alert.alert('Atenção', 'Informe o nome da conta');
    if (!institution.trim()) return Alert.alert('Atenção', 'Informe a instituição');
    if (!balance || Number(balance.replace(',', '.')) < 0) {
      return Alert.alert('Atenção', 'Informe um saldo válido');
    }

    setIsSubmitting(true);
    try {
      await accountService.create({
        name: name.trim(),
        institution: institution.trim(),
        balance: Number(balance.replace(',', '.')),
        color: selectedColor,
        icon: selectedIcon,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Erro', err.response?.data?.message || 'Não foi possível cadastrar a conta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 20, paddingBottom: 48 }}>
          <View className="mb-6">
            <Text className="text-2xl font-bold text-[#344054]">Cadastrar conta</Text>
            <Text className="mt-1 text-sm text-[#98A2B3]">
              Adicione bancos, corretoras e outras contas para acompanhar seus saldos.
            </Text>
          </View>

          <View className="rounded-[24px] bg-white p-5">
            <Input label="Nome da conta" value={name} onChangeText={setName} placeholder="Ex: Reserva Nubank" />
            <Input
              label="Instituição"
              value={institution}
              onChangeText={setInstitution}
              placeholder="Ex: Nubank, XP Investimentos"
            />
            <Input
              label="Saldo atual (R$)"
              value={balance}
              onChangeText={setBalance}
              placeholder="0,00"
              keyboardType="decimal-pad"
            />

            <Text className="mb-3 ml-1 mt-2 text-sm font-medium text-[#667085]">Cor do cartão</Text>
            <View className="mb-6 flex-row flex-wrap gap-3">
              {ACCOUNT_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  className={`h-11 w-11 rounded-full ${selectedColor === color ? 'border-4 border-white' : ''}`}
                  style={{
                    backgroundColor: color,
                    shadowColor: color,
                    shadowOpacity: selectedColor === color ? 0.28 : 0,
                    shadowRadius: 8,
                    elevation: selectedColor === color ? 3 : 0,
                  }}
                />
              ))}
            </View>

            <Text className="mb-3 ml-1 text-sm font-medium text-[#667085]">Ícone</Text>
            <View className="mb-2 flex-row flex-wrap gap-3">
              {ACCOUNT_ICON_OPTIONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  className={`h-12 w-12 items-center justify-center rounded-2xl border ${
                    selectedIcon === icon ? 'border-[#344054] bg-[#F2F4F7]' : 'border-[#EAECF0] bg-[#F9FAFB]'
                  }`}
                >
                  <MaterialCommunityIcons name={icon as never} size={22} color="#344054" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mt-6">
            <Button title="Salvar Conta" onPress={handleSubmit} isLoading={isSubmitting} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
