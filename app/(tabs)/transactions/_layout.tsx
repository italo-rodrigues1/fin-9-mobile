import { Stack } from "expo-router";
import { InternalHeaderRight } from "../../../src/components/layout/InternalHeaderRight";
import { useTheme } from "../../../src/theme/useTheme";

export default function TransactionsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "bold" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
        headerLeft: () => <InternalHeaderRight />,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Transações" }} />
      <Stack.Screen name="create" options={{ title: "Nova Transação" }} />
      <Stack.Screen name="[id]" options={{ title: "" }} />
    </Stack>
  );
}
