import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { useTheme } from "../../theme/useTheme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  isLoading,
  disabled,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const baseClass =
    "min-h-[56px] flex-row items-center justify-center rounded-[16px] px-5 py-4";

  const variantClass = {
    primary: "",
    secondary: "",
    danger: "",
    outline: "",
  }[variant];

  const textClass = {
    primary: "text-white font-semibold text-lg",
    secondary: "font-semibold text-lg",
    danger: "text-white font-semibold text-lg",
    outline: "font-semibold text-lg",
  }[variant];

  const backgroundColor = {
    primary: colors.primary,
    secondary: colors.surface,
    danger: colors.danger,
    outline: "transparent",
  }[variant];

  const textColor = {
    primary: "#FFFFFF",
    secondary: colors.text,
    danger: "#FFFFFF",
    outline: colors.text,
  }[variant];

  const borderColor = {
    primary: "transparent",
    secondary: colors.border,
    danger: "transparent",
    outline: colors.border,
  }[variant];

  const spinnerColor =
    variant === "primary" || variant === "danger" ? "#FFFFFF" : colors.text;

  return (
    <TouchableOpacity
      className={`${baseClass} ${variantClass} ${
        disabled || isLoading ? "opacity-60" : ""
      }`}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[{ backgroundColor, borderWidth: 1, borderColor }, style]}
    >
      {isLoading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <Text className={textClass} style={{ color: textColor }}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
