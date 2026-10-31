import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { PeriodPicker } from '../../../src/components/PeriodPicker';
import { QueryState } from '../../../src/components/QueryState';
import { LoadingSkeleton } from '../../../src/components/LoadingSkeleton';
import { TransactionItem } from '../../../src/components/TransactionItem';
import { Input } from '../../../src/components/ui/Input';
import { Select } from '../../../src/components/ui/Select';
import { Button } from '../../../src/components/ui/Button';
import {
  DateInput,
  isValidDateValue,
} from '../../../src/components/ui/DateInput';
import { useTransactionStore } from '../../../src/stores/transactionStore';
import { useAccountStore } from '../../../src/stores/accountStore';
import { useCategoryStore } from '../../../src/stores/categoryStore';
import { TransactionFilters, TransactionType } from '../../../src/types';
import { getCurrentMonth, getCurrentYear } from '../../../src/utils/format';
export default function TransactionsListScreen() {
  const {
    transactions,
    fetch,
    filters,
    setFilters,
    isLoading,
    error,
    hasMore,
    isLoadingMore,
    loadMore,
  } = useTransactionStore();
  const router = useRouter();
  const accounts = useAccountStore((state) => state.accounts),
    categories = useCategoryStore((state) => state.categories);
  const [search, setSearch] = useState(filters.search || ''),
    [expanded, setExpanded] = useState(false),
    [start, setStart] = useState(filters.startDate || ''),
    [end, setEnd] = useState(filters.endDate || ''),
    [dateError, setDateError] = useState('');
  useFocusEffect(
    useCallback(() => {
      const next = { ...useTransactionStore.getState().filters };
      if (!next.startDate && !next.endDate) {
        next.month ??= getCurrentMonth();
        next.year ??= getCurrentYear();
      }
      setSearch(next.search || '');
      setStart(next.startDate || '');
      setEnd(next.endDate || '');
      setFilters(next);
      void fetch(next);
      void useAccountStore.getState().fetch();
      void useCategoryStore.getState().fetch();
    }, [fetch, setFilters]),
  );
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = {
        ...useTransactionStore.getState().filters,
        search: search.trim() || undefined,
      };
      setFilters(next);
      void fetch(next);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetch, setFilters]);
  const apply = (values: Partial<TransactionFilters>) => {
    const next = { ...filters, ...values };
    setFilters(next);
    void fetch(next);
  };
  const applyDates = () => {
    if (!isValidDateValue(start) || !isValidDateValue(end) || start > end) {
      setDateError(
        'Informe um intervalo válido, com início anterior ou igual ao fim.',
      );
      return;
    }
    setDateError('');
    apply({
      month: undefined,
      year: undefined,
      startDate: start,
      endDate: end,
    });
  };
  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <FlatList
        data={isLoading || error ? [] : transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TransactionItem
            item={item}
            onPress={(tx) => router.push('/(tabs)/transactions/' + tx.id)}
          />
        )}
        ListHeaderComponent={
          <View>
            <ScreenHeader title="Transações" />
            <Input
              label="Buscar por título"
              value={search}
              onChangeText={setSearch}
              placeholder="Ex.: mercado, salário"
            />
            {!filters.startDate ? (
              <PeriodPicker
                month={filters.month || getCurrentMonth()}
                year={filters.year || getCurrentYear()}
                onChange={(period) => {
                  setStart('');
                  setEnd('');
                  apply({
                    ...period,
                    startDate: undefined,
                    endDate: undefined,
                  });
                }}
              />
            ) : null}
            {filters.startDate ? (
              <Text className="mb-3 text-sm text-[#667085]">
                Intervalo: {filters.startDate} a {filters.endDate}
              </Text>
            ) : null}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() => setExpanded(!expanded)}
              className="mb-4 rounded-lg border border-[#D0D5DD] bg-white p-3"
            >
              <Text className="text-center font-semibold text-[#047857]">
                {expanded
                  ? 'Fechar filtros'
                  : 'Conta, categoria e outros filtros'}
              </Text>
            </TouchableOpacity>
            {expanded ? (
              <View className="mb-4 rounded-lg bg-white p-4">
                <Select
                  label="Conta"
                  value={filters.accountId || ''}
                  options={[
                    { value: '', label: 'Todas as contas' },
                    ...accounts.map((a) => ({
                      value: a.id,
                      label: a.name + (a.isArchived ? ' (arquivada)' : ''),
                    })),
                  ]}
                  onChange={(accountId) =>
                    apply({ accountId: accountId || undefined })
                  }
                />
                <Select
                  label="Categoria"
                  value={filters.categoryId || ''}
                  options={[
                    { value: '', label: 'Todas as categorias' },
                    ...categories.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                  onChange={(categoryId) =>
                    apply({ categoryId: categoryId || undefined })
                  }
                />
                <Select
                  label="Tipo"
                  value={filters.type || ''}
                  options={[
                    { value: '', label: 'Receitas e despesas' },
                    { value: 'INCOME', label: 'Receitas' },
                    { value: 'EXPENSE', label: 'Despesas' },
                  ]}
                  onChange={(type) =>
                    apply({
                      type: (type || undefined) as TransactionType | undefined,
                    })
                  }
                />
                <Select
                  label="Situação"
                  value={filters.status || ''}
                  options={[
                    { value: '', label: 'Todas' },
                    { value: 'CONFIRMED', label: 'Confirmados' },
                    { value: 'PLANNED', label: 'Previstos' },
                  ]}
                  onChange={(status) =>
                    apply({
                      status: (status ||
                        undefined) as TransactionFilters['status'],
                    })
                  }
                />
                <Select
                  label="Ordenação"
                  value={
                    (filters.orderBy || 'date') +
                    ':' +
                    (filters.orderDir || 'desc')
                  }
                  options={[
                    { value: 'date:desc', label: 'Mais recentes' },
                    { value: 'date:asc', label: 'Mais antigos' },
                    { value: 'amount:desc', label: 'Maior valor' },
                    { value: 'amount:asc', label: 'Menor valor' },
                  ]}
                  onChange={(value) => {
                    const [orderBy, orderDir] = value.split(':');
                    apply({
                      orderBy: orderBy as 'date' | 'amount',
                      orderDir: orderDir as 'asc' | 'desc',
                    });
                  }}
                />
                <DateInput
                  label="Data inicial"
                  value={start}
                  onChange={setStart}
                />
                <DateInput label="Data final" value={end} onChange={setEnd} />
                {dateError ? (
                  <Text className="mb-3 text-sm text-[#B42318]">
                    {dateError}
                  </Text>
                ) : null}
                <Button title="Aplicar intervalo" onPress={applyDates} />
                <View className="mt-3">
                  <Button
                    title="Limpar intervalo"
                    variant="outline"
                    onPress={() => {
                      setStart('');
                      setEnd('');
                      apply({
                        startDate: undefined,
                        endDate: undefined,
                        month: getCurrentMonth(),
                        year: getCurrentYear(),
                      });
                    }}
                  />
                </View>
              </View>
            ) : null}
            <QueryState
              loading={isLoading}
              error={error}
              retry={() => void fetch(undefined, true)}
            />
          </View>
        }
        ListEmptyComponent={
          !isLoading && !error ? (
            <Text className="p-6 text-center text-[#667085]">
              Nenhum lançamento encontrado para esses filtros.
            </Text>
          ) : undefined
        }
        ListFooterComponent={
          isLoadingMore ? (
            <LoadingSkeleton variant="field" />
          ) : hasMore && !isLoading && !error ? (
            <Button
              title="Carregar mais"
              variant="outline"
              onPress={loadMore}
            />
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}
