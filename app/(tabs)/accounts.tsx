import { useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccountStore } from '../../src/stores/accountStore';
import { usePrivacyStore } from '../../src/stores/privacyStore';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { QueryState } from '../../src/components/QueryState';
import { EmptyState } from '../../src/components/EmptyState';
import { Button } from '../../src/components/ui/Button';
import { AccountCard } from '../../src/components/AccountCard';
export default function AccountsScreen() {
  const { accounts, fetch, isLoading, error } = useAccountStore();
  const { showValues, toggle } = usePrivacyStore();
  const router = useRouter();
  useFocusEffect(
    useCallback(() => {
      void fetch();
    }, [fetch]),
  );
  return (
    <SafeAreaView className="flex-1 bg-app-background">
      <ScreenHeader
        title="Contas"
        subtitle="Seus saldos, organizados por instituição."
      />
      <View className="mx-4 mb-4">
        <Button
          title="Nova conta"
          onPress={() => router.push('/accounts/create')}
        />
        <View className="mt-2">
          <Button
            variant="secondary"
            title={showValues ? 'Ocultar valores' : 'Mostrar valores'}
            onPress={toggle}
          />
        </View>
      </View>
      <QueryState
        loading={isLoading}
        error={error}
        retry={() => void fetch(true)}
      />
      <FlatList
        data={error || isLoading ? [] : accounts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          !isLoading && !error ? (
            <EmptyState
              title="Nenhuma conta"
              description="Cadastre sua primeira conta para começar."
              icon="🏦"
            />
          ) : undefined
        }
        renderItem={({ item }) => (
          <AccountCard
            account={item}
            onPress={() =>
              router.push({
                pathname: '/accounts/detail',
                params: { id: item.id },
              })
            }
            onTransfer={() => router.push({ pathname: '/transfer', params: { fromAccountId: item.id } })}
          />
        )}
      />
    </SafeAreaView>
  );
}
