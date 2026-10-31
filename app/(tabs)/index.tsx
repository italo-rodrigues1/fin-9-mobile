import { notify } from '../../src/stores/feedbackStore';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { QueryState } from '../../src/components/QueryState';
import { usePrivacyStore } from '../../src/stores/privacyStore';
import { BrandLogo } from '../../src/components/BrandLogo';
import { EmptyState } from '../../src/components/EmptyState';
import { QuickAddMenu } from '../../src/components/QuickAddMenu';
import { TransactionItem } from '../../src/components/TransactionItem';
import { COLORS } from '../../src/constants';
import { dashboardService } from '../../src/services/dashboardService';
import { useAccountStore } from '../../src/stores/accountStore';
import { useAuthStore } from '../../src/stores/authStore';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { Account, MonthlySummary, Transaction } from '../../src/types';
import { confirmAction } from '../../src/utils/confirmAction';
import {
  formatCurrency,
  getCurrentMonth,
  getCurrentYear,
  getMonthName,
} from '../../src/utils/format';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const {
    transactions,
    fetch: fetchTransactions,
    setFilters: setTransactionFilters,
  } = useTransactionStore();
  const {
    accounts,
    fetch: fetchAccounts,
    remove: removeAccount,
  } = useAccountStore();
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { showValues, toggle: toggleValues } = usePrivacyStore();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const accountError = useAccountStore((state) => state.error);
  const transactionError = useTransactionStore((state) => state.error);
  const [selectedPeriod, setSelectedPeriod] = useState(() => ({
    month: getCurrentMonth(),
    year: getCurrentYear(),
  }));
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { month, year } = selectedPeriod;

  const changeMonth = useCallback((offset: number) => {
    setSelectedPeriod((current) => {
      const next = new Date(current.year, current.month - 1 + offset, 1);
      return { month: next.getMonth() + 1, year: next.getFullYear() };
    });
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setTransactionFilters({ month, year });
      const [summaryData] = await Promise.all([
        dashboardService.getSummary(month, year),
        fetchTransactions({ month, year }),
        fetchAccounts(),
      ]);
      setSummary(summaryData);
    } catch {
      setLoadError('Não foi possível atualizar suas informações.');
    } finally {
      setLoading(false);
    }
  }, [fetchAccounts, fetchTransactions, month, setTransactionFilters, year]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleTransactionPress = useCallback(
    (item: Transaction) => {
      router.push(`/(tabs)/transactions/${item.id}`);
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionItem item={item} onPress={handleTransactionPress} />
    ),
    [handleTransactionPress],
  );

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  const handleDeleteAccount = useCallback(
    async (account: Account) => {
      const confirmed = await confirmAction(
        'Excluir conta',
        `Tem certeza que deseja excluir a conta ${account.name}?`,
        'Excluir',
      );
      if (!confirmed) return;

      try {
        await removeAccount(account.id);
      } catch (error: any) {
        notify(error.message);
      }
    },
    [removeAccount],
  );

  const recentTransactions = transactions.slice(0, 5);
  const totalAccountBalance = accounts.reduce(
    (total, account) => total + account.balance,
    0,
  );
  const balanceValue = formatCurrency(totalAccountBalance);
  const displayedBalance = showValues ? balanceValue : 'R$ ••••••';
  const accountCards = accounts;
  const currentMonthLabel = getMonthName(month).slice(0, 3);

  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <FlatList
        data={
          loading || loadError || transactionError ? [] : recentTransactions
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
        ListHeaderComponent={
          <View className="px-4 pb-6 pt-4">
            <QueryState
              loading={loading}
              error={loadError || accountError || transactionError}
              retry={loadData}
            />
            <View className="mb-4 flex-row items-center justify-between px-1">
              <BrandLogo />
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/profile')}
                activeOpacity={0.8}
                className="h-11 w-11 items-center justify-center rounded-lg bg-[#E9FBF3]"
              >
                <Text className="font-semibold text-[#169670]">
                  {(user?.name || 'EA').slice(0, 2).toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="rounded-lg bg-[#064E3B] px-5 pb-5 pt-5">
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-sm text-white/90">Saldo total</Text>
                  <Text className="mt-2 text-[22px] font-bold text-white">
                    {displayedBalance}
                  </Text>
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={
                    showValues ? 'Ocultar valores' : 'Mostrar valores'
                  }
                  onPress={() => toggleValues()}
                  className="h-10 w-10 items-center justify-center rounded-lg bg-white/15"
                  activeOpacity={0.7}
                >
                  <Feather
                    name={showValues ? 'eye' : 'eye-off'}
                    size={18}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              <View className="mb-3 mt-8 flex-row items-center justify-between">
                <Text className="text-xl font-semibold text-white">
                  Minhas Contas
                </Text>
              </View>

              {accountCards.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 8 }}
                >
                  {accountCards.map((account) => (
                    <View
                      key={account.id}
                      className="mr-3 w-[276px] overflow-hidden rounded-lg bg-white px-4 pb-5 pt-4"
                    >
                      <View className="mb-4 flex-row items-center justify-between">
                        <View className="h-10 w-10 items-center justify-center rounded-lg bg-[#F2F4F7]">
                          <MaterialCommunityIcons
                            name={account.icon as never}
                            size={22}
                            color="#4B5563"
                          />
                        </View>
                        <TouchableOpacity
                          onPress={() => handleDeleteAccount(account)}
                          className="h-10 w-10 items-center justify-center rounded-lg bg-[#FFF1F1]"
                          accessibilityLabel={`Excluir conta ${account.name}`}
                        >
                          <MaterialCommunityIcons
                            name="trash-can-outline"
                            size={20}
                            color="#D92D20"
                          />
                        </TouchableOpacity>
                      </View>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className="text-[20px] font-bold tracking-tight text-[#344054]"
                      >
                        {account.institution}
                      </Text>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className="mt-1 text-base text-[#667085]"
                      >
                        {account.name}
                      </Text>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className="mt-4 text-[24px] font-bold text-[#344054]"
                        accessibilityLabel={
                          showValues
                            ? `Saldo ${showValues ? formatCurrency(account.balance) : 'R$ ••••••'}`
                            : 'Saldo oculto'
                        }
                      >
                        {showValues
                          ? formatCurrency(account.balance)
                          : 'R$ ••••••'}
                      </Text>
                      <Text className="text-base text-[#667085]">
                        Saldo atual
                      </Text>
                      <View
                        className="absolute bottom-0 left-0 right-0 h-[6px] rounded-b-lg"
                        style={{ backgroundColor: account.color }}
                      />
                    </View>
                  ))}
                </ScrollView>
              ) : loading || accountError ? null : (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push('/accounts/create')}
                  className="items-center rounded-lg border-2 border-dashed border-[#2DCAA0] px-5 py-10"
                  style={{ minHeight: 140 }}
                >
                  <View className="mt-2 h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-white">
                    <Feather name="credit-card" size={28} color="#FFFFFF" />
                  </View>
                  <Text className="mt-8 text-center text-[17px] font-semibold leading-8 text-white">
                    Cadastre uma{'\n'}nova conta
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="mt-5 rounded-lg bg-[#F2F4F7] px-4 py-4">
              <QueryState
                loading={loading}
                error={loadError || accountError || transactionError}
                retry={loadData}
              />
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-base font-semibold text-[#344054]">
                  Transações
                </Text>

                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/transactions')}
                >
                  <Text className="font-medium text-[#169670]">Ver todas</Text>
                </TouchableOpacity>
              </View>

              <QueryState
                loading={loading}
                error={loadError || accountError || transactionError}
                retry={loadData}
              />
              <View className="mb-4 flex-row items-center justify-between px-3">
                <TouchableOpacity
                  onPress={() => changeMonth(-1)}
                  accessibilityRole="button"
                  accessibilityLabel="Mês anterior"
                  className="h-11 w-11 items-center justify-center rounded-lg bg-white"
                >
                  <Feather name="chevron-left" size={22} color="#667085" />
                </TouchableOpacity>
                <View className="rounded-lg bg-white px-6 py-3">
                  <Text className="font-semibold capitalize text-[#344054]">
                    {currentMonthLabel} {year}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => changeMonth(1)}
                  accessibilityRole="button"
                  accessibilityLabel="Próximo mês"
                  className="h-11 w-11 items-center justify-center rounded-lg bg-white"
                >
                  <Feather name="chevron-right" size={22} color="#667085" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading || loadError || transactionError ? undefined : (
            <View className="px-4">
              <View className="rounded-lg bg-[#F2F4F7] p-6">
                <EmptyState
                  icon="🔎"
                  title="Nenhuma transação"
                  description="Você ainda não cadastrou nada, você pode começar por suas contas, depois receitas e despesas :)"
                />
              </View>
            </View>
          )
        }
        ListFooterComponent={<View className="h-3" />}
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      />

      <QuickAddMenu />
    </SafeAreaView>
  );
}
