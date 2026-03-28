import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../theme/useTheme";

interface BrandLogoProps {
  muted?: boolean;
}

export function BrandLogo({ muted = false }: BrandLogoProps) {
  const { colors } = useTheme();
  const brandColor = muted ? colors.textMuted : colors.primary;

  return (
    <View className="flex-row items-center">
      <View
        className="mr-2 h-5 w-5 rounded-md border"
        style={{ borderColor: brandColor }}
      >
        <View
          className="absolute left-[2px] top-[5px] h-[7px] w-[11px] rounded-sm border"
          style={{ borderColor: brandColor }}
        />
        <View
          className="absolute left-[5px] top-[-2px] h-[5px] w-[8px] rounded-t-full border-x border-t bg-transparent"
          style={{ borderColor: brandColor }}
        />
      </View>
      <Text
        className="text-[18px] font-semibold tracking-[-0.3px]"
        style={{ color: brandColor }}
      >
        Fin-9
      </Text>
    </View>
  );
}
