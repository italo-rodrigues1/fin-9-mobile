import React from "react";
import { View, Text, ViewProps } from "react-native";
import { useTheme } from "../../theme/useTheme";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  const { colors } = useTheme();

  /* aria-label: Generic structural Card */
  return (
    <View
      className={`rounded-[24px] border p-4 ${className}`}
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      {...props}
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

export function SummaryCard({ title, value, icon, color = "neutral" }: SummaryCardProps) {
  const { colors } = useTheme();
  const valueColor = {
    success: colors.success,
    danger: colors.danger,
    primary: colors.primary,
    neutral: colors.text,
  }[color];

  return (
    <View
      className="flex-1 rounded-[20px] border p-5"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <Text className="mb-3 text-2xl">{icon}</Text>
      <Text
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: colors.textMuted }}
      >
        {title}
      </Text>
      <Text
        className="mt-2 text-lg font-bold"
        style={{ color: valueColor }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}
