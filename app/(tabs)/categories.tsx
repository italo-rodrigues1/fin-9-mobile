import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCategoryStore } from '../../src/stores/categoryStore';
import { Category } from '../../src/types';
import { CATEGORY_ICONS } from '../../src/constants';
import { EmptyState } from '../../src/components/EmptyState';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';

const COLORS = ['#ef4444', '#3b82f6', '#14b8a6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#22c55e', '#6b7280', '#f97316'];

export default function CategoriesScreen() {
  const { categories, isLoading, fetch, create, update, remove } = useCategoryStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetch();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  }, [fetch]);

  const resetForm = () => {
    setName('');
    setSelectedColor(COLORS[0]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Atenção', 'Informe o nome da categoria');
    try {
      if (editingId) {
        await update(editingId, { name: name.trim(), color: selectedColor });
      } else {
        await create({ name: name.trim(), color: selectedColor });
      }
      resetForm();
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    }
  };

  const handleEdit = (cat: Category) => {
    setName(cat.name);
    setSelectedColor(cat.color);
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = (cat: Category) => {
    Alert.alert('Excluir', `Deseja excluir "${cat.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(cat.id);
          } catch (err: any) {
            Alert.alert('Erro', err.message);
          }
        },
      },
    ]);
  };

  const renderItem = useCallback(
    ({ item }: { item: Category }) => {
      const icon = CATEGORY_ICONS[item.icon] || '🏷️';
      return (
        <View className="flex-row items-center py-4 px-5 bg-slate-900/40 rounded-3xl mb-3 border border-slate-800/80 shadow-sm">
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: `${item.color}25` }}
          >
            <Text className="text-xl">{icon}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-slate-100 font-bold text-base mb-1">{item.name}</Text>
            <Text className="text-slate-400 text-xs font-medium">
              {item.isDefault ? 'Padrão' : 'Personalizada'}
            </Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity onPress={() => handleEdit(item)} className="px-3 py-2 bg-slate-800 rounded-xl active:bg-slate-700">
              <Text className="text-primary-400 text-sm font-bold">Editar</Text>
            </TouchableOpacity>
            {!item.isDefault && (
              <TouchableOpacity onPress={() => handleDelete(item)} className="px-3 py-2 bg-red-500/10 rounded-xl active:bg-red-500/20">
                <Text className="text-red-400 text-sm font-bold">Excluir</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    },
    [],
  );

  const keyExtractor = useCallback((item: Category) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
        <Text className="text-white text-3xl font-extrabold tracking-tight">Categorias</Text>
        <TouchableOpacity
          onPress={() => { resetForm(); setShowForm(!showForm); }}
          className="bg-primary-500 px-5 py-3 rounded-2xl active:bg-primary-600 shadow-sm"
        >
          <Text className="text-emerald-950 font-bold text-sm tracking-wide">{showForm ? 'FECHAR' : '+ NOVA'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View className="mx-6 mb-6 p-6 bg-slate-900 rounded-[32px] border border-slate-800 shadow-xl">
          <Input
            label={editingId ? 'Editar Categoria' : 'Nova Categoria'}
            value={name}
            onChangeText={setName}
            placeholder="Nome da categoria"
          />
          <Text className="text-slate-400 text-sm font-medium mb-3 ml-1">Cor de Identificação</Text>
          <View className="flex-row flex-wrap gap-3 mb-6">
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                className={`w-11 h-11 rounded-full ${selectedColor === color ? 'border-4 border-slate-800 shadow-md transform scale-110' : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </View>
          <Button title={editingId ? 'Salvar Categoria' : 'Criar Categoria'} onPress={handleSave} />
        </View>
      )}

      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
        }
        ListEmptyComponent={
          <View className="mt-10">
            <EmptyState icon="🏷️" title="Nenhuma categoria" description="Categorias padrão serão criadas ao registrar" />
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
