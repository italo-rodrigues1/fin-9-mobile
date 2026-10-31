import { readCaches } from '../services/readCaches';
import { errorMessage } from '../utils/errorMessage';
import { notify } from './feedbackStore';
import { create } from 'zustand';
import { accountService } from '../services/accountService';
import { Account, CreateAccountPayload } from '../types';

let requestVersion = 0;

interface AccountState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  fetch: (force?: boolean) => Promise<void>;
  create: (payload: CreateAccountPayload) => Promise<Account>;
  remove: (id: string) => Promise<void>;
  reset: () => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  isLoading: false,
  error: null,

  fetch: async (force = false) => {
    const version = ++requestVersion;
    set({ isLoading: true, error: null });
    try {
      const accounts = await accountService.getAll(force);
      if (version !== requestVersion) return;
      set({ accounts, isLoading: false });
    } catch (err: any) {
      if (version !== requestVersion) return;
      set({
        error: errorMessage(err, 'Não foi possível carregar suas contas'),
        isLoading: false,
      });
    }
  },

  create: async (payload) => {
    try {
      const account = await accountService.create(payload);
      requestVersion++;
      set((state) => ({
        accounts: [
          ...state.accounts.filter((item) => item.id !== account.id),
          account,
        ],
        error: null,
        isLoading: false,
      }));
      return account;
    } catch (err: any) {
      throw new Error(errorMessage(err, 'Não foi possível cadastrar a conta'));
    }
  },

  remove: async (id) => {
    try {
      await accountService.delete(id);
      notify('Conta excluída com sucesso.');
      requestVersion++;
      set((state) => ({
        accounts: state.accounts.filter((account) => account.id !== id),
        error: null,
        isLoading: false,
      }));
    } catch (err: any) {
      throw new Error(errorMessage(err, 'Não foi possível excluir a conta'));
    }
  },

  reset: () => {
    requestVersion++;
    readCaches.accounts.clear();
    set({ accounts: [], isLoading: false, error: null });
  },
}));
