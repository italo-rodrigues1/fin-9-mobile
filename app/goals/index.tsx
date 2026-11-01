import { useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { QueryState } from '../../src/components/QueryState';
import { GoalCard } from '../../src/components/GoalCard';
import { Button } from '../../src/components/ui/Button';
import { useResource } from '../../src/hooks/useResource';
import { goalService } from '../../src/services/goalService';
export default function Goals() {
  const router = useRouter(),
    resource = useResource(useCallback(() => goalService.overview(), []));
  return (
    <SafeAreaView className="flex-1 bg-app-background">
      <ScreenHeader
        title="Metas"
        subtitle="Dê um destino ao dinheiro das suas contas."
      />
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        data={
          resource.loading || resource.error ? [] : resource.data?.goals || []
        }
        keyExtractor={(g) => g.id}
        ListHeaderComponent={
          <View>
            <Button
              title="Nova meta"
              onPress={() => router.push('/goals/edit')}
            />
            <Text className="my-4 text-sm leading-6 text-app-textMuted">
              As contribuições organizam dinheiro que já está nas suas contas.
              Não alteram saldos nem entram como receita ou despesa.
            </Text>
            <QueryState
              loading={resource.loading}
              error={resource.error}
              retry={resource.reload}
            />
          </View>
        }
        ListEmptyComponent={
          !resource.loading && !resource.error ? (
            <Text className="py-6 text-app-textMuted">
              Crie sua primeira meta para acompanhar um objetivo.
            </Text>
          ) : undefined
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={'Abrir meta ' + item.name}
            onPress={() =>
              router.push({
                pathname: '/goals/detail',
                params: { id: item.id },
              })
            }
          >
            <GoalCard goal={item} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
