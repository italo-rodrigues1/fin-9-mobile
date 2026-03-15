import { Tabs } from 'expo-router';
import { COLORS } from '../../src/constants';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarStyle: {
          display: 'none',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transações',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categorias',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
