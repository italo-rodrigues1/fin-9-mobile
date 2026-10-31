import React from 'react';
import { View, TextInput, Text } from 'react-native';
import { COLORS, INPUT_LIMITS } from '../../constants';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'decimal-pad';
  error?: string;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  onFocus?: () => void;
  onBlur?: () => void;
  maxLength?: number;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  error,
  multiline,
  autoCapitalize = 'sentences',
  onFocus,
  onBlur,
  maxLength = INPUT_LIMITS.defaultText,
}: InputProps) {
  return (
    <View className="mb-4">
      {Boolean(label) && (
        <Text className="mb-2 ml-1 text-sm font-medium text-[#667085]">
          {label}
        </Text>
      )}
      <TextInput
        className={`rounded-lg border bg-white px-4 py-4 text-base text-[#344054] ${
          error ? 'border-[#FF6B6B]' : 'border-[#D0D5DD]'
        } ${multiline ? 'min-h-[120px] text-top' : ''}`}
        accessibilityLabel={label || placeholder}
        accessibilityHint={error}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        onFocus={onFocus}
        onBlur={onBlur}
        maxLength={maxLength}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {error && (
        <Text className="mt-2 ml-1 text-xs text-[#FF6B6B]">{error}</Text>
      )}
    </View>
  );
}
