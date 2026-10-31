import { readCaches } from './readCaches';
import api from './api';
import { Transaction, TransactionFilters } from '../types';

export const transactionService = {
  getAll: async (
    filters?: TransactionFilters,
    force = false,
  ): Promise<Transaction[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.accountId) params.set('accountId', filters.accountId);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.skip !== undefined) params.set('skip', String(filters.skip));
    if (filters?.take !== undefined) params.set('take', String(filters.take));
    if (filters?.month) params.set('month', String(filters.month));
    if (filters?.year) params.set('year', String(filters.year));
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    if (filters?.type) params.set('type', filters.type);
    if (filters?.categoryId) params.set('categoryId', filters.categoryId);
    if (filters?.orderBy) params.set('orderBy', filters.orderBy);
    if (filters?.orderDir) params.set('orderDir', filters.orderDir);

    const key = params.toString();
    return readCaches.transactions.load(
      key,
      async () => {
        const { data } = await api.get<Transaction[]>(`/transactions?${key}`);
        return data;
      },
      force,
    );
  },

  getById: async (id: string): Promise<Transaction> => {
    const { data } = await api.get<Transaction>(`/transactions/${id}`);
    return data;
  },

  create: async (payload: {
    status?: 'CONFIRMED' | 'PLANNED';
    title: string;
    description?: string;
    amount: number;
    type: string;
    date: string;
    categoryId: string;
    accountId: string;
  }): Promise<Transaction> => {
    const { data } = await api.post<Transaction>('/transactions', payload);
    readCaches.transactions.clear();
    readCaches.accounts.clear();
    return data;
  },

  update: async (
    id: string,
    payload: Partial<{
      status?: 'CONFIRMED' | 'PLANNED';
      title: string;
      description: string;
      amount: number;
      type: string;
      date: string;
      categoryId: string;
      accountId: string;
    }>,
  ): Promise<Transaction> => {
    const { data } = await api.patch<Transaction>(
      `/transactions/${id}`,
      payload,
    );
    readCaches.transactions.clear();
    readCaches.accounts.clear();
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/transactions/${id}`);
    readCaches.transactions.clear();
    readCaches.accounts.clear();
  },
};
