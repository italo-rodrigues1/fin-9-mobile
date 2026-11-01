import { usePrivacyStore } from '../src/stores/privacyStore';
import {
  KeyboardScreen as SafeAreaView,
  KeyboardScrollView as ScrollView,
} from '../src/components/KeyboardForm';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { QueryState } from '../src/components/QueryState';
import { Input } from '../src/components/ui/Input';
import { Select } from '../src/components/ui/Select';
import {
  DateInput,
  getLocalDateValue,
  isValidDateValue,
} from '../src/components/ui/DateInput';
import { Button } from '../src/components/ui/Button';
import { useResource } from '../src/hooks/useResource';
import { accountService } from '../src/services/accountService';
import { planningService } from '../src/services/planningService';
import { notify } from '../src/stores/feedbackStore';
import { confirmAction } from '../src/utils/confirmAction';
import { errorMessage } from '../src/utils/errorMessage';
import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyInput,
  sanitizeCurrencyInput,
  MAX_MONEY_VALUE,
} from '../src/utils/format';
export default function TransferForm() {
  const showValues = usePrivacyStore((s) => s.showValues);
  const { id, fromAccountId } = useLocalSearchParams<{
      id?: string;
      fromAccountId?: string;
    }>(),
    router = useRouter();
  const resource = useResource(
    useCallback(
      async () => ({
        accounts: await accountService.getAll(),
        transfer: id ? await planningService.getTransfer(id) : null,
      }),
      [id],
    ),
  );
  const [from, setFrom] = useState(''),
    [to, setTo] = useState(''),
    [amount, setAmount] = useState(''),
    [date, setDate] = useState(getLocalDateValue),
    [title, setTitle] = useState(''),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [saving, setSaving] = useState(false);
  const seeded = useRef(false),
    busy = useRef(false);
  useEffect(() => {
    if (!resource.data) return;
    const row = resource.data.transfer;
    if (row && !seeded.current) {
      setFrom(row.fromAccountId);
      setTo(row.toAccountId);
      setAmount(formatCurrencyInput(row.amount));
      setDate(row.date.slice(0, 10));
      setTitle(row.title);
      seeded.current = true;
    } else if (!row) {
      const active = resource.data.accounts.filter((a) => !a.isArchived);
      const source =
        active.find((account) => account.id === fromAccountId)?.id ||
        active[0]?.id ||
        '';
      setFrom((old) => old || source);
      setTo(
        (old) =>
          old || active.find((account) => account.id !== source)?.id || '',
      );
    }
  }, [resource.data, fromAccountId]);
  const save = async () => {
    if (busy.current) return;
    const next: Record<string, string> = {},
      value = parseCurrencyInput(amount);
    if (!from) next.from = 'Selecione a conta de origem.';
    if (!to || from === to)
      next.to = 'Selecione uma conta de destino diferente.';
    if (
      !amount ||
      !Number.isFinite(value) ||
      value <= 0 ||
      value > MAX_MONEY_VALUE
    )
      next.amount = 'Informe um valor válido.';
    if (!isValidDateValue(date)) next.date = 'Informe uma data válida.';
    setErrors(next);
    if (Object.keys(next).length) return;
    busy.current = true;
    setSaving(true);
    try {
      await planningService.saveTransfer(
        { fromAccountId: from, toAccountId: to, amount: value, date, title },
        id,
      );
      notify('Transferência salva. O saldo total foi preservado.');
      if (router.canGoBack()) router.back();
      else router.replace('/transfers');
    } catch (err) {
      notify(errorMessage(err, 'Não foi possível salvar a transferência.'));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  const remove = async () => {
    if (
      !id ||
      busy.current ||
      !(await confirmAction(
        'Excluir transferência',
        'Os movimentos das duas contas serão revertidos juntos.',
        'Excluir',
      ))
    )
      return;
    busy.current = true;
    setSaving(true);
    try {
      await planningService.deleteTransfer(id);
      notify('Transferência excluída.');
      router.back();
    } catch (err) {
      notify(errorMessage(err, 'Não foi possível excluir.'));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  const options = (resource.data?.accounts || [])
    .filter((a) => !a.isArchived)
    .map((a) => ({ value: a.id, label: a.name }));
  if (
    resource.data?.transfer?.fromAccount?.deletedAt ||
    resource.data?.transfer?.toAccount?.deletedAt
  )
    return (
      <SafeAreaView className="flex-1 bg-app-background">
        <ScreenHeader title="Histórico da transferência" />
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text className="mb-4 text-xl font-semibold text-app-text">
            {resource.data.transfer.title}
          </Text>
          <Text className="mb-4 text-xl font-bold text-app-text">
            {showValues
              ? formatCurrency(resource.data.transfer.amount)
              : 'R$ ••••••'}
          </Text>
          <Text className="text-sm leading-6 text-app-textMuted">
            Uma das contas foi excluída do app. A transferência está preservada
            apenas para consulta, sem alterar o saldo da outra conta.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  return (
    <SafeAreaView className="flex-1 bg-app-background">
      <ScreenHeader
        title={id ? 'Editar transferência' : 'Nova transferência'}
      />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <QueryState
          loading={resource.loading}
          error={resource.error}
          retry={resource.reload}
        />
        {!resource.loading && !resource.error ? (
          <View className="rounded-lg bg-app-surface p-4">
            <Text className="mb-5 text-sm leading-6 text-app-textMuted">
              Move dinheiro entre suas contas sem criar receita ou despesa.
            </Text>
            <Select
              label="Conta de origem"
              value={from}
              options={options}
              onChange={setFrom}
            />
            {errors.from ? (
              <Text className="mb-3 text-app-danger">{errors.from}</Text>
            ) : null}
            <Select
              label="Conta de destino"
              value={to}
              options={options.filter((a) => a.value !== from)}
              onChange={setTo}
            />
            {errors.to ? (
              <Text className="mb-3 text-app-danger">{errors.to}</Text>
            ) : null}
            <Input
              label="Valor (R$)"
              value={amount}
              onChangeText={(v) => setAmount(sanitizeCurrencyInput(v))}
              error={errors.amount}
              keyboardType="decimal-pad"
            />
            <DateInput label="Data" value={date} onChange={setDate} />
            {errors.date ? (
              <Text className="mb-3 text-app-danger">{errors.date}</Text>
            ) : null}
            <Input
              label="Descrição (opcional)"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Button
              title="Salvar transferência"
              onPress={save}
              isLoading={saving}
            />
            {id ? (
              <View className="mt-3">
                <Button
                  title="Excluir transferência"
                  variant="danger"
                  onPress={remove}
                  disabled={saving}
                />
              </View>
            ) : null}
            {options.length < 2 ? (
              <View className="mt-4">
                <Text className="mb-3 text-sm text-app-textMuted">
                  São necessárias duas contas ativas.
                </Text>
                <Button
                  title="Cadastrar conta"
                  variant="outline"
                  onPress={() => router.push('/accounts/create')}
                />
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
