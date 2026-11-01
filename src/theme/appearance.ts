import { Appearance, Platform } from 'react-native';
import type { ThemePreference } from './palette';

export function syncColorScheme(
  preference: ThemePreference,
  resolvedScheme: 'light' | 'dark',
  setWebColorScheme: (scheme: 'light' | 'dark') => void,
) {
  if (Platform.OS === 'web') {
    setWebColorScheme(resolvedScheme);
    return;
  }

  // NativeWind 4 maps "system" to null, which RN 0.88 no longer accepts.
  // NativeWind observes Appearance changes, so native can use the RN API directly.
  Appearance.setColorScheme(preference === 'system' ? 'auto' : preference);
}
