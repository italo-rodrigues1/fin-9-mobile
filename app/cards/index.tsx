import { useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { QueryState } from '../../src/components/QueryState';
import { CreditCardSummary } from '../../src/components/CreditCardSummary';
import { Button } from '../../src/components/ui/Button';
import { useResource } from '../../src/hooks/useResource';
import { cardService } from '../../src/services/cardService';
export default function Cards() {
  const router = useRouter(),
    r = useResource(useCallback(() => cardService.list(), []));
  return (
    <SafeAreaView className="flex-1 bg-app-background">
      <ScreenHeader
        title="Cartões de crédito"
        subtitle="Compras, parcelas e faturas."
      />
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        data={r.loading || r.error ? [] : r.data || []}
        keyExtractor={(c) => c.id}
        ListHeaderComponent={
          <View>
            <Button
              title="Novo cartão"
              onPress={() => router.push('/cards/edit')}
            />
            <Text className="my-4 text-sm leading-6 text-app-textMuted">
              Compras comprometem o limite. O saldo das contas e as despesas dos
              relatórios mudam ao registrar o pagamento da fatura.
            </Text>
            <QueryState loading={r.loading} error={r.error} retry={r.reload} />
          </View>
        }
        ListEmptyComponent={
          !r.loading && !r.error ? (
            <Text className="py-5 text-app-textMuted">
              Cadastre seu primeiro cartão para organizar as faturas.
            </Text>
          ) : undefined
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={'Abrir cartão ' + item.name}
            onPress={() =>
              router.push({
                pathname: '/cards/detail',
                params: { id: item.id },
              })
            }
          >
            <CreditCardSummary card={item} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
