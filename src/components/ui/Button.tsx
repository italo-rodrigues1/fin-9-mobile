import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';
import { COLORS } from '../../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', isLoading, disabled, style }: ButtonProps) {
  const baseClass = 'min-h-[56px] flex-row items-center justify-center rounded-[16px] px-5 py-4';

  const variantClass = {
    primary: '',
    secondary: 'border border-[#E5E7EB] bg-white',
    danger: '',
    outline: 'border border-[#D6DEE6] bg-transparent',
  }[variant];

  const textClass = {
    primary: 'text-white font-semibold text-lg',
    secondary: 'text-[#344054] font-semibold text-lg',
    danger: 'text-white font-semibold text-lg',
    outline: 'text-[#344054] font-semibold text-lg',
  }[variant];

  const backgroundColor = {
    primary: COLORS.primary,
    secondary: COLORS.surface,
    danger: COLORS.danger,
    outline: 'transparent',
  }[variant];

  const spinnerColor = variant === 'primary' || variant === 'danger' ? '#FFFFFF' : COLORS.text;

  return (
    <TouchableOpacity
      className={`${baseClass} ${variantClass} ${disabled || isLoading ? 'opacity-60' : ''}`}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[{ backgroundColor }, style]}
    >
      {isLoading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <Text className={textClass}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
