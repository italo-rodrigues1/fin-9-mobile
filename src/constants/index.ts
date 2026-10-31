export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333';

export const COLORS = {
  primary: '#047857',
  primaryDark: '#12785A',
  primaryLight: '#E7F8F1',
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceLight: '#EEF2F5',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#667085',
  success: '#6CCF7F',
  danger: '#B42318',
  warning: '#F5B546',
  border: '#D6DEE6',
  white: '#ffffff',
  avatar: '#E9FBF3',
};

export const CATEGORY_ICONS: Record<string, string> = {
  utensils: '🍽️',
  car: '🚗',
  home: '🏠',
  heart: '❤️',
  book: '📚',
  gamepad: '🎮',
  briefcase: '💼',
  'trending-up': '📈',
  tag: '🏷️',
  gift: '🎁',
  music: '🎵',
  shirt: '👕',
  plane: '✈️',
  phone: '📱',
  coffee: '☕',
};

export const ACCOUNT_COLORS = [
  '#7C3AED',
  '#169670',
  '#1D67C1',
  '#F97316',
  '#E11D48',
  '#0F766E',
];

export const ACCOUNT_ICON_OPTIONS = [
  'bank-outline',
  'credit-card-outline',
  'wallet-outline',
  'chart-line',
  'cash-multiple',
  'shield-lock-outline',
];

export const INPUT_LIMITS = {
  defaultText: 100,
  name: 100,
  categoryName: 50,
  email: 254,
  password: 128,
  transactionTitle: 100,
  transactionDescription: 500,
  institution: 100,
  money: 16,
} as const;
