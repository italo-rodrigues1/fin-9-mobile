import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
export default function MoreScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <ScreenHeader
        title="Mais"
        subtitle="Organize seu aplicativo e sua conta."
      />
      <View className="mx-4 overflow-hidden rounded-lg border border-[#E4E7EC] bg-white">
        {(
          [
            { title: 'Categorias', href: '/(tabs)/categories', icon: 'tag' },
            {
              title: 'Perfil e configurações',
              href: '/(tabs)/profile',
              icon: 'user',
            },
          ] as const
        ).map((item) => (
          <TouchableOpacity
            key={item.href}
            accessibilityRole="button"
            onPress={() => router.push(item.href)}
            className="flex-row items-center border-b border-[#EAECF0] p-5"
          >
            <Feather name={item.icon} size={20} color="#047857" />
            <Text className="ml-3 flex-1 text-base font-semibold text-[#344054]">
              {item.title}
            </Text>
            <Feather name="chevron-right" size={20} color="#667085" />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
