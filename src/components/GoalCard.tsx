import { Text, View } from 'react-native';
import { Goal } from '../types';
import { usePrivacyStore } from '../stores/privacyStore';
import { formatCurrency, formatDate } from '../utils/format';
export function GoalCard({ goal }: { goal: Goal }) {
  const show = usePrivacyStore((s) => s.showValues),
    money = (v: number) => (show ? formatCurrency(v) : 'R$ ••••••');
  return (
    <View className="mb-4 rounded-lg border border-[#E4E7EC] bg-white p-4">
      <Text className="text-lg font-semibold text-[#101828]">{goal.name}</Text>
      <Text className="mt-2 text-xs font-semibold text-[#047857]">
        {goal.status === 'COMPLETED'
          ? 'Meta atingida'
          : goal.status === 'REVIEW'
            ? 'Revisar destinações'
            : goal.status === 'OVERDUE'
              ? 'Prazo encerrado'
              : 'Em andamento'}
      </Text>
      <Text className="mt-4 text-xl font-bold text-[#101828]">
        {money(goal.currentAmount)}
      </Text>
      <Text className="mt-1 text-sm text-[#667085]">
        disponíveis de {money(goal.targetAmount)}
      </Text>
      {show ? (
        <>
          <View className="my-3 h-2 overflow-hidden rounded bg-[#EAECF0]">
            <View
              style={{
                height: 8,
                width: (Math.min(100, goal.percentage) + '%') as `${number}%`,
                backgroundColor: '#047857',
              }}
            />
          </View>
          <Text className="text-sm text-[#475467]">
            {goal.percentage}% · Faltam {money(goal.remainingAmount)}
          </Text>
        </>
      ) : (
        <Text className="my-3 text-sm text-[#667085]">
          Valores e percentuais ocultos.
        </Text>
      )}
      {goal.deadline ? (
        <Text className="mt-3 text-sm text-[#667085]">
          Prazo: {formatDate(goal.deadline)}
        </Text>
      ) : null}
      {goal.shortfall > 0 ? (
        <Text className="mt-3 text-sm leading-6 text-[#B54708]">
          O saldo das contas diminuiu. Há {money(goal.shortfall)} destinados sem
          cobertura. Revise as contribuições ou recomponha o saldo.
        </Text>
      ) : null}
    </View>
  );
}
