import { confirmAction } from '../src/utils/confirmAction';
import { QueryState } from '../src/components/QueryState';
import { notify } from '../src/stores/feedbackStore';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCategoryStore } from '../src/stores/categoryStore';
import { Category } from '../src/types';
import { CATEGORY_ICONS, INPUT_LIMITS } from '../src/constants';
import { EmptyState } from '../src/components/EmptyState';
import { Input } from '../src/components/ui/Input';
import { Button } from '../src/components/ui/Button';
import { ScreenHeader } from '../src/components/ScreenHeader';

const COLORS = [
  '#ef4444',
  '#3b82f6',
  '#14b8a6',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#22c55e',
  '#6b7280',
  '#f97316',
];

export default function CategoriesScreen() {
  const { categories, isLoading, error, fetch, create, update, remove } =
    useCategoryStore();
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  useEffect(() => {
    fetch();
  }, []);

  const resetForm = () => {
    setName('');
    setSelectedColor(COLORS[0]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (saving) return;
    if (!name.trim()) return setFieldError('Informe o nome da categoria');
    setFieldError('');
    setSaving(true);
    try {
      if (editingId) {
        await update(editingId, { name: name.trim(), color: selectedColor });
      } else {
        await create({ name: name.trim(), color: selectedColor });
      }
      notify('Categoria salva com sucesso.');
      resetForm();
    } catch (err: any) {
      notify(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setName(cat.name);
    setSelectedColor(cat.color);
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (cat: Category) => {
    if (
      !(await confirmAction(
        'Excluir categoria',
        'Deseja excluir a categoria ' + cat.name + '?',
        'Excluir',
      ))
    )
      return;
    try {
      await remove(cat.id);
      notify('Categoria excluída com sucesso.');
    } catch (err: any) {
      notify(err.message);
    }
  };

  const renderItem = useCallback(({ item }: { item: Category }) => {
    const icon = CATEGORY_ICONS[item.icon] || '🏷️';
    return (
      <View className="flex-row items-center py-4 px-5 bg-white rounded-lg mb-3 border border-slate-200/80 shadow-sm">
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: `${item.color}25` }}
        >
          <Text className="text-xl">{icon}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-slate-900 font-bold text-base mb-1">
            {item.name}
          </Text>
          <Text className="text-slate-600 text-xs font-medium">
            {item.isDefault ? 'Padrão' : 'Personalizada'}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            className="px-3 py-2 bg-slate-100 rounded-lg active:bg-slate-700"
          >
            <Text className="text-primary-700 text-sm font-bold">Editar</Text>
          </TouchableOpacity>
          {!item.isDefault && (
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              className="px-3 py-2 bg-red-500/10 rounded-lg active:bg-red-500/20"
            >
              <Text className="text-red-700 text-sm font-bold">Excluir</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: Category) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <ScreenHeader
        title="Categorias"
        right={
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="rounded-lg bg-primary-500 px-4 py-3 shadow-sm active:bg-primary-600"
            >
              <Text className="text-sm font-bold tracking-wide text-emerald-950">
                {showForm ? 'FECHAR' : 'Nova categoria'}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {showForm && (
        <View className="mx-6 mb-6 p-6 bg-white rounded-lg border border-slate-200 shadow-xl">
          <Input
            label={editingId ? 'Editar Categoria' : 'Nova Categoria'}
            error={fieldError}
            value={name}
            onChangeText={setName}
            placeholder="Nome da categoria"
            maxLength={INPUT_LIMITS.categoryName}
          />
          <Text className="text-slate-600 text-sm font-medium mb-3 ml-1">
            Cor de Identificação
          </Text>
          <View className="flex-row flex-wrap gap-3 mb-6">
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                className={`w-11 h-11 rounded-full ${selectedColor === color ? 'border-4 border-slate-200 shadow-md transform scale-110' : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </View>
          <Button
            title={editingId ? 'Salvar Categoria' : 'Criar Categoria'}
            onPress={handleSave}
            isLoading={saving}
          />
        </View>
      )}

      <FlatList
        data={isLoading || error ? [] : categories}
        ListHeaderComponent={
          <QueryState
            loading={isLoading}
            error={error}
            retry={() => void fetch(true)}
          />
        }
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          isLoading || error ? undefined : (
            <View className="mt-10">
              <EmptyState
                icon="🏷️"
                title="Nenhuma categoria"
                description="Categorias padrão serão criadas ao registrar"
              />
            </View>
          )
        }
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
