import { useCallback } from 'react';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccountStore } from '../../src/stores/accountStore';
import { useTheme } from '../../src/theme/ThemeProvider';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { QueryState } from '../../src/components/QueryState';
import { EmptyState } from '../../src/components/EmptyState';
import { AccountCard } from '../../src/components/AccountCard';
export default function AccountsScreen() {
  const { accounts, fetch, isLoading, error } = useAccountStore();
  const theme = useTheme();
  const router = useRouter();
  useFocusEffect(
    useCallback(() => {
      void fetch();
    }, [fetch]),
  );
  return (
    <SafeAreaView
      className="flex-1 bg-app-background"
      edges={['top', 'left', 'right']}
    >
      <ScreenHeader
        title="Contas"
        subtitle="Seus saldos, organizados por instituição."
        right={
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Nova conta"
            onPress={() => router.push('/accounts/create')}
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          >
            <Feather name="plus" size={22} color={theme.colors.onPrimary} />
          </TouchableOpacity>
        }
      />
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
            onTransfer={() =>
              router.push({
                pathname: '/transfer',
                params: { fromAccountId: item.id },
              })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
