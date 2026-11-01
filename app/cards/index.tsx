import { useCallback } from 'react';
import { Feather } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { QueryState } from '../../src/components/QueryState';
import { CreditCardCarousel } from '../../src/components/CreditCardCarousel';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useResource } from '../../src/hooks/useResource';
import { cardService } from '../../src/services/cardService';
export default function Cards() {
  const theme = useTheme();
  const router = useRouter(),
    r = useResource(useCallback(() => cardService.list(), []));
  return (
    <SafeAreaView className="flex-1 bg-app-background">
      <ScreenHeader
        title="Cartões de crédito"
        subtitle="Compras, parcelas e faturas."
        right={
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Novo cartão"
            onPress={() => router.push('/cards/edit')}
            className="h-11 w-11 items-center justify-center rounded-full bg-app-primary"
          >
            <Feather name="plus" size={22} color={theme.colors.onPrimary} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <QueryState loading={r.loading} error={r.error} retry={r.reload} />
        {!r.loading && !r.error && r.data?.length ? (
          <CreditCardCarousel
            cards={r.data}
            onOpen={(item) =>
              router.push({
                pathname: '/cards/detail',
                params: { id: item.id },
              })
            }
            onPurchase={(item) =>
              router.push({
                pathname: '/cards/purchase',
                params: { cardId: item.id },
              })
            }
          />
        ) : null}
        {!r.loading && !r.error && r.data?.length ? (
          <Text className="mb-4 text-xs leading-5 text-app-textMuted">
            Compras comprometem o limite. O saldo das contas e as despesas dos
            relatórios mudam ao registrar o pagamento da fatura.
          </Text>
        ) : undefined}
        {!r.loading && !r.error && !r.data?.length ? (
          <Text className="py-5 text-app-textMuted">
            Cadastre seu primeiro cartão para organizar as faturas.
          </Text>
        ) : undefined}
      </ScrollView>
    </SafeAreaView>
  );
}
