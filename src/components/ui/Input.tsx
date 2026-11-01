import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import type { TextInputInstance, TextInputProps } from "react-native";
import { Pressable, Text, TextInput, View } from "react-native";
import { INPUT_LIMITS } from "../../constants";
import { useTheme } from "../../theme/ThemeProvider";
import { useFormInputFocus } from "../KeyboardForm";

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
  onFocus?: () => void;
  onBlur?: () => void;
  maxLength?: number;
  icon?: React.ComponentProps<typeof Feather>["name"];
  embeddedLabel?: boolean;
  autoComplete?: TextInputProps["autoComplete"];
  returnKeyType?: TextInputProps["returnKeyType"];
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  error,
  multiline,
  autoCapitalize = "sentences",
  onFocus,
  onBlur,
  maxLength = INPUT_LIMITS.defaultText,
  icon,
  embeddedLabel = false,
  autoComplete,
  returnKeyType,
  onSubmitEditing,
}: InputProps) {
  const focusInput = useFormInputFocus(),
    inputRef = useRef<TextInputInstance>(null);
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const showEmbeddedLabel = focused || value.length > 0;
  const fieldColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.primaryText
      : theme.colors.textMuted;

  const inputProps: TextInputProps = {
    accessibilityLabel: label || placeholder,
    accessibilityHint: error,
    value,
    onChangeText,
    placeholderTextColor: theme.colors.textMuted,
    secureTextEntry: secureTextEntry && !(embeddedLabel && passwordVisible),
    keyboardType,
    multiline,
    autoCapitalize: secureTextEntry ? "none" : autoCapitalize,
    autoCorrect: secureTextEntry ? false : undefined,
    onFocus: () => {
      setFocused(true);
      focusInput(inputRef.current);
      onFocus?.();
    },
    onBlur: () => {
      setFocused(false);
      onBlur?.();
    },
    maxLength,
    textAlignVertical: multiline ? "top" : "center",
    autoComplete,
    returnKeyType,
    onSubmitEditing,
  };

  if (embeddedLabel) {
    return (
      <View className="mb-4">
        <Pressable
          accessible={false}
          focusable={false}
          onPress={() => inputRef.current?.focus()}
          style={{
            minHeight: multiline ? 120 : 60,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            borderWidth: 1,
            borderRadius: 8,
            borderColor: error
              ? theme.colors.danger
              : focused
                ? theme.colors.primaryText
                : theme.colors.border,
            backgroundColor: theme.colors.surfaceLight,
            paddingLeft: 16,
            paddingRight: secureTextEntry ? 4 : 16,
            boxShadow: focused
              ? `0 0 0 3px ${theme.colors.primaryLight}`
              : undefined,
          }}
        >
          {icon ? <Feather name={icon} size={18} color={fieldColor} /> : null}
          <View style={{ flex: 1, paddingVertical: 8 }}>
            {showEmbeddedLabel ? (
              <Text
                accessible={false}
                style={{ fontSize: 11, lineHeight: 16, color: fieldColor }}
              >
                {label || placeholder}
              </Text>
            ) : null}
            <TextInput
              {...inputProps}
              ref={inputRef}
              className="p-0 text-base text-app-text"
              style={{ minHeight: 24, outlineWidth: 0 }}
              placeholder={showEmbeddedLabel ? undefined : placeholder || label}
            />
          </View>
          {secureTextEntry ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                passwordVisible
                  ? `Ocultar ${label || placeholder || "senha"}`
                  : `Mostrar ${label || placeholder || "senha"}`
              }
              onPress={(event) => {
                event.stopPropagation();
                setPasswordVisible((visible) => !visible);
              }}
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Feather
                name={passwordVisible ? "eye-off" : "eye"}
                size={18}
                color={theme.colors.textMuted}
                marginRight={8}
              />
            </Pressable>
          ) : null}
        </Pressable>
        {error ? (
          <Text
            accessibilityLiveRegion="polite"
            className="mt-2 ml-1 text-xs text-app-danger"
          >
            {error}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View className="mb-4">
      {Boolean(label) && (
        <Text className="mb-2 ml-1 text-sm font-medium text-app-textMuted">
          {label}
        </Text>
      )}
      <TextInput
        {...inputProps}
        ref={inputRef}
        className={`rounded-lg border bg-app-surface px-4 py-4 text-base text-app-text ${
          error ? "border-app-danger" : "border-app-border"
        } ${multiline ? "min-h-[120px] text-top" : ""}`}
        placeholder={placeholder}
      />
      {error && (
        <Text className="mt-2 ml-1 text-xs text-app-danger">{error}</Text>
      )}
    </View>
  );
}
