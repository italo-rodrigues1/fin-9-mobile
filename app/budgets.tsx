import { useCallback, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { PeriodPicker } from '../src/components/PeriodPicker';
import { QueryState } from '../src/components/QueryState';
import { Input } from '../src/components/ui/Input';
import { Select } from '../src/components/ui/Select';
import { Button } from '../src/components/ui/Button';
import { useResource } from '../src/hooks/useResource';
import { usePrivacyStore } from '../src/stores/privacyStore';
import { categoryService } from '../src/services/categoryService';
import { planningService } from '../src/services/planningService';
import { notify } from '../src/stores/feedbackStore';
import { confirmAction } from '../src/utils/confirmAction';
import { errorMessage } from '../src/utils/errorMessage';
import {
  formatCurrency,
  formatCurrencyInput,
  getCurrentMonth,
  getCurrentYear,
  parseCurrencyInput,
  sanitizeCurrencyInput,
  MAX_MONEY_VALUE,
} from '../src/utils/format';
export default function Budgets() {
  const [period, setPeriod] = useState({
      month: getCurrentMonth(),
      year: getCurrentYear(),
    }),
    [categoryId, setCategory] = useState(''),
    [amount, setAmount] = useState(''),
    [error, setError] = useState(''),
    [saving, setSaving] = useState(false);
  const { month, year } = period,
    show = usePrivacyStore((s) => s.showValues),
    money = (v: number) => (show ? formatCurrency(v) : 'R$ ••••••');
  const resource = useResource(
    useCallback(async () => {
      const [budgets, categories] = await Promise.all([
        planningService.budgets(month, year),
        categoryService.getAll(),
      ]);
      return { budgets, categories };
    }, [month, year]),
  );
  const save = async () => {
    if (saving) return;
    const value = parseCurrencyInput(amount);
    if (
      !categoryId ||
      !amount ||
      !Number.isFinite(value) ||
      value <= 0 ||
      value > MAX_MONEY_VALUE
    ) {
      setError('Selecione uma categoria e informe um limite válido.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await planningService.saveBudget({
        categoryId,
        month,
        year,
        amount: value,
      });
      setAmount('');
      setCategory('');
      await resource.reload();
      notify('Orçamento salvo.');
    } catch (err) {
      notify(errorMessage(err, 'Não foi possível salvar o orçamento.'));
    } finally {
      setSaving(false);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <FlatList
        data={
          resource.loading || resource.error ? [] : resource.data?.budgets || []
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListHeaderComponent={
          <View>
            <ScreenHeader title="Orçamentos" />
            <PeriodPicker
              {...period}
              onChange={(next) => {
                setPeriod(next);
                setAmount('');
                setCategory('');
              }}
            />
            <QueryState
              loading={resource.loading}
              error={resource.error}
              retry={resource.reload}
            />
            {!resource.loading && !resource.error ? (
              <View className="mb-5 rounded-lg bg-white p-4">
                <Select
                  label="Categoria"
                  value={categoryId}
                  options={(resource.data?.categories || []).map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  onChange={setCategory}
                />
                <Input
                  label="Limite mensal (R$)"
                  value={amount}
                  onChangeText={(v) => setAmount(sanitizeCurrencyInput(v))}
                  keyboardType="decimal-pad"
                  error={error}
                />
                <Button
                  title="Salvar limite do mês"
                  onPress={save}
                  isLoading={saving}
                />
                <Text className="mt-3 text-xs leading-5 text-[#667085]">
                  Salvar novamente a mesma categoria altera seu limite. Apenas
                  despesas confirmadas entram no acompanhamento.
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !resource.loading && !resource.error ? (
            <Text className="p-4 text-[#667085]">
              Nenhum orçamento para esse mês.
            </Text>
          ) : undefined
        }
        renderItem={({ item }) => (
          <View className="mb-4 rounded-lg border border-[#E4E7EC] bg-white p-4">
            <Text className="text-base font-semibold text-[#101828]">
              {item.category.name}
            </Text>
            <Text className="mt-3 text-sm text-[#475467]">
              Utilizado: {money(item.used)} de {money(item.amount)}
            </Text>
            <Text className="mt-2 text-sm text-[#475467]">
              Restante: {money(item.remaining)}
            </Text>
            {show ? (
              <>
                <View className="my-3 h-2 overflow-hidden rounded bg-[#F2F4F7]">
                  <View
                    style={{
                      height: 8,
                      width: (Math.min(100, item.percentage) +
                        '%') as `${number}%`,
                      backgroundColor:
                        item.alert === 'EXCEEDED'
                          ? '#B42318'
                          : item.alert === 'WARNING'
                            ? '#B54708'
                            : '#047857',
                    }}
                  />
                </View>
                <Text className="mb-3 text-sm font-medium text-[#475467]">
                  {item.percentage}% utilizado
                  {item.alert === 'EXCEEDED'
                    ? ' · Limite atingido ou ultrapassado'
                    : item.alert === 'WARNING'
                      ? ' · Atenção: próximo do limite'
                      : ''}
                </Text>
              </>
            ) : (
              <Text className="my-3 text-sm text-[#667085]">
                Valores e percentuais ocultos.
              </Text>
            )}
            <View className="flex-row gap-5">
              <TouchableOpacity
                onPress={() => {
                  setCategory(item.categoryId);
                  setAmount(formatCurrencyInput(item.amount));
                }}
              >
                <Text className="font-semibold text-[#047857]">
                  Editar limite
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  if (
                    !(await confirmAction(
                      'Remover orçamento',
                      'O histórico de despesas será mantido.',
                      'Remover',
                    ))
                  )
                    return;
                  try {
                    await planningService.deleteBudget(item.id);
                    await resource.reload();
                  } catch (err) {
                    notify(errorMessage(err, 'Não foi possível remover.'));
                  }
                }}
              >
                <Text className="font-semibold text-[#B42318]">Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
