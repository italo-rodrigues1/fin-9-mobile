import { Tabs } from 'expo-router';
import { AppTabBar } from '../../src/components/AppTabBar';
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AppTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      <Tabs.Screen name="transactions" options={{ title: 'Transações' }} />
      <Tabs.Screen name="accounts" options={{ title: 'Contas' }} />
      <Tabs.Screen name="more" options={{ title: 'Mais' }} />
    </Tabs>
  );
}
