import React, { useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CATEGORY_ICONS } from "../constants";
import { useTheme } from "../theme/useTheme";
import { Transaction, TransactionType } from "../types";
import { formatCurrency, formatDateShort } from "../utils/format";

interface TransactionItemProps {
  item: Transaction;
  onPress: (item: Transaction) => void;
}

function TransactionItemComponent({ item, onPress }: TransactionItemProps) {
  const isIncome = item.type === TransactionType.INCOME;
  const icon = item.category ? CATEGORY_ICONS[item.category.icon] || "🏷️" : "🏷️";
  const { colors, isDark } = useTheme();

  const handlePress = useCallback(() => onPress(item), [item, onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className="mb-3 flex-row items-center rounded-[18px] px-4 py-4"
      style={{ backgroundColor: colors.surface }}
    >
      <View
        className="mr-4 h-11 w-11 items-center justify-center rounded-full"
        style={{
          backgroundColor: item.category?.color
            ? `${item.category.color}20`
            : colors.backgroundMuted,
        }}
      >
        <Text className="text-xl">{icon}</Text>
      </View>

      <View className="flex-1 mr-3 justify-center">
        <Text
          className="mb-1 text-base font-semibold"
          style={{ color: colors.text }}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text className="text-xs font-medium" style={{ color: colors.textMuted }}>
          {formatDateShort(item.date)}
        </Text>
      </View>

      <Text
        className="text-base font-semibold"
        style={{ color: isIncome ? colors.success : isDark ? "#FDA4AF" : colors.danger }}
      >
        {isIncome ? "+" : "-"} {formatCurrency(item.amount)}
      </Text>
    </TouchableOpacity>
  );
}

export const TransactionItem = React.memo(TransactionItemComponent);
