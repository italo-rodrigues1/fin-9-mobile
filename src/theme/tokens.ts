export type AppTheme = "light" | "dark";

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  background: string;
  backgroundMuted: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  success: string;
  danger: string;
  warning: string;
  white: string;
  avatar: string;
  avatarText: string;
  overlay: string;
  shadow: string;
  chipActive: string;
  chipActiveText: string;
  chipInactive: string;
  chipInactiveText: string;
  cardStripe: string;
}

export const themeTokens: Record<AppTheme, ThemeColors> = {
  light: {
    primary: "#169670",
    primaryDark: "#12785A",
    primaryLight: "#E7F8F1",
    background: "#F7F8FA",
    backgroundMuted: "#EEF2F5",
    surface: "#FFFFFF",
    surfaceSecondary: "#F9FAFB",
    surfaceElevated: "#FFFFFF",
    text: "#344054",
    textSecondary: "#667085",
    textMuted: "#98A2B3",
    border: "#D6DEE6",
    borderStrong: "#C5D0DB",
    success: "#6CCF7F",
    danger: "#FF6B6B",
    warning: "#F5B546",
    white: "#FFFFFF",
    avatar: "#E9FBF3",
    avatarText: "#169670",
    overlay: "rgba(15, 23, 42, 0.18)",
    shadow: "#0F172A",
    chipActive: "#169670",
    chipActiveText: "#FFFFFF",
    chipInactive: "#FFFFFF",
    chipInactiveText: "#667085",
    cardStripe: "#EEF2F5",
  },
  dark: {
    primary: "#34D399",
    primaryDark: "#10B981",
    primaryLight: "#0F2D27",
    background: "#071510",
    backgroundMuted: "#0F1E19",
    surface: "#10221C",
    surfaceSecondary: "#163029",
    surfaceElevated: "#18342C",
    text: "#F5F7FA",
    textSecondary: "#C8D1DA",
    textMuted: "#8FA1B3",
    border: "#28453D",
    borderStrong: "#355950",
    success: "#6EE7B7",
    danger: "#FB7185",
    warning: "#FBBF24",
    white: "#FFFFFF",
    avatar: "#0F2D27",
    avatarText: "#6EE7B7",
    overlay: "rgba(0, 0, 0, 0.28)",
    shadow: "#000000",
    chipActive: "#34D399",
    chipActiveText: "#052E25",
    chipInactive: "#163029",
    chipInactiveText: "#C8D1DA",
    cardStripe: "#1E3A32",
  },
};
