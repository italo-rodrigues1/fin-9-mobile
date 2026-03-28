import { useThemeStore } from "../stores/themeStore";
import { themeTokens } from "./tokens";

export function useTheme() {
  const theme = useThemeStore((state) => state.theme);
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const colors = themeTokens[resolvedTheme];

  return {
    theme,
    resolvedTheme,
    colors,
    toggleTheme,
    isDark: resolvedTheme === "dark",
  };
}
