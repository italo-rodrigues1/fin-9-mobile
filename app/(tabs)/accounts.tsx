import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccountStore } from '../../src/stores/accountStore';
import { usePrivacyStore } from '../../src/stores/privacyStore';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { QueryState } from '../../src/components/QueryState';
import { EmptyState } from '../../src/components/EmptyState';
import { Button } from '../../src/components/ui/Button';
import { formatCurrency } from '../../src/utils/format';
export default function AccountsScreen() {
  const { accounts, fetch, isLoading, error } = useAccountStore();
  const { showValues, toggle } = usePrivacyStore();
  const router = useRouter();
  const [archived, setArchived] = useState(false);
  useFocusEffect(
    useCallback(() => {
      void fetch();
    }, [fetch]),
  );
  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
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
      <View className="mx-4 mb-4 flex-row gap-3">
        <TouchableOpacity onPress={() => setArchived(false)}>
          <Text
            className={archived ? 'text-[#667085]' : 'font-bold text-[#047857]'}
          >
            Ativas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setArchived(true)}>
          <Text
            className={archived ? 'font-bold text-[#047857]' : 'text-[#667085]'}
          >
            Arquivadas
          </Text>
        </TouchableOpacity>
      </View>
      <QueryState
        loading={isLoading}
        error={error}
        retry={() => void fetch(true)}
      />
      <FlatList
        data={
          error || isLoading
            ? []
            : accounts.filter((a) => Boolean(a.isArchived) === archived)
        }
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
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={'Detalhes da conta ' + item.name}
            onPress={() =>
              router.push({
                pathname: '/accounts/detail',
                params: { id: item.id },
              })
            }
            className="mb-3 rounded-lg border border-[#E4E7EC] bg-white p-5"
            style={{ borderLeftColor: item.color, borderLeftWidth: 4 }}
          >
            <Text className="text-xs font-medium text-[#667085]">
              {item.institution}
            </Text>
            <Text className="mt-1 text-base font-semibold text-[#344054]">
              {item.name}
            </Text>
            <Text className="mt-4 text-2xl font-bold text-[#101828]">
              {showValues ? formatCurrency(item.balance) : 'R$ ••••••'}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
