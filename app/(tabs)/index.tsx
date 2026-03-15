import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { BrandLogo } from "../../src/components/BrandLogo";
import { EmptyState } from "../../src/components/EmptyState";
import { TransactionItem } from "../../src/components/TransactionItem";
import { COLORS } from "../../src/constants";
import { dashboardService } from "../../src/services/dashboardService";
import { useAuthStore } from "../../src/stores/authStore";
import { useTransactionStore } from "../../src/stores/transactionStore";
import { MonthlySummary, Transaction, TransactionType } from "../../src/types";
import {
  formatCurrency,
  getCurrentMonth,
  getCurrentYear,
  getMonthName,
} from "../../src/utils/format";

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { transactions, fetch: fetchTransactions } = useTransactionStore();
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const month = getCurrentMonth();
  const year = getCurrentYear();

  const loadData = useCallback(async () => {
    try {
      const [summaryData] = await Promise.all([
        dashboardService.getSummary(month, year),
        fetchTransactions({ month, year }),
      ]);
      setSummary(summaryData);
    } catch {}
  }, [fetchTransactions, month, year]);

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

  const recentTransactions = transactions.slice(0, 5);
  const balanceValue = summary ? formatCurrency(summary.balance) : "R$ 0,00";
  const displayedBalance = showValues ? balanceValue : "R$ ••••••";
  const quickActions = [
    {
      key: "expense",
      label: "Nova Despesa",
      icon: <Feather name="credit-card" size={18} color="#FF5A52" />,
      iconBackground: "#FFF1F1",
      onPress: () => {
        setIsQuickMenuOpen(false);
        router.push({
          pathname: "/(tabs)/transactions/create",
          params: { type: TransactionType.EXPENSE },
        });
      },
    },
    {
      key: "income",
      label: "Nova Receita",
      icon: <Feather name="credit-card" size={18} color="#169670" />,
      iconBackground: "#EAFBF0",
      onPress: () => {
        setIsQuickMenuOpen(false);
        router.push({
          pathname: "/(tabs)/transactions/create",
          params: { type: TransactionType.INCOME },
        });
      },
    },
    {
      key: "account",
      label: "Nova Conta",
      icon: (
        <MaterialCommunityIcons name="bank-outline" size={18} color="#1D67C1" />
      ),
      iconBackground: "#EAF2FF",
      onPress: () => {
        setIsQuickMenuOpen(false);
        router.push("/(tabs)/accounts/create");
      },
    },
  ];
  const accountCards = summary?.accounts || [];

  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <FlatList
        data={recentTransactions}
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
            <View className="mb-4 flex-row items-center justify-between px-1">
              <BrandLogo />
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/profile')}
                activeOpacity={0.8}
                className="h-11 w-11 items-center justify-center rounded-full bg-[#E9FBF3]"
              >
                <Text className="font-semibold text-[#169670]">
                  {(user?.name || "EA").slice(0, 2).toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="rounded-[24px] bg-[#169670] px-4 pb-5 pt-5">
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-sm text-white/90">Saldo total</Text>
                  <Text className="mt-2 text-[22px] font-bold text-white">
                    {displayedBalance}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowValues((current) => !current)}
                  className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
                  activeOpacity={0.7}
                >
                  <Feather
                    name={showValues ? "eye" : "eye-off"}
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
                      className="mr-3 w-[276px] overflow-hidden rounded-[22px] bg-white px-4 pb-5 pt-4"
                    >
                      <View className="mb-6 h-10 w-10 items-center justify-center rounded-full bg-[#F2F4F7]">
                        <MaterialCommunityIcons
                          name={account.icon as never}
                          size={22}
                          color="#4B5563"
                        />
                      </View>
                      <Text className="text-[28px] font-bold tracking-tight text-[#344054]">
                        {account.institution}
                      </Text>
                      <Text className="mt-1 text-base text-[#667085]">
                        {account.name}
                      </Text>
                      <Text className="mt-8 text-[30px] font-bold text-[#344054]">
                        {formatCurrency(account.balance)}
                      </Text>
                      <Text className="text-base text-[#98A2B3]">
                        Saldo atual
                      </Text>
                      <View
                        className="absolute bottom-0 left-0 right-0 h-[6px] rounded-b-[22px]"
                        style={{ backgroundColor: account.color }}
                      />
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push("/(tabs)/accounts/create")}
                  className="items-center rounded-[26px] border-2 border-dashed border-[#2DCAA0] px-5 py-10"
                  style={{ minHeight: 260 }}
                >
                  <View className="mt-2 h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-white">
                    <Feather name="plus" size={28} color="#FFFFFF" />
                  </View>
                  <Text className="mt-8 text-center text-[17px] font-semibold leading-8 text-white">
                    Cadastre uma{"\n"}nova conta
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="mt-5 rounded-[24px] bg-[#F2F4F7] px-4 py-4">
              <View className="mb-4 flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/transactions")}
                  className="flex-row items-center"
                >
                  <Text className="text-base font-semibold text-[#344054]">
                    Transações
                  </Text>
                  <Text className="ml-2 text-[#667085]">⌄</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/transactions")}
                >
                  <Text className="text-lg text-[#667085]">⌂</Text>
                </TouchableOpacity>
              </View>

              <View className="mb-4 flex-row items-center justify-between px-3">
                <Text className="text-xl text-[#667085]">‹</Text>
                <View className="flex-row items-center">
                  <Text className="mx-4 text-sm text-[#667085]">Abr</Text>
                  <View className="rounded-full bg-white px-5 py-2">
                    <Text className="font-semibold text-[#667085]">
                      {getMonthName(month).slice(0, 3)}
                    </Text>
                  </View>
                  <Text className="mx-4 text-sm text-[#667085]">Jun</Text>
                </View>
                <Text className="text-xl text-[#667085]">›</Text>
              </View>

              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm text-[#98A2B3]">
                  Saldo de {getMonthName(month)}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/transactions")}
                >
                  <Text className="font-medium text-[#169670]">Ver todas</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="px-4">
            <View className="rounded-[24px] bg-[#F2F4F7] p-6">
              <EmptyState
                icon="🔎"
                title="Nenhuma transação"
                description="Você ainda não cadastrou nada, você pode começar por suas contas, depois receitas e despesas :)"
              />
            </View>
          </View>
        }
        ListFooterComponent={<View className="h-3" />}
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      />

      {isQuickMenuOpen ? (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsQuickMenuOpen(false)}
          className="absolute inset-0 bg-black/10"
        >
          <View className="flex-1" />
        </TouchableOpacity>
      ) : null}

      {isQuickMenuOpen ? (
        <View
          className="absolute right-4 w-[168px] rounded-[24px] bg-white px-4 py-3 shadow-sm"
          style={{ bottom: 88 + insets.bottom }}
        >
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.key}
              onPress={action.onPress}
              activeOpacity={0.75}
              className="flex-row items-center py-3"
            >
              <View
                className="mr-3 h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: action.iconBackground }}
              >
                {action.icon}
              </View>
              <Text className="text-[15px] font-medium text-[#344054]">
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <TouchableOpacity
        onPress={() => setIsQuickMenuOpen((current) => !current)}
        activeOpacity={0.85}
        className="absolute right-4 h-14 w-14 items-center justify-center rounded-full"
        style={{
          backgroundColor: COLORS.primary,
          bottom: Math.max(20, insets.bottom + 20),
        }}
      >
        <Text className="mb-[2px] text-3xl text-white">
          {isQuickMenuOpen ? "×" : "+"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
