import { useTheme } from '../../../src/theme/ThemeProvider';
import { Stack } from 'expo-router';
import { BackButton } from '../../../src/components/BackButton';

export default function TransactionsLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: 'bold' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
        headerLeft: () => <BackButton backgroundColor="transparent" />,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create" options={{ title: 'Nova Transação' }} />
      <Stack.Screen name="[id]" options={{ title: 'Editar Transação' }} />
    </Stack>
  );
}
