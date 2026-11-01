import { createContext, useContext, useEffect } from 'react';
import { View, useColorScheme } from 'react-native';
import { vars, useColorScheme as useNativeWindScheme } from 'nativewind';
import {
  ThemeProvider as NavigationThemeProvider,
  DefaultTheme,
  DarkTheme,
} from 'expo-router';
import { palettes, resolveTheme, ThemeColors, themeVariables } from './palette';
import { useThemeStore } from '../stores/themeStore';
import { syncColorScheme } from './appearance';
const ThemeContext = createContext<{ isDark: boolean; colors: ThemeColors }>({
  isDark: false,
  colors: palettes.light,
});
export const useTheme = () => useContext(ThemeContext);
export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = useThemeStore((s) => s.preference),
    hydrate = useThemeStore((s) => s.hydrate),
    system = useColorScheme(),
    { setColorScheme } = useNativeWindScheme(),
    scheme = resolveTheme(preference, system),
    colors = palettes[scheme];
  useEffect(() => {
    void hydrate().catch(() => {});
  }, [hydrate]);
  useEffect(() => {
    syncColorScheme(preference, scheme, setColorScheme);
  }, [preference, scheme, setColorScheme]);
  return (
    <ThemeContext.Provider value={{ isDark: scheme === 'dark', colors }}>
      <NavigationThemeProvider
        value={{
          ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
          colors: {
            ...(scheme === 'dark' ? DarkTheme : DefaultTheme).colors,
            primary: colors.primaryText,
            background: colors.background,
            card: colors.surface,
            text: colors.text,
            border: colors.border,
            notification: colors.danger,
          },
        }}
      >
        <View
          className="flex-1"
          style={[
            vars(themeVariables(colors)),
            { backgroundColor: colors.background },
          ]}
        >
          {children}
        </View>
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}
