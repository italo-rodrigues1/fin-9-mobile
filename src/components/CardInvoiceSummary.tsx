import { useTheme } from '../theme/ThemeProvider';
import { Text, View } from 'react-native';
import { CardInvoice } from '../types';
import { usePrivacyStore } from '../stores/privacyStore';
import { formatCurrency, formatDate } from '../utils/format';
export function CardInvoiceSummary({ invoice }: { invoice: CardInvoice }) {
  const theme = useTheme();
  const show = usePrivacyStore((s) => s.showValues);
  return (
    <View className="mb-3 rounded-lg border border-app-border bg-app-surface p-4">
      <Text className="text-lg font-semibold text-app-text">
        Fatura {String(invoice.month).padStart(2, '0')}/{invoice.year}
      </Text>
      <Text
        className="mt-2 text-sm font-semibold"
        style={{
          color: invoice.overdue ? theme.colors.danger : theme.colors.primary,
        }}
      >
        {invoice.status === 'PAID'
          ? 'Paga'
          : invoice.status === 'OPEN'
            ? 'Aberta'
            : 'Fechada'}
        {invoice.overdue ? ' · Vencida' : ''}
      </Text>
      <Text className="mt-3 text-xl font-bold text-app-text">
        {show ? formatCurrency(invoice.total) : 'R$ ••••••'}
      </Text>
      <Text className="mt-3 text-sm leading-6 text-app-textMuted">
        Fechamento: {formatDate(invoice.closingDate)}
        {String.fromCharCode(10)}Vencimento: {formatDate(invoice.dueDate)}
      </Text>
      {invoice.payment ? (
        <Text className="mt-3 text-sm leading-6 text-app-textSecondary">
          Pagamento registrado em {formatDate(invoice.payment.date)} ·{' '}
          {invoice.payment.account.name}
          {invoice.payment.account.deletedAt ? ' · Conta excluída' : ''}
        </Text>
      ) : null}
    </View>
  );
}
