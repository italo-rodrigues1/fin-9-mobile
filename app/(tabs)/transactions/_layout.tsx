import { Stack } from 'expo-router';

export default function TransactionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#F7F8FA' },
        headerTintColor: '#344054',
        headerTitleStyle: { fontWeight: 'bold' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#F7F8FA' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Transações' }} />
      <Stack.Screen name="create" options={{ title: 'Nova Transação' }} />
      <Stack.Screen name="[id]" options={{ title: 'Editar Transação' }} />
    </Stack>
  );
}
