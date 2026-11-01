import React from 'react';
import { View, Text } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  /* aria-label: Generic structural Card */
  return (
    <View
      className={`rounded-lg border border-app-border bg-app-surface p-4 ${className}`}
    >
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

export function SummaryCard({
  title,
  value,
  icon,
  color = 'neutral',
}: SummaryCardProps) {
  const colorClass = {
    success: 'text-app-primaryText',
    danger: 'text-app-danger',
    primary: 'text-app-primaryText',
    neutral: 'text-app-text',
  }[color];

  const bgClass = {
    success: 'bg-app-surface border-app-border',
    danger: 'bg-app-surface border-app-border',
    primary: 'bg-app-surface border-app-border',
    neutral: 'bg-app-surface border-app-border',
  }[color];

  return (
    <View className={`${bgClass} flex-1 rounded-lg border p-5`}>
      <Text className="mb-3 text-2xl">{icon}</Text>
      <Text className="text-xs font-medium uppercase tracking-wide text-app-textMuted">
        {title}
      </Text>
      <Text
        className={`${colorClass} mt-2 text-lg font-bold`}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}
