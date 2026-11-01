import {
  KeyboardScreen as SafeAreaView,
  KeyboardScrollView as ScrollView,
} from '../../src/components/KeyboardForm';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { QueryState } from '../../src/components/QueryState';
import { Input } from '../../src/components/ui/Input';
import { Select } from '../../src/components/ui/Select';
import { Button } from '../../src/components/ui/Button';
import {
  DateInput,
  getLocalDateValue,
  isValidDateValue,
} from '../../src/components/ui/DateInput';
import { useResource } from '../../src/hooks/useResource';
import { goalService } from '../../src/services/goalService';
import { usePrivacyStore } from '../../src/stores/privacyStore';
import { notify } from '../../src/stores/feedbackStore';
import { errorMessage } from '../../src/utils/errorMessage';
import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyInput,
  sanitizeCurrencyInput,
  MAX_MONEY_VALUE,
} from '../../src/utils/format';
export default function Contribution() {
  const { goalId, id } = useLocalSearchParams<{
      goalId: string;
      id?: string;
    }>(),
    router = useRouter(),
    busy = useRef(false),
    seeded = useRef(false),
    requestId = useRef(
      Date.now().toString(36) + '-' + Math.random().toString(36).slice(2),
    ),
    show = usePrivacyStore((s) => s.showValues);
  const [accountId, setAccount] = useState(''),
    [amount, setAmount] = useState(''),
    [date, setDate] = useState(getLocalDateValue),
    [note, setNote] = useState(''),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [saving, setSaving] = useState(false);
  const resource = useResource(
    useCallback(async () => {
      const [detail, entry] = await Promise.all([
        goalService.detail(goalId),
        id ? goalService.contribution(goalId, id) : Promise.resolve(null),
      ]);
      return { detail, entry };
    }, [goalId, id]),
  );
  useEffect(() => {
    if (resource.data?.entry && !seeded.current) {
      seeded.current = true;
      const c = resource.data.entry;
      setAccount(c.accountId);
      setAmount(formatCurrencyInput(c.amount));
      setDate(c.date.slice(0, 10));
      setNote(c.note || '');
    }
  }, [resource.data]);
  const selected = resource.data?.detail.accounts.find(
      (a) => a.id === accountId,
    ),
    old = resource.data?.entry;
  const save = async () => {
    if (busy.current) return;
    const next: Record<string, string> = {},
      value = parseCurrencyInput(amount);
    if (!accountId) next.account = 'Selecione uma conta.';
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
      await goalService.saveContribution(
        goalId,
        {
          accountId,
          amount: value,
          date,
          note: note.trim(),
          ...(!id ? { requestId: requestId.current } : {}),
        },
        id,
      );
      notify('Contribuição salva. O saldo da conta foi mantido.');
      if (router.canGoBack()) router.back();
      else
        router.replace({ pathname: '/goals/detail', params: { id: goalId } });
    } catch (err) {
      notify(errorMessage(err, 'Não foi possível salvar a contribuição.'));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  const accounts = (resource.data?.detail.accounts || []).filter(
    (a) => !a.isArchived || a.id === old?.accountId,
  );
  return (
    <SafeAreaView className="flex-1 bg-app-background">
      <ScreenHeader title={id ? 'Editar contribuição' : 'Nova contribuição'} />
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
            <Text className="mb-2 text-lg font-semibold text-app-text">
              {resource.data?.detail.goal.name}
            </Text>
            <Text className="mb-5 text-sm leading-6 text-app-textMuted">
              Escolha onde esse dinheiro está. A contribuição apenas o destina
              para a meta, sem alterar o saldo nem criar uma movimentação. A
              data identifica este registro.
            </Text>
            {old &&
            !resource.data?.detail.accounts.some(
              (a) => a.id === old.accountId,
            ) ? (
              <Text className="mb-4 text-sm leading-6 text-app-warning">
                A conta desta contribuição foi excluída do app. Selecione outra
                conta para transferir a destinação ou remova a contribuição pelo
                histórico da meta.
              </Text>
            ) : null}
            <Select
              label="Conta"
              value={accountId}
              options={accounts.map((a) => ({
                value: a.id,
                label: a.name + (a.isArchived ? ' · Arquivada' : ''),
                subtitle: a.institution,
              }))}
              onChange={setAccount}
            />
            {errors.account ? (
              <Text className="mb-3 text-app-danger">{errors.account}</Text>
            ) : null}
            {selected ? (
              <Text className="mb-4 text-sm leading-6 text-app-textMuted">
                Livre para novas destinações:{' '}
                {show ? formatCurrency(selected.availableAmount) : 'R$ ••••••'}.
                {old && old.accountId === selected.id
                  ? ' O valor deste registro já está destinado; você pode reduzi-lo ou alterá-lo conforme o saldo disponível.'
                  : ''}
                {selected.isArchived
                  ? ' Selecione uma conta ativa para aumentar a destinação.'
                  : ''}
              </Text>
            ) : null}
            <Input
              label="Valor da contribuição (R$)"
              value={amount}
              onChangeText={(v) => setAmount(sanitizeCurrencyInput(v))}
              keyboardType="decimal-pad"
              error={errors.amount}
            />
            <DateInput
              label="Data do registro"
              value={date}
              onChange={setDate}
            />
            {errors.date ? (
              <Text className="mb-3 text-app-danger">{errors.date}</Text>
            ) : null}
            <Input
              label="Observação (opcional)"
              value={note}
              onChangeText={setNote}
              maxLength={200}
            />
            <Button
              title="Salvar contribuição"
              onPress={save}
              isLoading={saving}
              disabled={!accounts.length}
            />
            {!accounts.length ? (
              <View className="mt-4">
                <Text className="mb-3 text-sm text-app-textMuted">
                  Cadastre ou reative uma conta para destinar dinheiro.
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
