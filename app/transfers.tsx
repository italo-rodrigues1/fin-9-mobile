import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { QueryState } from '../src/components/QueryState';
import { Button } from '../src/components/ui/Button';
import { planningService } from '../src/services/planningService';
import { useResource } from '../src/hooks/useResource';
import { usePrivacyStore } from '../src/stores/privacyStore';
import { formatCurrency, formatDate } from '../src/utils/format';
export default function Transfers() {
  const router = useRouter(),
    show = usePrivacyStore((s) => s.showValues),
    resource = useResource(useCallback(() => planningService.transfers(), []));
  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <ScreenHeader
        title="Transferências"
        subtitle="As últimas 100 operações entre suas contas."
      />
      <Button
        title="Nova transferência"
        onPress={() => router.push('/transfer')}
      />
      <QueryState
        loading={resource.loading}
        error={resource.error}
        retry={resource.reload}
      />
      <FlatList
        data={resource.loading || resource.error ? [] : resource.data || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          !resource.loading && !resource.error ? (
            <Text className="p-5 text-[#667085]">
              Nenhuma transferência registrada.
            </Text>
          ) : undefined
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() =>
              router.push({ pathname: '/transfer', params: { id: item.id } })
            }
            className="mb-3 rounded-lg border border-[#E4E7EC] bg-white p-4"
          >
            <Text className="font-semibold text-[#344054]">
              {item.fromAccount?.name} → {item.toAccount?.name}
            </Text>
            <Text className="mt-2 text-sm text-[#667085]">
              {formatDate(item.date)}
            </Text>
            <Text className="mt-3 text-lg font-bold text-[#101828]">
              {show ? formatCurrency(item.amount) : 'R$ ••••••'}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
