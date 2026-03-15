import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTransactionStore } from '../../../src/stores/transactionStore';
import { TransactionItem } from '../../../src/components/TransactionItem';
import { EmptyState } from '../../../src/components/EmptyState';
import { Transaction, TransactionType } from '../../../src/types';
import { getCurrentMonth, getCurrentYear } from '../../../src/utils/format';
import { COLORS } from '../../../src/constants';

export default function TransactionsListScreen() {
  const { transactions, fetch, filters, setFilters } = useTransactionStore();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const currentFilters = {
      month: filters.month || getCurrentMonth(),
      year: filters.year || getCurrentYear(),
      ...filters,
    };
    setFilters(currentFilters);
    fetch(currentFilters);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  }, [fetch]);

  const handlePress = useCallback(
    (item: Transaction) => {
      router.push(`/(tabs)/transactions/${item.id}`);
    },
    [router],
  );

  const handleFilter = useCallback(
    (type?: TransactionType) => {
      const newFilters = { ...filters, type };
      setFilters(newFilters);
      fetch(newFilters);
    },
    [filters, setFilters, fetch],
  );

  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => <TransactionItem item={item} onPress={handlePress} />,
    [handlePress],
  );

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <View className="flex-row gap-3 px-4 py-4">
        {[
          { label: 'Todas', value: undefined },
          { label: 'Receitas', value: TransactionType.INCOME },
          { label: 'Despesas', value: TransactionType.EXPENSE },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.label}
            onPress={() => handleFilter(filter.value)}
            className={`rounded-full px-5 py-3 ${
              filters.type === filter.value ? 'bg-[#169670]' : 'border border-[#D6DEE6] bg-white'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                filters.type === filter.value ? 'text-white' : 'text-[#667085]'
              }`}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View className="mt-10">
            <EmptyState
              icon="📋"
              title="Nenhuma transação"
              description="Toque no botão + para adicionar sua primeira transação"
            />
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        onPress={() => router.push('/(tabs)/transactions/create')}
        className="absolute bottom-6 right-4 h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: COLORS.primary }}
        activeOpacity={0.8}
      >
        <Text className="mb-[2px] text-3xl text-white">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
