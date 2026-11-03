import { useTheme } from '../../src/theme/ThemeProvider';
import { confirmAction } from '../../src/utils/confirmAction';
import { useAuthStore } from '../../src/stores/authStore';
import { notify } from '../../src/stores/feedbackStore';
import { Button } from '../../src/components/ui/Button';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
export default function MoreScreen() {
  const theme = useTheme();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const handleLogout = async () => {
    if (!(await confirmAction('Sair', 'Tem certeza que deseja sair?', 'Sair')))
      return;
    try {
      await logout();
    } catch {
      notify('Não foi possível sair. Tente novamente.');
    }
  };
  return (
    <SafeAreaView
      className="flex-1 bg-app-background"
      edges={['top', 'left', 'right']}
    >
      <ScreenHeader
        title="Mais"
        subtitle="Organize seu aplicativo e sua conta."
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="mx-4 overflow-hidden rounded-lg border border-app-border bg-app-surface">
          {(
            [
              {
                title: 'Cartões de crédito',
                href: '/cards',
                icon: 'credit-card',
              },
              { title: 'Metas', href: '/goals', icon: 'target' },
              { title: 'Planejamento', href: '/planning', icon: 'calendar' },
              { title: 'Orçamentos', href: '/budgets', icon: 'pie-chart' },
              { title: 'Transferências', href: '/transfers', icon: 'repeat' },
              { title: 'Categorias', href: '/categories', icon: 'tag' },
              {
                title: 'Perfil e configurações',
                href: '/profile',
                icon: 'user',
              },
            ] as const
          ).map((item) => (
            <TouchableOpacity
              key={item.href}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              onPress={() => router.push(item.href)}
              className="flex-row items-center border-b border-app-border p-5"
            >
              <Feather
                name={item.icon}
                size={20}
                color={theme.colors.primary}
              />
              <Text className="ml-3 flex-1 text-base font-semibold text-app-text">
                {item.title}
              </Text>
              <Feather
                name="chevron-right"
                size={20}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>
        <View className="p-4">
          <Button
            title="Sair da conta"
            onPress={handleLogout}
            variant="outline"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
