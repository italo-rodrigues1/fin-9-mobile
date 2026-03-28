import { Tabs } from "expo-router";
import { InternalHeaderRight } from "../../src/components/layout/InternalHeaderRight";
import { useTheme } from "../../src/theme/useTheme";

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "bold" },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: {
          display: "none",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transações",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categorias",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          headerRight: () => <InternalHeaderRight />,
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
