import { z } from 'zod';

export const amountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Valor inválido (máximo 2 casas decimais)')
  .refine((value) => Number(value) > 0, 'O valor deve ser maior que zero')
  .refine((value) => Number(value) <= 999_999_999.99, 'Valor máximo excedido');

export function normalizeAmountForValidation(value: string): string {
  return value.replace(/\./g, '').replace(',', '.');
}
