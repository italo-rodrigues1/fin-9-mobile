import { Stack } from 'expo-router';

export default function AccountsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F7F8FA' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="create" />
    </Stack>
  );
}
