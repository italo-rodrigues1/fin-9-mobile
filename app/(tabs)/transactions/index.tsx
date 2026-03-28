import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { EmptyState } from "../../../src/components/EmptyState";
import { QuickActionsMenu } from "../../../src/components/layout/QuickActionsMenu";
import { TransactionItem } from "../../../src/components/TransactionItem";
import { TransactionItemSkeletonMemoized } from "../../../src/components/TransactionItemSkeleton";
import { useTransactionStore } from "../../../src/stores/transactionStore";
import { useTheme } from "../../../src/theme/useTheme";
import { Transaction, TransactionType } from "../../../src/types";
import { getCurrentMonth, getCurrentYear } from "../../../src/utils/format";

export default function TransactionsListScreen() {
  const { transactions, fetch, filters, setFilters, isLoading } = useTransactionStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

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
    [fetch, filters, setFilters],
  );

  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionItem item={item} onPress={handlePress} />
    ),
    [handlePress],
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-row gap-3 px-4 py-4">
        {[
          { label: "Todas", value: undefined },
          { label: "Receitas", value: TransactionType.INCOME },
          { label: "Despesas", value: TransactionType.EXPENSE },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.label}
            onPress={() => handleFilter(filter.value)}
            className="rounded-full px-5 py-3"
            style={{
              backgroundColor:
                filters.type === filter.value
                  ? colors.chipActive
                  : colors.chipInactive,
              borderWidth: filters.type === filter.value ? 0 : 1,
              borderColor: colors.border,
            }}
          >
            <Text
              className="text-sm font-semibold"
              style={{
                color:
                  filters.type === filter.value
                    ? colors.chipActiveText
                    : colors.chipInactiveText,
              }}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={isLoading && transactions.length === 0 ? Array(5).fill(0).map((_, i) => ({ id: `skeleton-${i}` } as any)) : transactions}
        renderItem={(props) => (isLoading && transactions.length === 0) ? <TransactionItemSkeletonMemoized /> : renderItem(props)}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
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

      <QuickActionsMenu
        isOpen={isQuickMenuOpen}
        onToggle={() => setIsQuickMenuOpen((current) => !current)}
      />
    </SafeAreaView>
  );
}
