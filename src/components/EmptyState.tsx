import React from 'react';
import { View, Text } from 'react-native';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <View className="items-center justify-center px-6 py-12">
      <View className="mb-5 h-20 w-20 items-center justify-center rounded-full bg-[#F2F4F7]">
        <Text className="text-4xl">{icon}</Text>
      </View>
      <Text className="mb-2 text-lg font-semibold text-[#344054]">{title}</Text>
      <Text className="text-center text-sm leading-6 text-[#98A2B3]">{description}</Text>
    </View>
  );
}
