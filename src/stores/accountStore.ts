import { errorMessage } from '../utils/errorMessage';
import { notify } from './feedbackStore';
import { create } from 'zustand';
import { accountService } from '../services/accountService';
import { Account, CreateAccountPayload } from '../types';

interface AccountState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  create: (payload: CreateAccountPayload) => Promise<Account>;
  remove: (id: string) => Promise<void>;
  reset: () => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const accounts = await accountService.getAll();
      set({ accounts, isLoading: false });
    } catch (err: any) {
      set({
        error: errorMessage(err, 'Não foi possível carregar suas contas'),
        isLoading: false,
      });
    }
  },

  create: async (payload) => {
    try {
      const account = await accountService.create(payload);
      set((state) => ({
        accounts: [
          ...state.accounts.filter((item) => item.id !== account.id),
          account,
        ],
        error: null,
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
      set((state) => ({
        accounts: state.accounts.filter((account) => account.id !== id),
        error: null,
      }));
    } catch (err: any) {
      throw new Error(errorMessage(err, 'Não foi possível excluir a conta'));
    }
  },

  reset: () => set({ accounts: [], isLoading: false, error: null }),
}));
