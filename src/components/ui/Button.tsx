import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/useTheme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  iconSize?: number;
  iconColor?: string;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  isLoading,
  disabled,
  style,
  icon,
  iconPosition = "left",
  iconSize = 20,
  iconColor,
}: ButtonProps) {
  const { colors } = useTheme();
  const baseClass =
    "min-h-[56px] flex-row items-center justify-center rounded-[18px] px-6 py-4";

  const backgroundColor = {
    primary: colors.primary,
    secondary: colors.surfaceSecondary,
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

  const resolvedIconColor = iconColor || textColor;
  const spinnerColor =
    variant === "primary" || variant === "danger" ? "#FFFFFF" : colors.text;

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator color={spinnerColor} />;
    }

    return (
      <>
        {icon && iconPosition === "left" && (
          <Ionicons
            name={icon}
            size={iconSize}
            color={resolvedIconColor}
            style={{ marginRight: 8 }}
          />
        )}
        <Text
          className="text-lg font-semibold tracking-tight"
          style={{ color: textColor }}
        >
          {title}
        </Text>
        {icon && iconPosition === "right" && (
          <Ionicons
            name={icon}
            size={iconSize}
            color={resolvedIconColor}
            style={{ marginLeft: 8 }}
          />
        )}
      </>
    );
  };

  return (
    <TouchableOpacity
      className={`${baseClass} ${disabled || isLoading ? "opacity-60" : ""}`}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      style={[
        {
          backgroundColor,
          borderWidth: variant === "outline" || variant === "secondary" ? 1 : 0,
          borderColor,
        },
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}
