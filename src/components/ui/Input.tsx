import type { TextInputInstance } from 'react-native';
import { useFormInputFocus } from '../KeyboardForm';
import { useTheme } from '../../theme/ThemeProvider';
import React, { useRef } from 'react';
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
  const focusInput = useFormInputFocus(),
    inputRef = useRef<TextInputInstance>(null);
  const theme = useTheme();
  return (
    <View className="mb-4">
      {Boolean(label) && (
        <Text className="mb-2 ml-1 text-sm font-medium text-app-textMuted">
          {label}
        </Text>
      )}
      <TextInput
        ref={inputRef}
        className={`rounded-lg border bg-app-surface px-4 py-4 text-base text-app-text ${
          error ? 'border-app-danger' : 'border-app-border'
        } ${multiline ? 'min-h-[120px] text-top' : ''}`}
        accessibilityLabel={label || placeholder}
        accessibilityHint={error}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        onFocus={() => {
          focusInput(inputRef.current);
          onFocus?.();
        }}
        onBlur={onBlur}
        maxLength={maxLength}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {error && (
        <Text className="mt-2 ml-1 text-xs text-app-danger">{error}</Text>
      )}
    </View>
  );
}
