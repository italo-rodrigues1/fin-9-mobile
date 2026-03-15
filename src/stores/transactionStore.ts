import { create } from 'zustand';
import { Transaction, TransactionFilters } from '../types';
import { transactionService } from '../services/transactionService';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  filters: TransactionFilters;
  fetch: (filters?: TransactionFilters) => Promise<void>;
  create: (payload: Parameters<typeof transactionService.create>[0]) => Promise<void>;
  update: (id: string, payload: Parameters<typeof transactionService.update>[1]) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setFilters: (filters: TransactionFilters) => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,
  filters: {},

  fetch: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const appliedFilters = filters || get().filters;
      const transactions = await transactionService.getAll(appliedFilters);
      set({ transactions, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Erro ao carregar transações', isLoading: false });
    }
  },

  create: async (payload) => {
    try {
      await transactionService.create(payload);
      await get().fetch();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao criar transação');
    }
  },

  update: async (id, payload) => {
    try {
      await transactionService.update(id, payload);
      await get().fetch();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao atualizar transação');
    }
  },

  remove: async (id) => {
    try {
      await transactionService.delete(id);
      await get().fetch();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao excluir transação');
    }
  },

  setFilters: (filters) => set({ filters }),
}));
