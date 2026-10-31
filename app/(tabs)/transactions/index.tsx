import { QueryState } from '../../../src/components/QueryState';
import React, { useEffect, useCallback, useState } from 'react';
import {
  Alert,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransactionStore } from '../../../src/stores/transactionStore';
import { TransactionItem } from '../../../src/components/TransactionItem';
import { EmptyState } from '../../../src/components/EmptyState';
import { QuickAddMenu } from '../../../src/components/QuickAddMenu';
import {
  DateInput,
  isValidDateValue,
} from '../../../src/components/ui/DateInput';
import { Transaction, TransactionType } from '../../../src/types';
import {
  getCurrentMonth,
  getCurrentYear,
  getMonthName,
} from '../../../src/utils/format';
import { COLORS } from '../../../src/constants';

export default function TransactionsListScreen() {
  const { transactions, fetch, filters, setFilters, isLoading, error } =
    useTransactionStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showDateFilters, setShowDateFilters] = useState(
    Boolean(filters.startDate || filters.endDate),
  );
  const [startDate, setStartDate] = useState(filters.startDate ?? '');
  const [endDate, setEndDate] = useState(filters.endDate ?? '');
  const router = useRouter();

  useEffect(() => {
    const hasCustomRange = Boolean(filters.startDate || filters.endDate);
    const currentFilters = hasCustomRange
      ? filters
      : {
          ...filters,
          month: filters.month || getCurrentMonth(),
          year: filters.year || getCurrentYear(),
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

  const changeMonth = (offset: number) => {
    const currentMonth = filters.month ?? getCurrentMonth();
    const currentYear = filters.year ?? getCurrentYear();
    const nextDate = new Date(currentYear, currentMonth - 1 + offset, 1);
    const newFilters = {
      ...filters,
      month: nextDate.getMonth() + 1,
      year: nextDate.getFullYear(),
      startDate: undefined,
      endDate: undefined,
    };

    setStartDate('');
    setEndDate('');
    setFilters(newFilters);
    void fetch(newFilters);
  };

  const applyDateRange = () => {
    if (!isValidDateValue(startDate) || !isValidDateValue(endDate)) {
      Alert.alert(
        'Atenção',
        'Informe uma data inicial e uma data final válidas',
      );
      return;
    }
    if (startDate > endDate) {
      Alert.alert(
        'Atenção',
        'A data inicial não pode ser posterior à data final',
      );
      return;
    }

    const newFilters = {
      ...filters,
      month: undefined,
      year: undefined,
      startDate,
      endDate,
    };
    setFilters(newFilters);
    void fetch(newFilters);
    setShowDateFilters(false);
  };

  const resetDateRange = () => {
    const newFilters = {
      ...filters,
      month: getCurrentMonth(),
      year: getCurrentYear(),
      startDate: undefined,
      endDate: undefined,
    };
    setStartDate('');
    setEndDate('');
    setFilters(newFilters);
    void fetch(newFilters);
    setShowDateFilters(false);
  };

  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionItem item={item} onPress={handlePress} />
    ),
    [handlePress],
  );

  const keyExtractor = useCallback((item: Transaction) => item.id, []);
  const isCustomRange = Boolean(filters.startDate && filters.endDate);
  const periodLabel = isCustomRange
    ? `${filters.startDate?.split('-').reverse().join('/')} a ${filters.endDate?.split('-').reverse().join('/')}`
    : `${getMonthName(filters.month ?? getCurrentMonth())} de ${filters.year ?? getCurrentYear()}`;

  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <View className="mx-4 mt-4 rounded-lg border border-[#E4E7EC] bg-white p-3">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => changeMonth(-1)}
            accessibilityRole="button"
            accessibilityLabel="Mês anterior"
            className="h-11 w-11 items-center justify-center rounded-full bg-[#F2F4F7]"
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color="#667085"
            />
          </TouchableOpacity>
          <View className="flex-1 items-center px-2">
            <Text className="text-xs font-medium text-[#667085]">Período</Text>
            <Text className="mt-1 text-center text-sm font-semibold capitalize text-[#344054]">
              {periodLabel}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => changeMonth(1)}
            accessibilityRole="button"
            accessibilityLabel="Próximo mês"
            className="h-11 w-11 items-center justify-center rounded-full bg-[#F2F4F7]"
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#667085"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => setShowDateFilters((current) => !current)}
          className="mt-3 flex-row items-center justify-center rounded-lg bg-[#EAFBF0] px-4 py-3"
          accessibilityRole="button"
          accessibilityState={{ expanded: showDateFilters }}
        >
          <MaterialCommunityIcons
            name="calendar-filter"
            size={19}
            color="#169670"
          />
          <Text className="ml-2 font-semibold text-[#169670]">
            {showDateFilters
              ? 'Fechar filtro por data'
              : 'Filtrar por intervalo de datas'}
          </Text>
        </TouchableOpacity>

        {showDateFilters ? (
          <View className="mt-4 border-t border-[#EAECF0] pt-4">
            <DateInput
              label="Data inicial"
              value={startDate}
              onChange={setStartDate}
            />
            <DateInput
              label="Data final"
              value={endDate}
              onChange={setEndDate}
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={resetDateRange}
                className="flex-1 items-center rounded-lg border border-[#D0D5DD] bg-white px-3 py-3"
              >
                <Text className="font-semibold text-[#667085]">Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyDateRange}
                className="flex-1 items-center rounded-lg bg-[#169670] px-3 py-3"
              >
                <Text className="font-semibold text-white">Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>

      <View className="flex-row gap-2 px-4 py-4">
        {[
          { label: 'Todas', value: undefined },
          { label: 'Receitas', value: TransactionType.INCOME },
          { label: 'Despesas', value: TransactionType.EXPENSE },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.label}
            onPress={() => handleFilter(filter.value)}
            className={`flex-1 items-center rounded-full px-3 py-3 ${
              filters.type === filter.value
                ? 'bg-[#169670]'
                : 'border border-[#D6DEE6] bg-white'
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
        data={isLoading || error ? [] : transactions}
        ListHeaderComponent={
          <QueryState
            loading={isLoading}
            error={error}
            retry={() => void fetch()}
          />
        }
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          isLoading || error ? undefined : (
            <View className="mt-10">
              <EmptyState
                icon="📋"
                title="Nenhuma transação"
                description="Toque no botão + para adicionar sua primeira transação"
              />
            </View>
          )
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      <QuickAddMenu />
    </SafeAreaView>
  );
}
