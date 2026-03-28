import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/useTheme";

export function InternalHeaderRight() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => router.replace("/(tabs)")}
      activeOpacity={0.75}
      className="mr-1 h-10 w-10 items-center justify-center rounded-full"
      style={{ backgroundColor: colors.surfaceSecondary }}
    >
      <Feather name="arrow-left" size={18} color={colors.text} />
    </TouchableOpacity>
  );
}
