import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { ScreenHeader } from '../components/ScreenHeader';
import { ColorPicker } from '../components/ui/ColorPicker';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ACCOUNT_COLORS, ACCOUNT_ICON_OPTIONS, INPUT_LIMITS } from '../constants';
import { useAccountStore } from '../stores/accountStore';
import { formatCurrencyInput, MAX_MONEY_VALUE, parseCurrencyInput, sanitizeCurrencyInput } from '../utils/format';

const INSTITUTION_OPTIONS = [
  'Nubank',
  'Itaú',
  'Bradesco',
  'Santander',
  'Banco do Brasil',
  'Caixa Econômica Federal',
  'Banco Inter',
  'C6 Bank',
  'BTG Pactual',
  'XP Investimentos',
  'PicPay',
  'Mercado Pago',
].map((institution) => ({ value: institution, label: institution }));

export default function CreateAccountScreen() {
  const router = useRouter();
  const createAccount = useAccountStore((state) => state.create);
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [balance, setBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState(ACCOUNT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ACCOUNT_ICON_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const parsedBalance = parseCurrencyInput(balance);

    setSubmitError(null);
    if (!name.trim()) return Alert.alert('Atenção', 'Informe o nome da conta');
    if (!institution.trim()) return Alert.alert('Atenção', 'Informe a instituição');
    if (!balance || !Number.isFinite(parsedBalance) || parsedBalance < 0) {
      return Alert.alert('Atenção', 'Informe um saldo válido');
    }
    if (parsedBalance > MAX_MONEY_VALUE) {
      return Alert.alert('Atenção', 'O saldo máximo permitido é R$ 999.999.999,99');
    }
    setIsSubmitting(true);
    try {
      await createAccount({
        name: name.trim(),
        institution: institution.trim(),
        balance: parsedBalance,
        color: selectedColor,
        icon: selectedIcon,
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      const message = err.message || 'Não foi possível cadastrar a conta';
      setSubmitError(message);
      Alert.alert('Erro', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <ScreenHeader
        title="Cadastrar conta"
        subtitle="Adicione bancos, corretoras e outras contas para acompanhar seus saldos."
      />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="rounded-[24px] bg-white p-5">
            <Input
              label="Nome da conta"
              value={name}
              onChangeText={setName}
              placeholder="Ex: Reserva Nubank"
              maxLength={INPUT_LIMITS.name}
            />
            <Select
              label="Instituição"
              value={institution}
              options={INSTITUTION_OPTIONS}
              onChange={setInstitution}
              placeholder="Ex: Nubank, XP Investimentos"
              editable
              maxLength={INPUT_LIMITS.institution}
            />
            <Input
              label="Saldo atual (R$)"
              value={balance}
              onChangeText={(value) => setBalance(sanitizeCurrencyInput(value))}
              onBlur={() => {
                const parsed = parseCurrencyInput(balance);
                if (balance && Number.isFinite(parsed)) setBalance(formatCurrencyInput(parsed));
              }}
              placeholder="0,00"
              keyboardType="decimal-pad"
              maxLength={INPUT_LIMITS.money}
            />

            <ColorPicker
              label="Cor do cartão"
              value={selectedColor}
              onChange={setSelectedColor}
              colors={ACCOUNT_COLORS}
            />

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
            {submitError ? (
              <View className="mb-4 rounded-[14px] border border-[#FFB4B4] bg-[#FFF1F1] px-4 py-3">
                <Text className="text-sm text-[#B42318]">{submitError}</Text>
              </View>
            ) : null}
            <Button title="Salvar Conta" onPress={handleSubmit} isLoading={isSubmitting} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
