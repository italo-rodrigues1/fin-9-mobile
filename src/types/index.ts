export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
  userId: string;
}

export interface Account {
  id: string;
  name: string;
  institution: string;
  balance: number;
  color: string;
  icon: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  title: string;
  description?: string;
  amount: number;
  type: TransactionType;
  date: string;
  categoryId: string;
  userId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  accounts: Account[];
  byCategory: CategorySummary[];
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  total: number;
  type: TransactionType;
}

export interface TransactionFilters {
  month?: number;
  year?: number;
  type?: TransactionType;
  categoryId?: string;
  orderBy?: 'date' | 'amount';
  orderDir?: 'asc' | 'desc';
}

export interface CreateAccountPayload {
  name: string;
  institution: string;
  balance: number;
  color?: string;
  icon?: string;
}
