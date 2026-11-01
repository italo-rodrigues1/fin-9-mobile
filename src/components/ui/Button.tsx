import { useTheme } from '../../theme/ThemeProvider';
import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import { LoadingSkeleton } from '../LoadingSkeleton';
import { COLORS } from '../../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  isLoading,
  disabled,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const baseClass =
    'min-h-[56px] flex-row items-center justify-center rounded-lg px-5 py-4';

  const variantClass = {
    primary: '',
    secondary: 'border border-app-border bg-app-surface',
    danger: '',
    outline: 'border border-app-border bg-transparent',
  }[variant];

  const textClass = {
    primary: 'text-white font-semibold text-lg',
    secondary: 'text-app-text font-semibold text-lg',
    danger: 'text-white font-semibold text-lg',
    outline: 'text-app-text font-semibold text-lg',
  }[variant];

  const backgroundColor = {
    primary: theme.colors.primary,
    secondary: theme.colors.surface,
    danger: theme.colors.dangerSolid,
    outline: 'transparent',
  }[variant];

  return (
    <TouchableOpacity
      className={`${baseClass} ${variantClass} ${disabled || isLoading ? 'opacity-60' : ''}`}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{
        disabled: Boolean(disabled || isLoading),
        busy: Boolean(isLoading),
      }}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[{ backgroundColor }, style]}
    >
      {isLoading ? (
        <LoadingSkeleton
          variant="button"
          label={`${title}: processando`}
          light={variant === 'primary' || variant === 'danger'}
        />
      ) : (
        <Text className={textClass}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
