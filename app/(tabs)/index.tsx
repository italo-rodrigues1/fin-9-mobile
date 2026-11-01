import { useTheme } from '../../src/theme/ThemeProvider';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { Feather } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandLogo } from '../../src/components/BrandLogo';
import { Button } from '../../src/components/ui/Button';
import { PeriodPicker } from '../../src/components/PeriodPicker';
import { QueryState } from '../../src/components/QueryState';
import { TransactionItem } from '../../src/components/TransactionItem';
import { CreditCardCarousel } from '../../src/components/CreditCardCarousel';
import { AccountCard } from '../../src/components/AccountCard';
import { cardService } from '../../src/services/cardService';
import { GoalCard } from '../../src/components/GoalCard';
import { goalService } from '../../src/services/goalService';
import { FinancialCharts } from '../../src/components/FinancialCharts';
import { useResource } from '../../src/hooks/useResource';
import { usePrivacyStore } from '../../src/stores/privacyStore';
import { useAuthStore } from '../../src/stores/authStore';
import { dashboardService } from '../../src/services/dashboardService';
import { planningService } from '../../src/services/planningService';
import { transactionService } from '../../src/services/transactionService';
import {
  formatCurrency,
  getCurrentMonth,
  getCurrentYear,
  getMonthName,
} from '../../src/utils/format';
export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter(),
    user = useAuthStore((state) => state.user),
    { showValues, toggle } = usePrivacyStore();
  const [period, setPeriod] = useState({
    month: getCurrentMonth(),
    year: getCurrentYear(),
  });
  const { month, year } = period;
  const { data, loading, error, reload } = useResource(
    useCallback(async () => {
      const report = await dashboardService.getSummary(month, year);
      const [recent, budgets, upcoming, goals, cards] = await Promise.all([
        transactionService.getAll({ month, year, take: 5 }),
        planningService.budgets(month, year),
        planningService.upcoming(),
        goalService.overview(),
        cardService.list(),
      ]);
      return { report, recent, budgets, upcoming, goals, cards };
    }, [month, year]),
  );
  const money = (value: number) =>
    showValues ? formatCurrency(value) : 'R$ ••••••';
  return (
    <SafeAreaView className="flex-1 bg-app-background">
      <FlatList
        data={!loading && !error ? data?.recent || [] : []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <TransactionItem
            item={item}
            onPress={(tx) => router.push('/(tabs)/transactions/' + tx.id)}
          />
        )}
        ListHeaderComponent={
          <View>
            <View className="mb-5 flex-row items-center justify-between">
              <BrandLogo />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Abrir perfil"
                onPress={() => router.push('/profile')}
                className="h-11 w-11 items-center justify-center rounded-lg bg-app-primaryLight"
              >
                <Text className="font-bold text-app-primaryText">
                  {(user?.name || 'F9').slice(0, 2).toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>
            <PeriodPicker {...period} onChange={setPeriod} />
            <QueryState loading={loading} error={error} retry={reload} />
            {!loading && !error && data ? (
              <>
                <View className="mb-4 rounded-lg bg-app-primaryDark p-5">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-white">
                      Saldo atual das contas
                    </Text>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={
                        showValues ? 'Ocultar valores' : 'Mostrar valores'
                      }
                      onPress={toggle}
                      className="h-11 w-11 items-center justify-center"
                    >
                      <Feather
                        name={showValues ? 'eye' : 'eye-off'}
                        size={20}
                        color={theme.colors.onPrimary}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-3xl font-bold text-white">
                    {money(data.report.currentBalance)}
                  </Text>
                  <Text className="mt-2 text-xs leading-5 text-white/80">
                    Soma das contas cadastradas. Contas excluídas não entram
                    neste saldo.
                  </Text>
                </View>
                <View className="mb-4 flex-row flex-wrap justify-between">
                  {[
                    {
                      label: 'Receitas do mês',
                      value: data.report.totalIncome,
                      color: theme.colors.primaryText,
                    },
                    {
                      label: 'Despesas do mês',
                      value: data.report.totalExpense,
                      color: theme.colors.danger,
                    },
                    {
                      label: 'Resultado mensal',
                      value: data.report.balance,
                      color: theme.colors.text,
                    },
                    {
                      label: 'Saldo previsto',
                      value: data.report.projectedBalance,
                      color: theme.colors.text,
                    },
                  ].map((item) => (
                    <View
                      key={item.label}
                      style={{ width: '48%' }}
                      className="mb-3 rounded-lg border border-app-border bg-app-surface p-3"
                    >
                      <Text className="text-xs text-app-textMuted">
                        {item.label}
                      </Text>
                      <Text
                        style={{ color: item.color }}
                        className="mt-2 text-lg font-bold"
                      >
                        {money(item.value)}
                      </Text>
                    </View>
                  ))}
                  <Text className="text-xs leading-5 text-app-textMuted">
                    Saldo previsto = saldo atual + receitas previstas − despesas
                    previstas do mês selecionado, incluindo faturas não pagas
                    com vencimento no mês.
                  </Text>
                </View>
                <View className="mb-4 rounded-lg border border-app-border bg-app-surface p-4">
                  <Text className="mb-2 font-semibold text-app-text">
                    Comparação com {getMonthName(data.report.previous.month)}{' '}
                    {data.report.previous.year}
                  </Text>
                  <Text className="text-sm leading-6 text-app-textMuted">
                    Receitas: {money(data.report.previous.totalIncome)} ·
                    despesas: {money(data.report.previous.totalExpense)} ·
                    resultado: {money(data.report.previous.balance)}.
                  </Text>
                  <Text className="mt-2 text-sm text-app-text">
                    Variação do resultado:{' '}
                    {money(data.report.balance - data.report.previous.balance)}.
                  </Text>
                </View>
                <FinancialCharts report={data.report} />
                <View className="mb-4">
                  <View className="mb-3 flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-app-text">
                      Cartões de crédito
                    </Text>
                    <TouchableOpacity
                      accessibilityRole="button"
                      onPress={() => router.push('/cards')}
                    >
                      <Text className="p-2 font-semibold text-app-primaryText">
                        Ver cartões
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {data.cards.filter((c) => !c.isArchived).length ? (
                    <CreditCardCarousel
                      cards={data.cards.filter((c) => !c.isArchived)}
                      onOpen={(c) =>
                        router.push({
                          pathname: '/cards/detail',
                          params: { id: c.id },
                        })
                      }
                    />
                  ) : (
                    <Button
                      title="Cadastrar cartão"
                      variant="outline"
                      onPress={() => router.push('/cards/edit')}
                    />
                  )}
                </View>
                <View className="mb-4">
                  <View className="mb-3 flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-app-text">
                      Metas financeiras
                    </Text>
                    <TouchableOpacity
                      accessibilityRole="button"
                      onPress={() => router.push('/goals')}
                    >
                      <Text className="p-2 font-semibold text-app-primaryText">
                        Ver metas
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="mb-3 text-sm leading-6 text-app-textMuted">
                    Dinheiro já incluído no saldo das contas. O progresso
                    considera o saldo atual.
                  </Text>
                  {data.goals.goals.length ? (
                    data.goals.goals.slice(0, 3).map((goal) => (
                      <TouchableOpacity
                        key={goal.id}
                        accessibilityRole="button"
                        accessibilityLabel={'Abrir meta ' + goal.name}
                        onPress={() =>
                          router.push({
                            pathname: '/goals/detail',
                            params: { id: goal.id },
                          })
                        }
                      >
                        <GoalCard goal={goal} />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Button
                      title="Criar primeira meta"
                      variant="outline"
                      onPress={() => router.push('/goals/edit')}
                    />
                  )}
                </View>
                <View className="mb-4">
                  <Text className="mb-3 text-base font-semibold text-app-text">
                    Minhas contas
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {data.report.accounts
                      .filter((a) => !a.isArchived)
                      .map((account) => (
                        <AccountCard
                          key={account.id}
                          account={account}
                          compact
                          onPress={() =>
                            router.push({
                              pathname: '/accounts/detail',
                              params: { id: account.id },
                            })
                          }
                        />
                      ))}
                  </ScrollView>
                  {!data.report.accounts.some((a) => !a.isArchived) ? (
                    <Button
                      title="Cadastrar conta"
                      onPress={() => router.push('/accounts/create')}
                    />
                  ) : null}
                </View>
                {data.upcoming.length ? (
                  <View className="mb-4 rounded-lg border border-app-warningBorder bg-app-warningBackground p-4">
                    <Text className="font-semibold text-app-warning">
                      Próximos compromissos
                    </Text>
                    {data.upcoming.slice(0, 3).map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        accessibilityRole="button"
                        onPress={() =>
                          router.push('/(tabs)/transactions/' + item.id)
                        }
                        className="mt-3"
                      >
                        <Text className="text-sm text-app-textSecondary">
                          {item.date
                            .slice(0, 10)
                            .split('-')
                            .reverse()
                            .join('/')}{' '}
                          · {item.title} · {money(item.amount)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      accessibilityRole="button"
                      onPress={() => router.push('/planning')}
                    >
                      <Text className="mt-3 font-semibold text-app-primaryText">
                        Ver planejamento
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                {data.budgets
                  .filter((b) => b.alert !== 'OK')
                  .map((b) => (
                    <TouchableOpacity
                      key={b.id}
                      onPress={() => router.push('/budgets')}
                      className="mb-3 rounded-lg border border-app-dangerBorder bg-app-dangerBackground p-4"
                    >
                      <Text className="font-semibold text-app-danger">
                        {b.category.name}:{' '}
                        {showValues
                          ? b.percentage + '% do orçamento utilizado'
                          : 'alerta de orçamento'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                <View className="mb-4 mt-2 flex-row justify-between">
                  <Text className="text-base font-semibold text-app-text">
                    Movimentações do mês
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      useTransactionStore
                        .getState()
                        .setFilters({ month, year });
                      router.push('/(tabs)/transactions');
                    }}
                  >
                    <Text className="font-semibold text-app-primaryText">
                      Ver todas
                    </Text>
                  </TouchableOpacity>
                </View>
                {!data.recent.length ? (
                  <Text className="mb-5 text-app-textMuted">
                    Nenhum lançamento nesse mês.
                  </Text>
                ) : null}
              </>
            ) : null}
          </View>
        }
      />
    </SafeAreaView>
  );
}
