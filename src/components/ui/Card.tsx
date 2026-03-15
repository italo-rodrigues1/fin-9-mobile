import React from 'react';
import { View, Text } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  /* aria-label: Generic structural Card */
  return (
    <View className={`rounded-[24px] border border-[#EEF2F5] bg-white p-4 ${className}`}>
      {children}
    </View>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  icon: string;
  color?: 'success' | 'danger' | 'primary' | 'neutral';
}

export function SummaryCard({ title, value, icon, color = 'neutral' }: SummaryCardProps) {
  const colorClass = {
    success: 'text-[#6CCF7F]',
    danger: 'text-[#FF6B6B]',
    primary: 'text-[#169670]',
    neutral: 'text-[#344054]',
  }[color];

  const bgClass = {
    success: 'bg-white border-[#EEF2F5]',
    danger: 'bg-white border-[#EEF2F5]',
    primary: 'bg-white border-[#EEF2F5]',
    neutral: 'bg-white border-[#EEF2F5]',
  }[color];

  return (
    <View className={`${bgClass} flex-1 rounded-[20px] border p-5`}>
      <Text className="mb-3 text-2xl">{icon}</Text>
      <Text className="text-xs font-medium uppercase tracking-wide text-[#98A2B3]">{title}</Text>
      <Text className={`${colorClass} mt-2 text-lg font-bold`} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
