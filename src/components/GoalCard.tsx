import { useTheme } from '../theme/ThemeProvider';
import { Text, View } from 'react-native';
import { Goal } from '../types';
import { usePrivacyStore } from '../stores/privacyStore';
import { formatCurrency, formatDate } from '../utils/format';
export function GoalCard({ goal }: { goal: Goal }) {
  const theme = useTheme();
  const show = usePrivacyStore((s) => s.showValues),
    money = (v: number) => (show ? formatCurrency(v) : 'R$ ••••••');
  return (
    <View className="mb-4 rounded-lg border border-app-border bg-app-surface p-4">
      <Text className="text-lg font-semibold text-app-text">{goal.name}</Text>
      <Text className="mt-2 text-xs font-semibold text-app-primaryText">
        {goal.status === 'COMPLETED'
          ? 'Meta atingida'
          : goal.status === 'REVIEW'
            ? 'Revisar destinações'
            : goal.status === 'OVERDUE'
              ? 'Prazo encerrado'
              : 'Em andamento'}
      </Text>
      <Text className="mt-4 text-xl font-bold text-app-text">
        {money(goal.currentAmount)}
      </Text>
      <Text className="mt-1 text-sm text-app-textMuted">
        disponíveis de {money(goal.targetAmount)}
      </Text>
      {show ? (
        <>
          <View className="my-3 h-2 overflow-hidden rounded bg-app-surfaceLight">
            <View
              style={{
                height: 8,
                width: (Math.min(100, goal.percentage) + '%') as `${number}%`,
                backgroundColor: theme.colors.primary,
              }}
            />
          </View>
          <Text className="text-sm text-app-textSecondary">
            {goal.percentage}% · Faltam {money(goal.remainingAmount)}
          </Text>
        </>
      ) : (
        <Text className="my-3 text-sm text-app-textMuted">
          Valores e percentuais ocultos.
        </Text>
      )}
      {goal.deadline ? (
        <Text className="mt-3 text-sm text-app-textMuted">
          Prazo: {formatDate(goal.deadline)}
        </Text>
      ) : null}
      {goal.shortfall > 0 ? (
        <Text className="mt-3 text-sm leading-6 text-app-warning">
          O saldo das contas diminuiu. Há {money(goal.shortfall)} destinados sem
          cobertura. Revise as contribuições ou recomponha o saldo.
        </Text>
      ) : null}
    </View>
  );
}
