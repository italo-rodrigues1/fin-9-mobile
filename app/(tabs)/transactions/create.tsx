import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTransactionStore } from '../../../src/stores/transactionStore';
import { useCategoryStore } from '../../../src/stores/categoryStore';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { TransactionType } from '../../../src/types';
import { CATEGORY_ICONS } from '../../../src/constants';

export default function CreateTransactionScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { create } = useTransactionStore();
  const { categories, fetch: fetchCategories } = useCategoryStore();
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (params.type === TransactionType.INCOME) {
      setType(TransactionType.INCOME);
      return;
    }

    if (params.type === TransactionType.EXPENSE) {
      setType(TransactionType.EXPENSE);
    }
  }, [params.type]);

  const handleSubmit = async () => {
    if (!title.trim()) return Alert.alert('Atenção', 'Informe o título');
    if (!amount || Number(amount) <= 0) return Alert.alert('Atenção', 'Informe um valor válido');
    if (!categoryId) return Alert.alert('Atenção', 'Selecione uma categoria');

    setIsSubmitting(true);
    try {
      await create({
        title: title.trim(),
        description: description.trim() || undefined,
        amount: Number(amount),
        type,
        date,
        categoryId,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 60, paddingTop: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-6">
            <Text className="text-2xl font-bold text-[#344054]">Nova Transação</Text>
            <Text className="mt-1 text-sm text-[#98A2B3]">Cadastre uma nova receita ou despesa</Text>
          </View>

          <View className="mb-6 rounded-[24px] bg-white p-5">
            <View className="mb-8 flex-row gap-4">
              <TouchableOpacity
                className={`flex-1 items-center rounded-[16px] py-4 ${type === TransactionType.EXPENSE ? 'bg-[#FFF1F1] border border-[#FF6B6B]' : 'bg-[#F9FAFB] border border-[#EAECF0]'}`}
                onPress={() => setType(TransactionType.EXPENSE)}
                activeOpacity={0.7}
              >
                <Text className={`font-semibold text-base ${type === TransactionType.EXPENSE ? 'text-[#FF6B6B]' : 'text-[#667085]'}`}>
                  📉 Despesa
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 items-center rounded-[16px] py-4 ${type === TransactionType.INCOME ? 'bg-[#EAFBF0] border border-[#6CCF7F]' : 'bg-[#F9FAFB] border border-[#EAECF0]'}`}
                onPress={() => setType(TransactionType.INCOME)}
                activeOpacity={0.7}
              >
                <Text className={`font-semibold text-base ${type === TransactionType.INCOME ? 'text-[#169670]' : 'text-[#667085]'}`}>
                  📈 Receita
                </Text>
              </TouchableOpacity>
            </View>

            <Input label="Título" value={title} onChangeText={setTitle} placeholder="Ex: Almoço, Salário..." />
            <Input label="Valor (R$)" value={amount} onChangeText={setAmount} placeholder="0,00" keyboardType="decimal-pad" />
            <Input label="Data" value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" />
            
            <View className="mb-6">
              <Text className="mb-3 ml-1 text-sm font-medium text-[#667085]">Categoria de Lançamento</Text>
              <View className="flex-row flex-wrap gap-3">
                {categories.map((cat) => {
                  const icon = CATEGORY_ICONS[cat.icon] || '🏷️';
                  const isSelected = categoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setCategoryId(cat.id)}
                      className={`flex-row items-center rounded-[16px] border px-4 py-3 ${
                        isSelected ? 'border-2' : 'border-[#EAECF0] bg-[#F9FAFB]'
                      }`}
                      style={isSelected ? { borderColor: cat.color, backgroundColor: `${cat.color}15` } : {}}
                      activeOpacity={0.8}
                    >
                      <Text className="mr-2 text-lg">{icon}</Text>
                      <Text className={`text-sm ${isSelected ? 'font-semibold text-[#344054]' : 'font-medium text-[#667085]'}`}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <Input label="Descrição (opcional)" value={description} onChangeText={setDescription} placeholder="Detalhes adicionais..." multiline />
          </View>

          <Button title="Salvar Transação" onPress={handleSubmit} isLoading={isSubmitting} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
