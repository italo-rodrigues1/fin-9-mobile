import { useTheme } from '../../src/theme/ThemeProvider';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandLogo } from '../../src/components/BrandLogo';
import { Button } from '../../src/components/ui/Button';
export default function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-app-background">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 28,
          justifyContent: 'center',
        }}
      >
        <BrandLogo />
        <Text className="mt-12 text-xs font-bold tracking-widest text-app-primaryText">
          SUAS FINANÇAS, COM CLAREZA
        </Text>
        <Text className="mt-4 text-4xl font-bold leading-tight text-app-text">
          Mais controle. Melhores decisões.
        </Text>
        <Text className="mb-8 mt-5 text-base leading-7 text-app-textSecondary">
          Organize suas contas, registre receitas e despesas e acompanhe seu
          dinheiro em um só lugar.
        </Text>
        {[
          'Todas as suas contas organizadas',
          'Movimentações fáceis de registrar',
          'Seu histórico sempre à mão',
        ].map((label) => (
          <View key={label} className="mb-4 flex-row items-center">
            <Feather
              name="check-circle"
              size={20}
              color={theme.colors.primaryText}
            />
            <Text className="ml-3 flex-1 text-base text-app-text">{label}</Text>
          </View>
        ))}
        <View className="mt-8">
          <Button title="Entrar" onPress={() => router.push('/(auth)/login')} />
          <View className="mt-3">
            <Button
              title="Criar conta"
              variant="secondary"
              onPress={() => router.push('/(auth)/register')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
