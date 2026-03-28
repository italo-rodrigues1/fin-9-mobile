import React from "react";
import { View, TextInput, Text } from "react-native";
import { useTheme } from "../../theme/useTheme";

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "decimal-pad";
  error?: string;
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
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
  autoCapitalize = "sentences",
}: InputProps) {
  const { colors } = useTheme();

  return (
    <View className="mb-4">
      {Boolean(label) ? (
        <Text
          className="mb-2 ml-1 text-sm font-medium"
          style={{ color: colors.textSecondary }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        className={`rounded-[14px] border px-4 py-4 text-base ${
          multiline ? "min-h-[120px] text-top" : ""
        }`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        textAlignVertical={multiline ? "top" : "center"}
        style={{
          backgroundColor: colors.surface,
          color: colors.text,
          borderColor: error ? colors.danger : colors.border,
        }}
      />
      {error ? (
        <Text className="mt-2 ml-1 text-xs" style={{ color: colors.danger }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
