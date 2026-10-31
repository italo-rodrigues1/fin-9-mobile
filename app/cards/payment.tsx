import { useCallback, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { QueryState } from '../../src/components/QueryState';
import { CardInvoiceSummary } from '../../src/components/CardInvoiceSummary';
import { Select } from '../../src/components/ui/Select';
import { Button } from '../../src/components/ui/Button';
import {
  DateInput,
  getLocalDateValue,
  isValidDateValue,
} from '../../src/components/ui/DateInput';
import { useResource } from '../../src/hooks/useResource';
import { cardService } from '../../src/services/cardService';
import { accountService } from '../../src/services/accountService';
import { notify } from '../../src/stores/feedbackStore';
import { errorMessage } from '../../src/utils/errorMessage';
export default function Payment() {
  const { cardId, id } = useLocalSearchParams<{ cardId: string; id: string }>(),
    router = useRouter(),
    busy = useRef(false),
    requestId = useRef(
      Date.now().toString(36) + '-' + Math.random().toString(36).slice(2),
    );
  const [accountId, setAccount] = useState(''),
    [date, setDate] = useState(getLocalDateValue),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [saving, setSaving] = useState(false);
  const r = useResource(
    useCallback(async () => {
      const [detail, accounts] = await Promise.all([
        cardService.invoice(cardId, id),
        accountService.getAll(),
      ]);
      return { detail, accounts };
    }, [cardId, id]),
  );
  const save = async () => {
    if (busy.current) return;
    const next: Record<string, string> = {};
    if (!accountId) next.account = 'Selecione a conta do pagamento.';
    if (
      !isValidDateValue(date) ||
      date > getLocalDateValue() ||
      date < (r.data?.detail.invoice.closingDate.slice(0, 10) || '')
    )
      next.date = 'Use uma data entre o fechamento e hoje.';
    setErrors(next);
    if (Object.keys(next).length) return;
    busy.current = true;
    setSaving(true);
    try {
      await cardService.pay(cardId, id, {
        accountId,
        date,
        requestId: requestId.current,
      });
      notify('Pagamento registrado. Saldo e despesas atualizados.');
      if (router.canGoBack()) router.back();
      else
        router.replace({ pathname: '/cards/invoice', params: { cardId, id } });
    } catch (e) {
      notify(errorMessage(e, 'Não foi possível registrar o pagamento.'));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  const accounts = (r.data?.accounts || []).filter((a) => !a.isArchived);
  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <ScreenHeader title="Registrar pagamento" />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <QueryState loading={r.loading} error={r.error} retry={r.reload} />
        {!r.loading && !r.error && r.data ? (
          <>
            <Text className="mb-3 text-lg font-semibold text-[#101828]">
              {r.data.detail.card.name}
            </Text>
            <CardInvoiceSummary invoice={r.data.detail.invoice} />
            <View className="rounded-lg bg-white p-4">
              <Text className="mb-5 text-sm leading-6 text-[#667085]">
                Este registro não faz um pagamento no banco. Informe um
                pagamento integral que você já realizou: o valor será descontado
                da conta e lançado nas categorias das compras.
              </Text>
              {r.data.detail.invoice.status === 'CLOSED' ? (
                <>
                  <Select
                    label="Conta do pagamento"
                    value={accountId}
                    options={accounts.map((a) => ({
                      value: a.id,
                      label: a.name,
                      subtitle: a.institution,
                    }))}
                    onChange={setAccount}
                  />
                  {errors.account ? (
                    <Text className="mb-3 text-[#B42318]">
                      {errors.account}
                    </Text>
                  ) : null}
                  <DateInput
                    label="Data do pagamento"
                    value={date}
                    onChange={setDate}
                  />
                  {errors.date ? (
                    <Text className="mb-3 text-[#B42318]">{errors.date}</Text>
                  ) : null}
                  <Button
                    title="Confirmar registro do pagamento"
                    onPress={save}
                    isLoading={saving}
                    disabled={!accounts.length}
                  />
                  {!accounts.length ? (
                    <View className="mt-4">
                      <Button
                        title="Cadastrar conta"
                        variant="outline"
                        onPress={() => router.push('/accounts/create')}
                      />
                    </View>
                  ) : null}
                </>
              ) : (
                <Text className="text-sm text-[#667085]">
                  O registro está disponível apenas para faturas fechadas e
                  ainda não pagas.
                </Text>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
