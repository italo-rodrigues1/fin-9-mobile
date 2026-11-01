import { useTheme } from '../theme/ThemeProvider';
import { Text, View } from 'react-native';
import { FinancialReport, TransactionType } from '../types';
import { usePrivacyStore } from '../stores/privacyStore';
import { formatCurrency, getMonthName } from '../utils/format';
export function FinancialCharts({ report }: { report: FinancialReport }) {
  const theme = useTheme();
  const visible = usePrivacyStore((state) => state.showValues);
  if (!visible)
    return (
      <Text className="my-4 text-sm text-app-textMuted">
        Gráficos ocultos enquanto os valores estão protegidos.
      </Text>
    );
  const history = report.history,
    peak = Math.max(
      1,
      ...history.flatMap((row) => [row.totalIncome, row.totalExpense]),
    );
  const categories = report.byCategory
    .filter((row) => row.type === TransactionType.EXPENSE)
    .sort((a, b) => b.total - a.total);
  return (
    <>
      <View className="mb-4 rounded-lg border border-app-border bg-app-surface p-4">
        <Text className="mb-1 text-base font-semibold text-app-text">
          Receitas e despesas
        </Text>
        <Text className="mb-4 text-xs text-app-textMuted">
          Últimos seis meses · receitas em verde, despesas em vermelho
        </Text>
        {history.every((row) => !row.totalIncome && !row.totalExpense) ? (
          <Text className="py-4 text-app-textMuted">
            Nenhuma movimentação confirmada nesse período.
          </Text>
        ) : (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            className="h-36 flex-row items-end justify-around border-b border-app-border"
          >
            {history.map((row) => (
              <View
                key={row.year + '-' + row.month}
                className="h-full flex-1 items-center justify-end"
              >
                <View
                  className="flex-row items-end gap-1"
                  style={{ height: 110 }}
                >
                  <View
                    style={{
                      width: 12,
                      height: Math.max(0, (row.totalIncome / peak) * 104),
                      backgroundColor: theme.colors.primary,
                      borderTopLeftRadius: 3,
                      borderTopRightRadius: 3,
                    }}
                  />
                  <View
                    style={{
                      width: 12,
                      height: Math.max(0, (row.totalExpense / peak) * 104),
                      backgroundColor: theme.colors.danger,
                      borderTopLeftRadius: 3,
                      borderTopRightRadius: 3,
                    }}
                  />
                </View>
                <Text className="my-2 text-[10px] text-app-textSecondary">
                  {getMonthName(row.month).slice(0, 3)}
                </Text>
              </View>
            ))}
          </View>
        )}
        {history.map((row) => (
          <Text
            key={row.year + '-' + row.month}
            className="mt-2 text-xs text-app-textSecondary"
          >
            {getMonthName(row.month).slice(0, 3)}/{row.year}: receitas{' '}
            {formatCurrency(row.totalIncome)} · despesas{' '}
            {formatCurrency(row.totalExpense)}
          </Text>
        ))}
      </View>
      <View className="mb-4 rounded-lg border border-app-border bg-app-surface p-4">
        <Text className="mb-4 text-base font-semibold text-app-text">
          Despesas por categoria
        </Text>
        {categories.length ? (
          categories.map((row) => (
            <View key={row.categoryId} className="mb-4">
              <View className="mb-2 flex-row justify-between gap-3">
                <Text className="flex-1 text-sm text-app-text">
                  {row.categoryName}
                </Text>
                <Text className="text-sm font-semibold text-app-text">
                  {formatCurrency(row.total)} ·{' '}
                  {Math.round((row.total / report.totalExpense) * 100)}%
                </Text>
              </View>
              <View className="h-2 overflow-hidden rounded bg-app-surfaceLight">
                <View
                  style={{
                    height: 8,
                    width: ((row.total / report.totalExpense) * 100 +
                      '%') as `${number}%`,
                    backgroundColor: row.categoryColor,
                  }}
                />
              </View>
            </View>
          ))
        ) : (
          <Text className="text-app-textMuted">
            Nenhuma despesa confirmada no mês.
          </Text>
        )}
      </View>
    </>
  );
}
