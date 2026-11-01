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
    background: '#0B1220',
    surface: '#152033',
    surfaceLight: '#202E43',
    text: '#F2F4F7',
    textSecondary: '#D0D5DD',
    textMuted: '#98A2B3',
    border: '#344054',
    primary: '#047857',
    primaryDark: '#064E3B',
    primaryLight: '#103C33',
    primaryText: '#6EE7B7',
    success: '#6EE7B7',
    dangerSolid: '#B42318',
    danger: '#FDA29B',
    dangerBackground: '#3B1E27',
    dangerBorder: '#80333B',
    warning: '#FEC84B',
    warningBackground: '#372C16',
    warningBorder: '#785C26',
    white: '#FFFFFF',
    onPrimary: '#FFFFFF',
    avatar: '#103C33',
    skeleton: '#344054',
    inverse: '#E4E7EC',
    onInverse: '#101828',
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
