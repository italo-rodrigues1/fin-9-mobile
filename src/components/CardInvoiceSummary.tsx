import { Text, View } from 'react-native';
import { CardInvoice } from '../types';
import { usePrivacyStore } from '../stores/privacyStore';
import { formatCurrency, formatDate } from '../utils/format';
export function CardInvoiceSummary({ invoice }: { invoice: CardInvoice }) {
  const show = usePrivacyStore((s) => s.showValues);
  return (
    <View className="mb-3 rounded-lg border border-[#E4E7EC] bg-white p-4">
      <Text className="text-lg font-semibold text-[#101828]">
        Fatura {String(invoice.month).padStart(2, '0')}/{invoice.year}
      </Text>
      <Text
        className="mt-2 text-sm font-semibold"
        style={{ color: invoice.overdue ? '#B42318' : '#047857' }}
      >
        {invoice.status === 'PAID'
          ? 'Paga'
          : invoice.status === 'OPEN'
            ? 'Aberta'
            : 'Fechada'}
        {invoice.overdue ? ' · Vencida' : ''}
      </Text>
      <Text className="mt-3 text-xl font-bold text-[#101828]">
        {show ? formatCurrency(invoice.total) : 'R$ ••••••'}
      </Text>
      <Text className="mt-3 text-sm leading-6 text-[#667085]">
        Fechamento: {formatDate(invoice.closingDate)}
        {String.fromCharCode(10)}Vencimento: {formatDate(invoice.dueDate)}
      </Text>
      {invoice.payment ? (
        <Text className="mt-3 text-sm leading-6 text-[#475467]">
          Pagamento registrado em {formatDate(invoice.payment.date)} ·{' '}
          {invoice.payment.account.name}
        </Text>
      ) : null}
    </View>
  );
}
