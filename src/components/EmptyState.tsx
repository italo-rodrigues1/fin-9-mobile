import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../theme/useTheme";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View className="items-center justify-center px-6 py-12">
      <View
        className="mb-5 h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.backgroundMuted }}
      >
        <Text className="text-4xl">{icon}</Text>
      </View>
      <Text
        className="mb-2 text-lg font-semibold"
        style={{ color: colors.text }}
      >
        {title}
      </Text>
      <Text
        className="text-center text-sm leading-6"
        style={{ color: colors.textMuted }}
      >
        {description}
      </Text>
    </View>
  );
}
