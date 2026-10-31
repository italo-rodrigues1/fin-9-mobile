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
  isArchived?: boolean;
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
  status?: 'CONFIRMED' | 'PLANNED';
  recurrenceId?: string | null;
  occurrenceDate?: string | null;
  id: string;
  title: string;
  description?: string;
  amount: number;
  type: TransactionType;
  date: string;
  categoryId: string;
  accountId: string;
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
  search?: string;
  accountId?: string;
  skip?: number;
  take?: number;
  status?: 'CONFIRMED' | 'PLANNED';
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
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

export interface FinancialReport extends MonthlySummary {
  currentBalance: number;
  plannedIncome: number;
  plannedExpense: number;
  projectedBalance: number;
  history: (MonthlySummary & { month: number; year: number })[];
  previous: {
    month: number;
    year: number;
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
}
export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  title: string;
  fromAccount?: Account;
  toAccount?: Account;
}
export interface Recurrence {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  accountId: string;
  categoryId: string;
  interval: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate?: string | null;
  active: boolean;
}
export interface Budget {
  id: string;
  categoryId: string;
  category: Category;
  month: number;
  year: number;
  amount: number;
  used: number;
  remaining: number;
  percentage: number;
  alert: 'OK' | 'WARNING' | 'EXCEEDED';
}
export interface Statement {
  account: Account;
  entries: (Transaction & { kind: 'TRANSACTION' | 'TRANSFER' })[];
  hasMore: boolean;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  deadline: string | null;
  allocatedAmount: number;
  currentAmount: number;
  shortfall: number;
  remainingAmount: number;
  percentage: number;
  status: 'COMPLETED' | 'REVIEW' | 'OVERDUE' | 'IN_PROGRESS';
}
export interface GoalFundingAccount {
  id: string;
  name: string;
  institution: string;
  isArchived: boolean;
  balance: number;
  allocatedAmount: number;
  availableAmount: number;
}
export interface GoalContribution {
  id: string;
  goalId: string;
  accountId: string;
  amount: number;
  date: string;
  note: string | null;
  account?: Pick<
    GoalFundingAccount,
    'id' | 'name' | 'institution' | 'isArchived'
  >;
}
export interface GoalOverview {
  goals: Goal[];
  accounts: GoalFundingAccount[];
}
export interface GoalDetail {
  goal: Goal;
  accounts: GoalFundingAccount[];
  contributions: GoalContribution[];
  hasMore: boolean;
}
export interface SaveGoal {
  name: string;
  targetAmount: number;
  deadline: string | null;
}
export interface SaveGoalContribution {
  accountId: string;
  amount: number;
  date: string;
  note?: string;
  requestId?: string;
}
