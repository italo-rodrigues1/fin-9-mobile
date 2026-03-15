import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTransactionStore } from '../../../src/stores/transactionStore';
import { useCategoryStore } from '../../../src/stores/categoryStore';
import { transactionService } from '../../../src/services/transactionService';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { TransactionType } from '../../../src/types';
import { CATEGORY_ICONS } from '../../../src/constants';

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { update, remove } = useTransactionStore();
  const { categories, fetch: fetchCategories } = useCategoryStore();
  const router = useRouter();

  useEffect(() => {
    loadTransaction();
    fetchCategories();
  }, [id]);

  const loadTransaction = async () => {
    try {
      const tx = await transactionService.getById(id);
      setTitle(tx.title);
      setDescription(tx.description || '');
      setAmount(String(tx.amount));
      setType(tx.type);
      setCategoryId(tx.categoryId);
      setDate(tx.date.split('T')[0]);
    } catch {
      Alert.alert('Erro', 'Transação não encontrada');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!title.trim()) return Alert.alert('Atenção', 'Informe o título');
    if (!amount || Number(amount) <= 0) return Alert.alert('Atenção', 'Informe um valor válido');

    setIsSubmitting(true);
    try {
      await update(id, {
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

  const handleDelete = () => {
    Alert.alert('Excluir', 'Tem certeza que deseja excluir esta transação?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(id);
            router.back();
          } catch (err: any) {
            Alert.alert('Erro', err.message);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F7F8FA]">
        <ActivityIndicator size="large" color="#169670" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 60, paddingTop: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8 items-center">
            <View className="w-16 h-16 bg-primary-500/20 rounded-full items-center justify-center mb-4 border border-primary-500/30">
              <Text className="text-3xl">✏️</Text>
            </View>
            <Text className="text-white text-2xl font-extrabold tracking-tight">Editar Transação</Text>
          </View>

          <View className="bg-slate-900/80 rounded-[32px] p-6 border border-slate-800 shadow-xl mb-6">
            <View className="flex-row gap-4 mb-8">
              <TouchableOpacity
                className={`flex-1 py-4 rounded-2xl items-center shadow-sm ${type === TransactionType.EXPENSE ? 'bg-red-500/20 border-2 border-red-500' : 'bg-slate-800 border-2 border-transparent'}`}
                onPress={() => setType(TransactionType.EXPENSE)}
                activeOpacity={0.7}
              >
                <Text className={`font-bold text-base ${type === TransactionType.EXPENSE ? 'text-red-400' : 'text-slate-400'}`}>
                  📉 Despesa
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-4 rounded-2xl items-center shadow-sm ${type === TransactionType.INCOME ? 'bg-emerald-500/20 border-2 border-emerald-500' : 'bg-slate-800 border-2 border-transparent'}`}
                onPress={() => setType(TransactionType.INCOME)}
                activeOpacity={0.7}
              >
                <Text className={`font-bold text-base ${type === TransactionType.INCOME ? 'text-emerald-400' : 'text-slate-400'}`}>
                  📈 Receita
                </Text>
              </TouchableOpacity>
            </View>

            <Input label="Título" value={title} onChangeText={setTitle} placeholder="Ex: Almoço, Salário..." />
            <Input label="Valor (R$)" value={amount} onChangeText={setAmount} placeholder="0,00" keyboardType="decimal-pad" />
            <Input label="Data" value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" />

            <View className="mb-6">
              <Text className="text-slate-400 text-sm font-medium mb-3 ml-1">Categoria de Lançamento</Text>
              <View className="flex-row flex-wrap gap-3">
                {categories.map((cat) => {
                  const icon = CATEGORY_ICONS[cat.icon] || '🏷️';
                  const isSelected = categoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setCategoryId(cat.id)}
                      className={`px-4 py-3 rounded-2xl flex-row items-center border ${
                        isSelected ? 'border-2 scale-[1.02] shadow-sm' : 'bg-slate-800 border-slate-700/50'
                      }`}
                      style={isSelected ? { borderColor: cat.color, backgroundColor: `${cat.color}15` } : {}}
                      activeOpacity={0.8}
                    >
                      <Text className="mr-2 text-lg">{icon}</Text>
                      <Text className={`text-sm tracking-wide ${isSelected ? 'text-slate-100 font-bold' : 'text-slate-400 font-medium'}`}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <Input label="Descrição (opcional)" value={description} onChangeText={setDescription} placeholder="Detalhes adicionais..." multiline />
          </View>

          <View className="gap-4">
            <Button title="Salvar Alterações" onPress={handleUpdate} isLoading={isSubmitting} />
            <Button title="Excluir Transação" onPress={handleDelete} variant="danger" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
