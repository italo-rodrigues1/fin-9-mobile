import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { categoryService } from '../src/services/categoryService';
import { planningService } from '../src/services/planningService';
import { notify } from '../src/stores/feedbackStore';
import { confirmAction } from '../src/utils/confirmAction';
import { errorMessage } from '../src/utils/errorMessage';
import {
  formatCurrencyInput,
  parseCurrencyInput,
  sanitizeCurrencyInput,
  MAX_MONEY_VALUE,
} from '../src/utils/format';
import { Recurrence, TransactionType } from '../src/types';
export default function RecurrenceForm() {
  const { id } = useLocalSearchParams<{ id?: string }>(),
    router = useRouter();
  const resource = useResource(
    useCallback(async () => {
      const [accounts, categories, rules] = await Promise.all([
        accountService.getAll(),
        categoryService.getAll(),
        id ? planningService.recurrences() : Promise.resolve([]),
      ]);
      return { accounts, categories, rule: rules.find((row) => row.id === id) };
    }, [id]),
  );
  const [title, setTitle] = useState(''),
    [amount, setAmount] = useState(''),
    [type, setType] = useState(TransactionType.EXPENSE),
    [accountId, setAccount] = useState(''),
    [categoryId, setCategory] = useState(''),
    [interval, setInterval] = useState<Recurrence['interval']>('MONTHLY'),
    [start, setStart] = useState(getLocalDateValue),
    [end, setEnd] = useState(''),
    [effective, setEffective] = useState(getLocalDateValue),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [saving, setSaving] = useState(false);
  const seeded = useRef(false),
    busy = useRef(false);
  useEffect(() => {
    if (!resource.data) return;
    const row = resource.data.rule;
    if (row && !seeded.current) {
      setTitle(row.title);
      setAmount(formatCurrencyInput(row.amount));
      setType(row.type);
      setAccount(row.accountId);
      setCategory(row.categoryId);
      setInterval(row.interval);
      setStart(row.startDate.slice(0, 10));
      setEnd(row.endDate?.slice(0, 10) || '');
      seeded.current = true;
    } else if (!id) {
      setAccount(
        (old) =>
          old || resource.data?.accounts.find((a) => !a.isArchived)?.id || '',
      );
    }
  }, [resource.data, id]);
  const save = async () => {
    if (busy.current) return;
    const value = parseCurrencyInput(amount),
      next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Informe o título.';
    if (
      !amount ||
      !Number.isFinite(value) ||
      value <= 0 ||
      value > MAX_MONEY_VALUE
    )
      next.amount = 'Informe um valor válido.';
    if (!accountId) next.account = 'Selecione uma conta.';
    if (!categoryId) next.category = 'Selecione uma categoria.';
    if (
      !isValidDateValue(start) ||
      (end && (!isValidDateValue(end) || end < start))
    )
      next.date = 'Informe datas válidas, com fim posterior ao início.';
    if (id && !isValidDateValue(effective))
      next.effective =
        'Informe a data a partir da qual alterar as próximas ocorrências.';
    setErrors(next);
    if (Object.keys(next).length) return;
    busy.current = true;
    setSaving(true);
    try {
      await planningService.saveRecurrence(
        id
          ? {
              title: title.trim(),
              amount: value,
              type,
              accountId,
              categoryId,
              effectiveDate: effective,
              endDate: end || null,
            }
          : {
              title: title.trim(),
              amount: value,
              type,
              accountId,
              categoryId,
              interval,
              startDate: start,
              ...(end ? { endDate: end } : {}),
            },
        id,
      );
      notify('Recorrência salva.');
      router.back();
    } catch (err) {
      notify(errorMessage(err, 'Não foi possível salvar a recorrência.'));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  const stop = async () => {
    if (
      !id ||
      busy.current ||
      !(await confirmAction(
        'Encerrar recorrência',
        'As ocorrências previstas a partir da data informada serão removidas. As confirmadas serão preservadas.',
        'Encerrar',
      ))
    )
      return;
    if (!isValidDateValue(effective)) {
      setErrors({ effective: 'Informe uma data válida.' });
      return;
    }
    busy.current = true;
    setSaving(true);
    try {
      await planningService.saveRecurrence(
        { active: false, effectiveDate: effective },
        id,
      );
      notify('Recorrência encerrada.');
      router.back();
    } catch (err) {
      notify(errorMessage(err, 'Não foi possível encerrar.'));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <ScreenHeader title={id ? 'Editar próximas' : 'Nova recorrência'} />
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
          <View className="rounded-lg bg-white p-4">
            <Text className="mb-4 text-sm leading-6 text-[#667085]">
              Cada ocorrência nasce como prevista. Confirmar recebimento ou
              pagamento atualiza o saldo; editar aqui preserva as ocorrências já
              confirmadas.
            </Text>
            <Input
              label="Título"
              value={title}
              onChangeText={setTitle}
              error={errors.title}
              maxLength={100}
            />
            <Input
              label="Valor (R$)"
              value={amount}
              onChangeText={(v) => setAmount(sanitizeCurrencyInput(v))}
              error={errors.amount}
              keyboardType="decimal-pad"
            />
            <Select
              label="Tipo"
              value={type}
              options={[
                { value: 'EXPENSE', label: 'Despesa' },
                { value: 'INCOME', label: 'Receita' },
              ]}
              onChange={(v) => setType(v as TransactionType)}
            />
            <Select
              label="Conta"
              value={accountId}
              options={(resource.data?.accounts || [])
                .filter((a) => !a.isArchived)
                .map((a) => ({ value: a.id, label: a.name }))}
              onChange={setAccount}
            />
            {errors.account ? (
              <Text className="mb-3 text-[#B42318]">{errors.account}</Text>
            ) : null}
            <Select
              label="Categoria"
              value={categoryId}
              options={(resource.data?.categories || []).map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              onChange={setCategory}
            />
            {errors.category ? (
              <Text className="mb-3 text-[#B42318]">{errors.category}</Text>
            ) : null}
            {!id ? (
              <>
                <Select
                  label="Repetição"
                  value={interval}
                  options={[
                    { value: 'WEEKLY', label: 'Semanal' },
                    { value: 'MONTHLY', label: 'Mensal' },
                    { value: 'YEARLY', label: 'Anual' },
                  ]}
                  onChange={(v) => setInterval(v as Recurrence['interval'])}
                />
                <DateInput
                  label="Data inicial"
                  value={start}
                  onChange={setStart}
                />
              </>
            ) : (
              <>
                <DateInput
                  label="Alterar previstas a partir de"
                  value={effective}
                  onChange={setEffective}
                />
                {errors.effective ? (
                  <Text className="mb-3 text-[#B42318]">
                    {errors.effective}
                  </Text>
                ) : null}
                <Text className="mb-3 text-sm text-[#667085]">
                  Para alterar o dia ou a frequência, encerre esta recorrência e
                  crie outra.
                </Text>
              </>
            )}
            <DateInput
              label="Data final (opcional)"
              value={end}
              onChange={setEnd}
            />
            {errors.date ? (
              <Text className="mb-3 text-[#B42318]">{errors.date}</Text>
            ) : null}
            <Button
              title="Salvar recorrência"
              onPress={save}
              isLoading={saving}
            />
            {id && resource.data?.rule?.active ? (
              <View className="mt-3">
                <Button
                  title="Encerrar recorrência"
                  variant="danger"
                  onPress={stop}
                  disabled={saving}
                />
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
