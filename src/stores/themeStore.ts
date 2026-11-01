import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemePreference } from '../theme/palette';
const KEY = 'fin9-appearance';
let writes: Promise<unknown> = Promise.resolve();
export const useThemeStore = create<{
  preference: ThemePreference;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setPreference: (value: ThemePreference) => Promise<void>;
}>((set, get) => ({
  preference: 'system',
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return;
    const initial = get().preference;
    try {
      const saved = await AsyncStorage.getItem(KEY);
      if (
        get().preference === initial &&
        (saved === 'light' || saved === 'dark' || saved === 'system')
      )
        set({ preference: saved });
    } finally {
      set({ hydrated: true });
    }
  },
  setPreference: async (value) => {
    set({ preference: value });
    writes = writes
      .catch(() => {})
      .then(() => AsyncStorage.setItem(KEY, value));
    await writes;
  },
}));
