import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandLogo } from '../../src/components/BrandLogo';
import { Button } from '../../src/components/ui/Button';
export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 28,
          justifyContent: 'center',
        }}
      >
        <BrandLogo />
        <Text className="mt-12 text-xs font-bold tracking-widest text-[#047857]">
          SUAS FINANÇAS, COM CLAREZA
        </Text>
        <Text className="mt-4 text-4xl font-bold leading-tight text-[#101828]">
          Mais controle. Melhores decisões.
        </Text>
        <Text className="mb-8 mt-5 text-base leading-7 text-[#475467]">
          Organize suas contas, registre receitas e despesas e acompanhe seu
          dinheiro em um só lugar.
        </Text>
        {[
          'Todas as suas contas organizadas',
          'Movimentações fáceis de registrar',
          'Seu histórico sempre à mão',
        ].map((label) => (
          <View key={label} className="mb-4 flex-row items-center">
            <Feather name="check-circle" size={20} color="#047857" />
            <Text className="ml-3 flex-1 text-base text-[#344054]">
              {label}
            </Text>
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
