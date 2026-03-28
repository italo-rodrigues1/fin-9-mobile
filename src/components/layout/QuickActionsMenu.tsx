import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TransactionType } from "../../types";
import { useTheme } from "../../theme/useTheme";

interface QuickActionsMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function QuickActionsMenu({
  isOpen,
  onToggle,
}: QuickActionsMenuProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const quickActions = [
    {
      key: "expense",
      label: "Nova Despesa",
      icon: <Feather name="credit-card" size={18} color="#FF5A52" />,
      iconBackground: isDark ? "#331615" : "#FFF1F1",
      onPress: () => {
        onToggle();
        router.push({
          pathname: "/(tabs)/transactions/create",
          params: { type: TransactionType.EXPENSE },
        });
      },
    },
    {
      key: "income",
      label: "Nova Receita",
      icon: <Feather name="credit-card" size={18} color="#169670" />,
      iconBackground: isDark ? "#103025" : "#EAFBF0",
      onPress: () => {
        onToggle();
        router.push({
          pathname: "/(tabs)/transactions/create",
          params: { type: TransactionType.INCOME },
        });
      },
    },
    {
      key: "account",
      label: "Nova Conta",
      icon: (
        <MaterialCommunityIcons name="bank-outline" size={18} color="#1D67C1" />
      ),
      iconBackground: isDark ? "#15273B" : "#EAF2FF",
      onPress: () => {
        onToggle();
        router.push("/(tabs)/accounts/create");
      },
    },
  ];

  return (
    <>
      {isOpen ? (
        <TouchableOpacity
          activeOpacity={1}
          onPress={onToggle}
          className="absolute inset-0"
          style={{ backgroundColor: colors.overlay }}
        >
          <View className="flex-1" />
        </TouchableOpacity>
      ) : null}

      {isOpen ? (
        <View
          className="absolute right-4 w-[174px] rounded-[24px] px-4 py-3"
          style={{
            bottom: 96 + insets.bottom,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.key}
              onPress={action.onPress}
              activeOpacity={0.75}
              className="flex-row items-center py-3"
            >
              <View
                className="mr-3 h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: action.iconBackground }}
              >
                {action.icon}
              </View>
              <Text
                className="text-sm font-semibold"
                style={{ color: colors.text }}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <TouchableOpacity
        onPress={onToggle}
        className="absolute right-4 h-14 w-14 items-center justify-center rounded-full"
        style={{
          bottom: 24 + insets.bottom,
          backgroundColor: colors.primary,
          shadowColor: colors.shadow,
          shadowOpacity: 0.22,
          shadowRadius: 10,
          elevation: 6,
        }}
        activeOpacity={0.82}
      >
        <Feather
          name={isOpen ? "x" : "plus"}
          size={22}
          color={isDark ? "#052E25" : "#FFFFFF"}
        />
      </TouchableOpacity>
    </>
  );
}
