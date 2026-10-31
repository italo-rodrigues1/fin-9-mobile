import { readCaches } from '../services/readCaches';
import { errorMessage } from '../utils/errorMessage';
import { notify } from './feedbackStore';
import { create } from 'zustand';
import { Transaction, TransactionFilters } from '../types';
import { transactionService } from '../services/transactionService';
import { useAccountStore } from './accountStore';

let requestVersion = 0;

interface TransactionState {
  transactions: Transaction[];
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  filters: TransactionFilters;
  fetch: (filters?: TransactionFilters, force?: boolean) => Promise<void>;
  create: (
    payload: Parameters<typeof transactionService.create>[0],
  ) => Promise<void>;
  update: (
    id: string,
    payload: Parameters<typeof transactionService.update>[1],
  ) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setFilters: (filters: TransactionFilters) => void;
  reset: () => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  hasMore: false,
  isLoadingMore: false,
  isLoading: false,
  error: null,
  filters: {},

  fetch: async (filters, force = false) => {
    const version = ++requestVersion;
    set({ isLoading: true, isLoadingMore: false, error: null });
    try {
      const appliedFilters = filters || get().filters;
      const transactions = await transactionService.getAll(
        { ...appliedFilters, skip: 0, take: 30 },
        force,
      );
      if (version !== requestVersion) return;
      set({
        transactions,
        isLoading: false,
        hasMore: transactions.length === 30,
      });
    } catch (err: any) {
      if (version !== requestVersion) return;
      set({
        error: errorMessage(err, 'Erro ao carregar transações'),
        isLoading: false,
      });
    }
  },

  loadMore: async () => {
    if (get().isLoading || get().isLoadingMore || !get().hasMore) return;
    const version = ++requestVersion;
    set({ isLoadingMore: true });
    try {
      const next = await transactionService.getAll({
        ...get().filters,
        skip: get().transactions.length,
        take: 30,
      });
      if (version !== requestVersion) return;
      set((state) => ({
        transactions: [
          ...state.transactions,
          ...next.filter(
            (item) => !state.transactions.some((old) => old.id === item.id),
          ),
        ],
        hasMore: next.length === 30,
        isLoadingMore: false,
      }));
    } catch (err) {
      if (version === requestVersion) {
        set({ isLoadingMore: false });
        notify(errorMessage(err, 'Não foi possível carregar mais transações.'));
      }
    }
  },
  create: async (payload) => {
    try {
      await transactionService.create(payload);
      notify('Transação cadastrada com sucesso.');
      await Promise.all([get().fetch(), useAccountStore.getState().fetch()]);
    } catch (err: any) {
      throw new Error(errorMessage(err, 'Erro ao criar transação'));
    }
  },

  update: async (id, payload) => {
    try {
      await transactionService.update(id, payload);
      notify('Transação atualizada com sucesso.');
      await Promise.all([get().fetch(), useAccountStore.getState().fetch()]);
    } catch (err: any) {
      throw new Error(errorMessage(err, 'Erro ao atualizar transação'));
    }
  },

  remove: async (id) => {
    try {
      await transactionService.delete(id);
      notify('Transação excluída com sucesso.');
      await Promise.all([get().fetch(), useAccountStore.getState().fetch()]);
    } catch (err: any) {
      throw new Error(errorMessage(err, 'Erro ao excluir transação'));
    }
  },

  setFilters: (filters) => set({ filters }),

  reset: () => {
    requestVersion++;
    readCaches.transactions.clear();
    set({
      transactions: [],
      isLoading: false,
      error: null,
      filters: {},
      hasMore: false,
      isLoadingMore: false,
    });
  },
}));
