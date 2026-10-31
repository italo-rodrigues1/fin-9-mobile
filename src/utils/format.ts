export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export const MAX_MONEY_VALUE = 999_999_999.99;

export function sanitizeCurrencyInput(value: string): string {
  const sanitized = value.replace(/[^\d,.]/g, '');
  if (!sanitized) return '';

  const commaIndex = sanitized.indexOf(',');
  const dotIndexes = [...sanitized.matchAll(/\./g)].map(
    (match) => match.index ?? -1,
  );
  const lastDotIndex = dotIndexes.at(-1) ?? -1;
  const dotLooksDecimal =
    commaIndex === -1 &&
    dotIndexes.length === 1 &&
    sanitized.length - lastDotIndex - 1 <= 2;
  const separatorIndex =
    commaIndex >= 0 ? commaIndex : dotLooksDecimal ? lastDotIndex : -1;
  const integerDigits = (
    separatorIndex >= 0 ? sanitized.slice(0, separatorIndex) : sanitized
  ).replace(/\D/g, '');
  const normalizedInteger = (
    integerDigits.replace(/^0+(?=\d)/, '') || '0'
  ).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (separatorIndex === -1) return normalizedInteger;

  const decimalDigits = sanitized
    .slice(separatorIndex + 1)
    .replace(/\D/g, '')
    .slice(0, 2);
  return `${normalizedInteger},${decimalDigits}`;
}

export function parseCurrencyInput(value: string): number {
  return Number(value.replace(/\./g, '').replace(',', '.'));
}

export function formatCurrencyInput(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getMonthName(month: number): string {
  const date = new Date(2024, month - 1, 1);
  return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
}
