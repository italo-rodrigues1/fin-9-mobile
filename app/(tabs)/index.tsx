import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Modal,
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
import { AccountCardSkeleton } from "../../src/components/AccountCardSkeleton";
import { BrandLogo } from "../../src/components/BrandLogo";
import { EmptyState } from "../../src/components/EmptyState";
import { QuickActionsMenu } from "../../src/components/layout/QuickActionsMenu";
import { TransactionItem } from "../../src/components/TransactionItem";
import { TransactionItemSkeletonMemoized } from "../../src/components/TransactionItemSkeleton";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { dashboardService } from "../../src/services/dashboardService";
import { useAuthStore } from "../../src/stores/authStore";
import { useTransactionStore } from "../../src/stores/transactionStore";
import { useTheme } from "../../src/theme/useTheme";
import { MonthlySummary, Transaction } from "../../src/types";
import {
  formatCurrency,
  getCurrentMonth,
  getCurrentYear,
  getMonthName,
} from "../../src/utils/format";

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { transactions, fetch: fetchTransactions, setFilters } = useTransactionStore();
  const [summary, setSummary] = useState<MonthlySummary | null>(null);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showValues, setShowValues] = useState(true);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const loadData = useCallback(async () => {
    try {
      if (!refreshing) setIsLoading(true);
      const [summaryData] = await Promise.all([
        dashboardService.getSummary(selectedMonth, selectedYear),
        fetchTransactions({ month: selectedMonth, year: selectedYear, accountId: selectedAccountId }),
      ]);
      setSummary(summaryData);
    } catch { } finally { setIsLoading(false); }
  }, [fetchTransactions, selectedMonth, selectedYear, selectedAccountId, refreshing]);

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

  const handlePreviousMonth = () => {
    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const handleNextMonth = () => {
    let newMonth = selectedMonth + 1;
    let newYear = selectedYear;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const handleSelectMonth = (month: number) => {
    setSelectedMonth(month);
    setIsMonthPickerVisible(false);
  };

  const handleSelectYear = (year: number) => {
    setSelectedYear(year);
  };

  const handleViewAllTransactions = () => {
    setFilters({ month: selectedMonth, year: selectedYear, accountId: selectedAccountId });
    router.push("/(tabs)/transactions");
  };

  const recentTransactions = transactions.slice(0, 5);
  const balanceValue = summary ? formatCurrency(summary.balance) : "R$ 0,00";
  const displayedBalance = showValues ? balanceValue : "R$ ••••••";
  const accountCards = summary?.accounts || [];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pb-6 pt-4">
          <View className="mb-4 flex-row items-center justify-between px-1">
            <BrandLogo />
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile")}
              activeOpacity={0.8}
              className="h-11 w-11 items-center justify-center rounded-full border"
              style={{
                backgroundColor: colors.avatar,
                borderColor: colors.borderStrong,
              }}
            >
              <Text className="font-semibold" style={{ color: colors.avatarText }}>
                {(user?.name || "EA").slice(0, 2).toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            className="rounded-[24px] px-4 pb-5 pt-5"
            style={{ backgroundColor: colors.primary }}
          >
            <View className="flex-row items-start justify-between">
              <View>
                <Text
                  className="text-sm"
                  style={{ color: isDark ? "#052E25" : "rgba(255,255,255,0.9)" }}
                >
                  Saldo total
                </Text>
                {isLoading ? (
                  <View className="mt-2 h-[33px] justify-center">
                    <Skeleton width={140} height={32} borderRadius={6} />
                  </View>
                ) : (
                  <Text
                    className="mt-2 text-[22px] font-bold"
                    style={{ color: isDark ? "#052E25" : "#FFFFFF" }}
                  >
                    {displayedBalance}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setShowValues((current) => !current)}
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isDark
                    ? "rgba(5,46,37,0.15)"
                    : "rgba(255,255,255,0.15)",
                }}
                activeOpacity={0.7}
              >
                <Feather
                  name={showValues ? "eye" : "eye-off"}
                  size={18}
                  color={isDark ? "#052E25" : "#FFFFFF"}
                />
              </TouchableOpacity>
            </View>

            <View className="mb-3 mt-8 flex-row items-center justify-between">
              <Text
                className="text-xl font-semibold"
                style={{ color: isDark ? "#052E25" : "#FFFFFF" }}
              >
                Minhas Contas
              </Text>
            </View>

            {isLoading ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 8 }}
              >
                <AccountCardSkeleton />
                <AccountCardSkeleton />
              </ScrollView>
            ) : accountCards.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 8 }}
              >
                {accountCards.map((account) => (
                  <View
                    key={account.id}
                    className="mr-3 w-[276px] overflow-hidden rounded-[22px] px-4 pb-5 pt-4"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <View
                      className="mb-6 h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: colors.backgroundMuted }}
                    >
                      <MaterialCommunityIcons
                        name={account.icon as never}
                        size={22}
                        color={colors.textSecondary}
                      />
                    </View>
                    <Text
                      className="text-[28px] font-bold tracking-tight"
                      style={{ color: colors.text }}
                    >
                      {account.institution}
                    </Text>
                    <Text className="mt-1 text-base" style={{ color: colors.textSecondary }}>
                      {account.name}
                    </Text>
                    <Text
                      className="mt-8 text-[30px] font-bold"
                      style={{ color: colors.text }}
                    >
                      {formatCurrency(account.balance)}
                    </Text>
                    <Text className="text-base" style={{ color: colors.textMuted }}>
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
                className="items-center rounded-[26px] border-2 border-dashed px-5 py-10"
                style={{
                  minHeight: 260,
                  borderColor: isDark ? "#0F6E57" : "#2DCAA0",
                }}
              >
                <View className="mt-2 h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-white">
                  <Feather name="plus" size={28} color="#FFFFFF" />
                </View>
                <Text
                  className="mt-8 text-center text-[17px] font-semibold leading-8"
                  style={{ color: isDark ? "#052E25" : "#FFFFFF" }}
                >
                  Cadastre uma{"\n"}nova conta
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Account Filter */}
          {!isLoading && accountCards.length > 0 && (
            <View className="mt-4 mb-1">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  onPress={() => setSelectedAccountId(undefined)}
                  className="mr-2 rounded-full px-4 py-2 border"
                  style={{
                    backgroundColor: !selectedAccountId ? colors.primary : colors.surface,
                    borderColor: !selectedAccountId ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    className="font-medium"
                    style={{ color: !selectedAccountId ? '#FFFFFF' : colors.textSecondary }}
                  >
                    Todas as contas
                  </Text>
                </TouchableOpacity>
                {accountCards.map(acc => (
                  <TouchableOpacity
                    key={acc.id}
                    onPress={() => setSelectedAccountId(acc.id)}
                    className="mr-2 rounded-full px-4 py-2 border"
                    style={{
                      backgroundColor: selectedAccountId === acc.id ? colors.primary : colors.surface,
                      borderColor: selectedAccountId === acc.id ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      className="font-medium"
                      style={{ color: selectedAccountId === acc.id ? '#FFFFFF' : colors.textSecondary }}
                    >
                      {acc.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Unified Transactions Box */}
          <View
            className="mt-4 rounded-[24px]"
            style={{ backgroundColor: colors.backgroundMuted }}
          >
            <View className="px-4 pt-4 pb-2">
              <View className="mb-4 flex-row items-center justify-between">
                <TouchableOpacity
                  className="flex-row items-center"
                >
                  <Text className="text-base font-semibold" style={{ color: colors.text }}>
                    Transações
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsMonthPickerVisible(true)} activeOpacity={0.7}>
                  <Feather name="calendar" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View className="mb-4 flex-row items-center justify-between px-3">
                <TouchableOpacity onPress={handlePreviousMonth}>
                  <Text className="text-xl" style={{ color: colors.textSecondary, padding: 8 }}>
                    ‹
                  </Text>
                </TouchableOpacity>

                <View className="flex-row items-center">
                  <View
                    className="rounded-full px-5 py-2 mx-2"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Text className="font-semibold" style={{ color: colors.textSecondary }}>
                      {getMonthName(selectedMonth).slice(0, 3)} {selectedYear}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity onPress={handleNextMonth}>
                  <Text className="text-xl" style={{ color: colors.textSecondary, padding: 8 }}>
                    ›
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm" style={{ color: colors.textMuted }}>
                  Saldo de {getMonthName(selectedMonth)}
                </Text>
                <TouchableOpacity
                  onPress={handleViewAllTransactions}
                >
                  <Text className="font-medium" style={{ color: colors.primary }}>
                    Ver de {getMonthName(selectedMonth)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* List of transactions inside the box */}
            <View className="px-4 pb-4">
              {isLoading ? (
                <View className="mt-2">
                  <TransactionItemSkeletonMemoized />
                  <TransactionItemSkeletonMemoized />
                  <TransactionItemSkeletonMemoized />
                  <TransactionItemSkeletonMemoized />
                  <TransactionItemSkeletonMemoized />
                </View>
              ) : recentTransactions.length > 0 ? (
                recentTransactions.map(item => (
                  <TransactionItem
                    key={item.id}
                    item={item}
                    onPress={handleTransactionPress}
                  />
                ))
              ) : (
                <View
                  className="rounded-[18px] p-6 mt-2"
                  style={{ backgroundColor: colors.surface }}
                >
                  <EmptyState
                    icon="🔎"
                    title="Nenhuma transação"
                    description={`Você ainda não possui transações cadastradas em ${getMonthName(selectedMonth)}.`}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <QuickActionsMenu
        isOpen={isQuickMenuOpen}
        onToggle={() => setIsQuickMenuOpen((current) => !current)}
      />

      {/* Month & Year Picker Modal */}
      <Modal
        visible={isMonthPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMonthPickerVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 items-center justify-center bg-black/60 px-6"
          activeOpacity={1}
          onPress={() => setIsMonthPickerVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            className="w-full rounded-[32px] p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="mb-6 flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => handleSelectYear(selectedYear - 1)}
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.backgroundMuted }}
              >
                <Feather name="chevron-left" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text className="text-xl font-bold" style={{ color: colors.text }}>
                {selectedYear}
              </Text>
              <TouchableOpacity
                onPress={() => handleSelectYear(selectedYear + 1)}
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.backgroundMuted }}
              >
                <Feather name="chevron-right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap justify-between">
              {Array.from({ length: 12 }).map((_, i) => {
                const monthIndex = i + 1;
                const isSelected = selectedMonth === monthIndex;
                const isCurrent = getCurrentMonth() === monthIndex && getCurrentYear() === selectedYear;

                return (
                  <TouchableOpacity
                    key={monthIndex}
                    onPress={() => handleSelectMonth(monthIndex)}
                    className="mb-3 h-14 w-[31%] items-center justify-center rounded-2xl border"
                    style={{
                      backgroundColor: isSelected ? colors.primary : "transparent",
                      borderColor: isSelected ? colors.primary : isCurrent ? colors.primary + "40" : colors.border,
                      borderWidth: isSelected || isCurrent ? 2 : 1,
                    }}
                  >
                    <Text
                      className="text-sm font-semibold capitalize"
                      style={{
                        color: isSelected ? "#FFFFFF" : colors.textSecondary,
                      }}
                    >
                      {getMonthName(monthIndex).slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => {
                setSelectedMonth(getCurrentMonth());
                setSelectedYear(getCurrentYear());
                setIsMonthPickerVisible(false);
              }}
              className="mt-4 items-center justify-center py-3"
            >
              <Text className="font-semibold" style={{ color: colors.primary }}>
                Ir para mês atual
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
