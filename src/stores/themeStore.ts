import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AppTheme } from "../theme/tokens";

interface ThemeState {
  theme: AppTheme;
  resolvedTheme: AppTheme;
  hasHydrated: boolean;
  hasUserPreference: boolean;
  initialize: (systemTheme: AppTheme) => void;
  toggleTheme: () => Promise<void>;
  setHydrated: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      resolvedTheme: "light",
      hasHydrated: false,
      hasUserPreference: false,
      initialize: (systemTheme) => {
        const { hasUserPreference, theme } = get();
        const resolvedTheme = hasUserPreference ? theme : systemTheme;

        set({
          theme: resolvedTheme,
          resolvedTheme,
        });
      },
      toggleTheme: async () => {
        const nextTheme: AppTheme =
          get().resolvedTheme === "dark" ? "light" : "dark";

        set({
          theme: nextTheme,
          resolvedTheme: nextTheme,
          hasUserPreference: true,
        });
      },
      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "fin9-theme",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        hasUserPreference: state.hasUserPreference,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
