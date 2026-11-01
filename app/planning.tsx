import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { QueryState } from '../src/components/QueryState';
import { Button } from '../src/components/ui/Button';
import { getLocalDateValue } from '../src/components/ui/DateInput';
import { useResource } from '../src/hooks/useResource';
import { planningService } from '../src/services/planningService';
import { usePrivacyStore } from '../src/stores/privacyStore';
import { useTransactionStore } from '../src/stores/transactionStore';
import { notify } from '../src/stores/feedbackStore';
import { confirmAction } from '../src/utils/confirmAction';
import { errorMessage } from '../src/utils/errorMessage';
import { formatCurrency, formatDate } from '../src/utils/format';
import { Transaction } from '../src/types';
export default function Planning() {
  const router = useRouter(),
    show = usePrivacyStore((s) => s.showValues),
    resource = useResource(
      useCallback(
        async () => ({
          upcoming: await planningService.upcoming(),
          rules: await planningService.recurrences(),
        }),
        [],
      ),
    );
  const [busy, setBusy] = useState<string | null>(null);
  const lock = useRef(false);
  const confirm = async (item: Transaction) => {
    if (lock.current) return;
    const today = getLocalDateValue();
    if (
      !(await confirmAction(
        'Confirmar movimentação',
        'Registrar ' +
          item.title +
          ' como ' +
          (item.type === 'INCOME' ? 'recebido' : 'pago') +
          ' hoje (' +
          today.split('-').reverse().join('/') +
          ')? O saldo da conta será atualizado.',
        'Confirmar',
      ))
    )
      return;
    lock.current = true;
    setBusy(item.id);
    try {
      await useTransactionStore
        .getState()
        .update(item.id, { status: 'CONFIRMED', date: today });
      await resource.reload();
      notify('Movimentação confirmada.');
    } catch (err) {
      notify(errorMessage(err, 'Não foi possível confirmar.'));
    } finally {
      lock.current = false;
      setBusy(null);
    }
  };
  const due = (date: string) => {
    const delta = Math.round(
      (new Date(date.slice(0, 10)).getTime() -
        new Date(getLocalDateValue()).getTime()) /
        86400000,
    );
    return delta < 0
      ? 'Vencido'
      : delta === 0
        ? 'Vence hoje'
        : delta <= 3
          ? 'Vence em ' + delta + ' dia(s)'
          : 'Previsto';
  };
  return (
    <SafeAreaView className="flex-1 bg-app-background">
      <FlatList
        data={
          resource.loading || resource.error
            ? []
            : resource.data?.upcoming || []
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListHeaderComponent={
          <View>
            <ScreenHeader
              title="Planejamento"
              subtitle="Previstos não alteram o saldo até a confirmação."
            />
            <Button
              title="Nova recorrência"
              onPress={() => router.push('/recurrence')}
            />
            <View className="mt-3">
              <Button
                title="Lançamento previsto avulso"
                variant="outline"
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/transactions/create',
                    params: { status: 'PLANNED' },
                  })
                }
              />
            </View>
            <QueryState
              loading={resource.loading}
              error={resource.error}
              retry={resource.reload}
            />
            {!resource.loading && !resource.error ? (
              <>
                <Text className="mb-3 mt-5 text-lg font-semibold text-app-text">
                  Recorrências
                </Text>
                {resource.data?.rules.map((rule) => (
                  <TouchableOpacity
                    key={rule.id}
                    accessibilityRole="button"
                    onPress={() =>
                      router.push({
                        pathname: '/recurrence',
                        params: { id: rule.id },
                      })
                    }
                    className="mb-3 rounded-lg border border-app-border bg-app-surface p-4"
                  >
                    <Text className="font-semibold text-app-text">
                      {rule.title} · {rule.active ? 'Ativa' : 'Encerrada'}
                    </Text>
                    <Text className="mt-2 text-sm text-app-textMuted">
                      {rule.interval === 'MONTHLY'
                        ? 'Mensal'
                        : rule.interval === 'WEEKLY'
                          ? 'Semanal'
                          : 'Anual'}{' '}
                      · {show ? formatCurrency(rule.amount) : 'R$ ••••••'}
                    </Text>
                  </TouchableOpacity>
                ))}
                {!resource.data?.rules.length ? (
                  <Text className="mb-4 text-app-textMuted">
                    Nenhuma recorrência cadastrada.
                  </Text>
                ) : null}
                <Text className="mb-3 mt-4 text-lg font-semibold text-app-text">
                  Próximos compromissos
                </Text>
                <Text className="mb-4 text-xs text-app-textMuted">
                  Até 100 ocorrências, incluindo vencidas. As recorrências
                  mantêm uma previsão de 12 meses.
                </Text>
              </>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !resource.loading && !resource.error ? (
            <Text className="p-4 text-app-textMuted">
              Nenhum compromisso pendente.
            </Text>
          ) : undefined
        }
        renderItem={({ item }) => (
          <View className="mb-3 rounded-lg border border-app-border bg-app-surface p-4">
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => router.push('/(tabs)/transactions/' + item.id)}
            >
              <Text className="font-semibold text-app-text">{item.title}</Text>
              <Text className="mt-2 text-sm font-medium text-app-warning">
                {due(item.date)} · {formatDate(item.date)}
              </Text>
              <Text className="my-3 text-lg font-bold text-app-text">
                {show ? formatCurrency(item.amount) : 'R$ ••••••'}
              </Text>
            </TouchableOpacity>
            <Button
              title={
                item.type === 'INCOME'
                  ? 'Confirmar recebimento'
                  : 'Confirmar pagamento'
              }
              onPress={() => void confirm(item)}
              isLoading={busy === item.id}
              disabled={Boolean(busy)}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}
