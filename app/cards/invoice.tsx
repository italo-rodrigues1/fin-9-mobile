import { useCallback, useRef, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { QueryState } from '../../src/components/QueryState';
import { CardInvoiceSummary } from '../../src/components/CardInvoiceSummary';
import { LoadingSkeleton } from '../../src/components/LoadingSkeleton';
import { Button } from '../../src/components/ui/Button';
import { CardInvoiceDetail, CardInvoiceItem } from '../../src/types';
import { useResource } from '../../src/hooks/useResource';
import { cardService } from '../../src/services/cardService';
import { usePrivacyStore } from '../../src/stores/privacyStore';
import { notify } from '../../src/stores/feedbackStore';
import { confirmAction } from '../../src/utils/confirmAction';
import { errorMessage } from '../../src/utils/errorMessage';
import { formatCurrency, formatDate } from '../../src/utils/format';
export default function Invoice() {
  const { cardId, id } = useLocalSearchParams<{ cardId: string; id: string }>(),
    router = useRouter(),
    busy = useRef(false),
    pageBusy = useRef(false),
    show = usePrivacyStore((s) => s.showValues),
    r = useResource(
      useCallback(() => cardService.invoice(cardId, id), [cardId, id]),
    );
  const latest = useRef(r.data);
  latest.current = r.loading ? null : r.data;
  const [extra, setExtra] = useState<{
      source: CardInvoiceDetail;
      items: CardInvoiceItem[];
      hasMore: boolean;
    } | null>(null),
    [loadingMore, setLoadingMore] = useState(false),
    [saving, setSaving] = useState(false);
  const rows = r.data
      ? [...r.data.items, ...(extra?.source === r.data ? extra.items : [])]
      : [],
    hasMore = extra?.source === r.data ? extra.hasMore : r.data?.hasMore;
  const more = async () => {
    const source = r.data;
    if (!source || pageBusy.current || r.loading) return;
    pageBusy.current = true;
    setLoadingMore(true);
    try {
      const page = await cardService.invoice(cardId, id, rows.length);
      if (latest.current === source)
        setExtra({
          source,
          items: [
            ...(extra?.source === source ? extra.items : []),
            ...page.items,
          ],
          hasMore: page.hasMore,
        });
    } catch (e) {
      notify(errorMessage(e, 'Não foi possível carregar mais parcelas.'));
    } finally {
      pageBusy.current = false;
      setLoadingMore(false);
    }
  };
  const reverse = async () => {
    const p = r.data?.invoice.payment;
    if (
      !p ||
      busy.current ||
      !(await confirmAction(
        'Estornar registro de pagamento',
        'O saldo será recomposto e os lançamentos deste pagamento serão removidos. Isso não cancela um pagamento no banco.',
        'Estornar registro',
      ))
    )
      return;
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    try {
      await cardService.reverse(cardId, id, p.id);
      await r.reload();
      notify('Registro estornado. O saldo foi recomposto.');
    } catch (e) {
      notify(errorMessage(e, 'Não foi possível estornar o registro.'));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <ScreenHeader title="Fatura do cartão" />
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        data={r.loading || r.error ? [] : rows}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={
          <View>
            <QueryState loading={r.loading} error={r.error} retry={r.reload} />
            {!r.loading && !r.error && r.data ? (
              <>
                <Text className="mb-3 text-lg font-semibold text-[#101828]">
                  {r.data.card.name}
                </Text>
                <CardInvoiceSummary invoice={r.data.invoice} />
                {r.data.invoice.status === 'CLOSED' &&
                r.data.invoice.total > 0 ? (
                  <Button
                    title="Registrar pagamento integral"
                    onPress={() =>
                      router.push({
                        pathname: '/cards/payment',
                        params: { cardId, id },
                      })
                    }
                  />
                ) : r.data.invoice.payment ? (
                  <Button
                    title="Estornar registro de pagamento"
                    variant="danger"
                    onPress={reverse}
                    isLoading={saving}
                  />
                ) : (
                  <Text className="text-sm leading-6 text-[#667085]">
                    {r.data.invoice.status === 'OPEN'
                      ? 'O pagamento pode ser registrado após o fechamento.'
                      : 'A fatura não possui valores para pagar.'}
                  </Text>
                )}
                <Text className="my-4 text-sm leading-6 text-[#667085]">
                  Compras e parcelas não geram despesas nos relatórios até o
                  pagamento. Ao pagar, cada parcela entra na categoria original
                  e na data do pagamento, uma única vez.
                </Text>
                <Text className="mb-4 text-lg font-semibold text-[#101828]">
                  Compras e parcelas
                </Text>
              </>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !r.loading && !r.error ? (
            <Text className="py-4 text-[#667085]">
              Nenhuma parcela nesta fatura.
            </Text>
          ) : undefined
        }
        renderItem={({ item }) => (
          <View className="mb-3 rounded-lg border border-[#E4E7EC] bg-white p-4">
            <Text className="text-base font-semibold text-[#101828]">
              {item.purchase.title}
            </Text>
            <Text className="mt-2 text-sm text-[#667085]">
              Parcela {item.number}/{item.purchase.installmentCount} ·{' '}
              {item.purchase.category?.name}
            </Text>
            <Text className="mt-2 text-lg font-bold text-[#101828]">
              {show ? formatCurrency(item.amount) : 'R$ ••••••'}
            </Text>
            <Text className="my-3 text-xs text-[#667085]">
              Compra em {formatDate(item.purchase.date)}
            </Text>
            {item.canEdit ? (
              <Button
                title="Editar compra"
                variant="outline"
                disabled={saving || r.data?.card.isArchived}
                onPress={() =>
                  router.push({
                    pathname: '/cards/purchase',
                    params: { cardId, id: item.purchaseId },
                  })
                }
              />
            ) : (
              <Text className="text-xs leading-5 text-[#667085]">
                Compra com parcela paga. Para editar, estorne os respectivos
                pagamentos.
              </Text>
            )}
          </View>
        )}
        ListFooterComponent={
          !r.loading && !r.error && hasMore ? (
            <View className="mt-3">
              {loadingMore ? (
                <LoadingSkeleton variant="list" label="Carregando parcelas" />
              ) : (
                <Button
                  title="Carregar mais parcelas"
                  onPress={more}
                  variant="outline"
                />
              )}
            </View>
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}
