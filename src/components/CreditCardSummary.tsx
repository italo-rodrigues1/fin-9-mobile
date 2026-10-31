import { Text, View } from 'react-native';
import { CreditCard } from '../types';
import { usePrivacyStore } from '../stores/privacyStore';
import { formatCurrency } from '../utils/format';
export function CreditCardSummary({ card }: { card: CreditCard }) {
  const show = usePrivacyStore((s) => s.showValues),
    money = (n: number) => (show ? formatCurrency(n) : 'R$ ••••••');
  return (
    <View className="mb-4 rounded-lg border border-[#E4E7EC] bg-white p-4">
      <Text className="text-lg font-semibold text-[#101828]">
        {card.name}
        {card.isArchived ? ' · Arquivado' : ''}
      </Text>
      <Text className="mt-4 text-sm text-[#667085]">Limite disponível</Text>
      <Text className="mt-1 text-2xl font-bold text-[#047857]">
        {money(card.availableLimit)}
      </Text>
      <Text className="mt-3 text-sm leading-6 text-[#475467]">
        Comprometido: {money(card.usedLimit)}
        {String.fromCharCode(10)}Limite total: {money(card.creditLimit)}
      </Text>
      {show ? (
        <View className="my-3 h-2 overflow-hidden rounded bg-[#EAECF0]">
          <View
            style={{
              height: 8,
              width: (Math.min(100, (card.usedLimit / card.creditLimit) * 100) +
                '%') as `${number}%`,
              backgroundColor: '#047857',
            }}
          />
        </View>
      ) : (
        <Text className="my-3 text-xs text-[#667085]">
          Valores e proporções ocultos.
        </Text>
      )}
      <Text className="mt-1 text-xs leading-5 text-[#667085]">
        Fecha dia {card.closingDay} · vence dia {card.dueDay}
        {String.fromCharCode(10)}O limite comprometido inclui todas as parcelas
        ainda não pagas.
      </Text>
    </View>
  );
}
