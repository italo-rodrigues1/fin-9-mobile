import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTheme } from "../../theme/useTheme";

interface FormScreenProps extends ScrollViewProps {
  children: React.ReactNode;
  padded?: boolean;
  includeTopInset?: boolean;
}

export function FormScreen({
  children,
  padded = true,
  includeTopInset = false,
  contentContainerStyle,
  ...props
}: FormScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <SafeAreaView
      edges={includeTopInset ? ["top", "bottom"] : ["bottom"]}
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 18 : 0}
      >
        <ScrollView
          className={padded ? "flex-1 px-4" : "flex-1"}
          contentContainerStyle={[
            {
              paddingTop: 20,
              paddingBottom: Math.max(insets.bottom + 32, 48),
            },
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          showsVerticalScrollIndicator={false}
          {...props}
        >
          <View>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
