import React from "react";
import { View } from "react-native";
import { useTheme } from "../theme/useTheme";
import { Skeleton } from "./ui/Skeleton";

export function TransactionItemSkeleton() {
  const { colors } = useTheme();

  return (
    <View
      className="mb-3 flex-row items-center rounded-[18px] px-4 py-4"
      style={{ backgroundColor: colors.surface }}
    >
      <View
        className="mr-4 h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.backgroundMuted }}
      >
        <Skeleton width={22} height={22} borderRadius={11} />
      </View>

      <View className="flex-1 mr-3 justify-center">
        <Skeleton width="70%" height={20} borderRadius={4} />
        <View className="mt-1" />
        <Skeleton width="40%" height={14} borderRadius={4} />
      </View>

      <Skeleton width={80} height={20} borderRadius={4} />
    </View>
  );
}

export const TransactionItemSkeletonMemoized = React.memo(TransactionItemSkeleton);
