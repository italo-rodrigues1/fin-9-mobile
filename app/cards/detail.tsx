import { useCallback, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { QueryState } from '../../src/components/QueryState';
import { CreditCardSummary } from '../../src/components/CreditCardSummary';
import { CardInvoiceSummary } from '../../src/components/CardInvoiceSummary';
import { Button } from '../../src/components/ui/Button';
import { Select } from '../../src/components/ui/Select';
import { useResource } from '../../src/hooks/useResource';
import { cardService } from '../../src/services/cardService';
export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    router = useRouter(),
    [filter, setFilter] = useState('ALL'),
    r = useResource(useCallback(() => cardService.detail(id), [id]));
  const invoices = (r.data?.invoices || [])
    .filter((i) => filter === 'ALL' || i.status === filter)
    .sort(
      (a, b) =>
        Number(a.status === 'PAID') -
        Number(b.status === 'PAID') +
        (a.status === 'PAID' && b.status === 'PAID'
          ? b.closingDate.localeCompare(a.closingDate)
          : a.status !== 'PAID' && b.status !== 'PAID'
            ? a.closingDate.localeCompare(b.closingDate)
            : 0),
    );
  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <ScreenHeader title="Detalhes do cartão" />
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        data={r.loading || r.error ? [] : invoices}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={
          <View>
            <QueryState loading={r.loading} error={r.error} retry={r.reload} />
            {!r.loading && !r.error && r.data ? (
              <>
                <CreditCardSummary card={r.data.card} />
                <Button
                  title="Nova compra no cartão"
                  disabled={r.data.card.isArchived}
                  onPress={() =>
                    router.push({
                      pathname: '/cards/purchase',
                      params: { cardId: id },
                    })
                  }
                />
                <View className="my-3">
                  <Button
                    title="Editar cartão"
                    variant="outline"
                    onPress={() =>
                      router.push({ pathname: '/cards/edit', params: { id } })
                    }
                  />
                </View>
                <Text className="mb-5 text-sm leading-6 text-[#667085]">
                  Compras no dia do fechamento vão para a próxima fatura. Em
                  meses curtos, fechamento e vencimento usam o último dia
                  disponível. O pagamento é integral, após o fechamento.
                </Text>
                <Text className="mb-3 text-lg font-semibold text-[#101828]">
                  Faturas
                </Text>
                <Select
                  label="Situação da fatura"
                  value={filter}
                  onChange={setFilter}
                  options={[
                    { value: 'ALL', label: 'Todas' },
                    { value: 'OPEN', label: 'Abertas' },
                    { value: 'CLOSED', label: 'Fechadas' },
                    { value: 'PAID', label: 'Pagas' },
                  ]}
                />
              </>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !r.loading && !r.error ? (
            <Text className="py-4 text-[#667085]">
              Nenhuma fatura nesta situação. As faturas são criadas ao registrar
              compras.
            </Text>
          ) : undefined
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={'Abrir fatura ' + item.month + '/' + item.year}
            onPress={() =>
              router.push({
                pathname: '/cards/invoice',
                params: { cardId: id, id: item.id },
              })
            }
          >
            <CardInvoiceSummary invoice={item} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
