export const palettes = {
  light: {
    background: '#F7F8FA',
    surface: '#FFFFFF',
    surfaceLight: '#F2F4F7',
    text: '#101828',
    textSecondary: '#475467',
    textMuted: '#667085',
    border: '#D0D5DD',
    primary: '#047857',
    primaryDark: '#064E3B',
    primaryLight: '#E7F8F1',
    primaryText: '#047857',
    success: '#047857',
    dangerSolid: '#B42318',
    danger: '#B42318',
    dangerBackground: '#FEF3F2',
    dangerBorder: '#FECDCA',
    warning: '#B54708',
    warningBackground: '#FFFAEB',
    warningBorder: '#FEDF89',
    white: '#FFFFFF',
    onPrimary: '#FFFFFF',
    avatar: '#E7F8F1',
    skeleton: '#E4E7EC',
    inverse: '#101828',
    onInverse: '#FFFFFF',
  },
  dark: {
    background: '#0A0A0A',
    surface: '#171717',
    surfaceLight: '#242424',
    text: '#F5F5F5',
    textSecondary: '#D4D4D4',
    textMuted: '#A3A3A3',
    border: '#3A3A3A',
    primary: '#15803D',
    primaryDark: '#1C1C1C',
    primaryLight: '#262626',
    primaryText: '#4ADE80',
    success: '#4ADE80',
    dangerSolid: '#B42318',
    danger: '#FDA29B',
    dangerBackground: '#3B1E27',
    dangerBorder: '#80333B',
    warning: '#FEC84B',
    warningBackground: '#372C16',
    warningBorder: '#785C26',
    white: '#FFFFFF',
    onPrimary: '#FFFFFF',
    avatar: '#262626',
    skeleton: '#333333',
    inverse: '#E5E5E5',
    onInverse: '#171717',
  },
} as const;
export type ThemePreference = 'system' | 'light' | 'dark';
export type ThemeColors = { [K in keyof typeof palettes.light]: string };
export function resolveTheme(
  preference: ThemePreference,
  system: string | null | undefined,
): 'light' | 'dark' {
  return preference === 'system'
    ? system === 'dark'
      ? 'dark'
      : 'light'
    : preference;
}
export function themeVariables(colors: ThemeColors) {
  return Object.fromEntries(
    Object.entries(colors).map(([key, value]) => [
      '--app-' + key,
      value
        .slice(1)
        .match(/.{2}/g)!
        .map((v) => parseInt(v, 16))
        .join(' '),
    ]),
  );
}
