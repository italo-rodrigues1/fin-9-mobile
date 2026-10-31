import { usePrivacyStore } from '../stores/privacyStore';
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatDateShort } from '../utils/format';
import { CATEGORY_ICONS } from '../constants';

interface TransactionItemProps {
  item: Transaction;
  onPress: (item: Transaction) => void;
}

function TransactionItemComponent({ item, onPress }: TransactionItemProps) {
  const showValues = usePrivacyStore((state) => state.showValues);
  const isIncome = item.type === TransactionType.INCOME;
  const icon = item.category
    ? CATEGORY_ICONS[item.category.icon] || '🏷️'
    : '🏷️';

  const handlePress = useCallback(() => onPress(item), [item, onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className="mb-3 flex-row items-center rounded-lg bg-white px-4 py-4"
    >
      <View
        className="mr-4 h-11 w-11 items-center justify-center rounded-full"
        style={{
          backgroundColor: item.category?.color
            ? `${item.category.color}20`
            : '#F2F4F7',
        }}
      >
        <Text className="text-xl">{icon}</Text>
      </View>

      <View className="flex-1 mr-3 justify-center">
        <Text
          className="mb-1 text-base font-semibold text-[#344054]"
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text className="text-xs font-medium text-[#667085]">
          {formatDateShort(item.date)}
          {item.status === 'PLANNED' ? ' · Previsto' : ''}
        </Text>
      </View>

      <Text
        className={`text-base font-semibold ${isIncome ? 'text-[#047857]' : 'text-[#FF6B6B]'}`}
      >
        {showValues
          ? `${isIncome ? '+' : '-'} ${formatCurrency(item.amount)}`
          : 'R$ ••••••'}
      </Text>
    </TouchableOpacity>
  );
}

export const TransactionItem = React.memo(TransactionItemComponent);
