import { useCallback, useRef, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { QueryState } from '../../src/components/QueryState';
import { GoalCard } from '../../src/components/GoalCard';
import { Button } from '../../src/components/ui/Button';
import { LoadingSkeleton } from '../../src/components/LoadingSkeleton';
import { useResource } from '../../src/hooks/useResource';
import { goalService } from '../../src/services/goalService';
import { GoalContribution, GoalDetail } from '../../src/types';
import { usePrivacyStore } from '../../src/stores/privacyStore';
import { notify } from '../../src/stores/feedbackStore';
import { confirmAction } from '../../src/utils/confirmAction';
import { errorMessage } from '../../src/utils/errorMessage';
import { formatCurrency, formatDate } from '../../src/utils/format';
export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    router = useRouter(),
    busy = useRef(false),
    pageBusy = useRef(false),
    show = usePrivacyStore((s) => s.showValues);
  const resource = useResource(useCallback(() => goalService.detail(id), [id]));
  const latest = useRef(resource.data);
  latest.current = resource.loading ? null : resource.data;
  const [extra, setExtra] = useState<{
      source: GoalDetail;
      rows: GoalContribution[];
      hasMore: boolean;
    } | null>(null),
    [moreLoading, setMoreLoading] = useState(false),
    [saving, setSaving] = useState(false);
  const rows = resource.data
      ? [
          ...resource.data.contributions,
          ...(extra?.source === resource.data ? extra.rows : []),
        ]
      : [],
    hasMore =
      extra?.source === resource.data ? extra.hasMore : resource.data?.hasMore;
  const loadMore = async () => {
    const source = resource.data;
    if (!source || pageBusy.current || resource.loading) return;
    pageBusy.current = true;
    setMoreLoading(true);
    try {
      const page = await goalService.detail(id, rows.length);
      if (latest.current === source)
        setExtra({
          source,
          rows: [
            ...(extra?.source === source ? extra.rows : []),
            ...page.contributions,
          ],
          hasMore: page.hasMore,
        });
    } catch (err) {
      notify(
        errorMessage(err, 'Não foi possível carregar mais contribuições.'),
      );
    } finally {
      pageBusy.current = false;
      setMoreLoading(false);
    }
  };
  const remove = async (contributionId?: string) => {
    if (busy.current) return;
    if (
      !(await confirmAction(
        contributionId ? 'Remover contribuição' : 'Excluir meta',
        contributionId
          ? 'Esta destinação será removida. O saldo da conta será mantido.'
          : 'A meta e suas contribuições serão excluídas. O dinheiro continuará nas contas.',
        contributionId ? 'Remover' : 'Excluir',
      ))
    )
      return;
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    try {
      if (contributionId) {
        await goalService.removeContribution(id, contributionId);
        await resource.reload();
        notify('Contribuição removida.');
      } else {
        await goalService.remove(id);
        notify('Meta excluída.');
        router.replace('/goals');
      }
    } catch (err) {
      notify(errorMessage(err, 'Não foi possível remover.'));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <ScreenHeader title="Detalhes da meta" />
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        data={resource.loading || resource.error ? [] : rows}
        keyExtractor={(c) => c.id}
        ListHeaderComponent={
          <View>
            <QueryState
              loading={resource.loading}
              error={resource.error}
              retry={resource.reload}
            />
            {!resource.loading && !resource.error && resource.data ? (
              <>
                <GoalCard goal={resource.data.goal} />
                <Text className="mb-4 text-sm leading-6 text-[#667085]">
                  As contribuições destinam dinheiro que já está nas contas. Se
                  o saldo diminuir, a cobertura é dividida proporcionalmente
                  entre as metas da mesma conta.
                </Text>
                <Button
                  title="Adicionar contribuição"
                  onPress={() =>
                    router.push({
                      pathname: '/goals/contribution',
                      params: { goalId: id },
                    })
                  }
                  disabled={saving}
                />
                <View className="my-3">
                  <Button
                    title="Editar meta"
                    variant="outline"
                    onPress={() =>
                      router.push({ pathname: '/goals/edit', params: { id } })
                    }
                    disabled={saving}
                  />
                </View>
                <Button
                  title="Excluir meta"
                  variant="danger"
                  onPress={() => remove()}
                  isLoading={saving}
                />
                <Text className="mb-4 mt-7 text-lg font-semibold text-[#101828]">
                  Contribuições
                </Text>
              </>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !resource.loading && !resource.error ? (
            <Text className="py-4 text-[#667085]">
              Nenhuma contribuição. Destine parte do saldo de uma conta para
              começar.
            </Text>
          ) : undefined
        }
        renderItem={({ item }) => (
          <View className="mb-3 rounded-lg border border-[#E4E7EC] bg-white p-4">
            <Text className="text-lg font-semibold text-[#101828]">
              {show ? formatCurrency(item.amount) : 'R$ ••••••'}
            </Text>
            <Text className="mt-2 text-sm text-[#667085]">
              {item.account?.name}
              {item.account?.isArchived ? ' · Arquivada' : ''} ·{' '}
              {formatDate(item.date)}
            </Text>
            {item.note ? (
              <Text className="mt-2 text-sm text-[#475467]">{item.note}</Text>
            ) : null}
            <View className="mt-4">
              <Button
                title="Editar contribuição"
                variant="outline"
                disabled={saving}
                onPress={() =>
                  router.push({
                    pathname: '/goals/contribution',
                    params: { goalId: id, id: item.id },
                  })
                }
              />
            </View>
            <View className="mt-2">
              <Button
                title="Remover contribuição"
                variant="outline"
                disabled={saving}
                onPress={() => remove(item.id)}
              />
            </View>
          </View>
        )}
        ListFooterComponent={
          !resource.loading && !resource.error && hasMore ? (
            <View className="mt-3">
              {moreLoading ? (
                <LoadingSkeleton
                  variant="list"
                  label="Carregando contribuições"
                />
              ) : (
                <Button
                  title="Carregar mais contribuições"
                  onPress={loadMore}
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
