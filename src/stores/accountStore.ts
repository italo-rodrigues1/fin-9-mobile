import { create } from 'zustand';

import { Account, UpdateAccountPayload } from '../types';
import { accountService } from '../services/accountService';

interface AccountState {
    accounts: Account[];
    isLoading: boolean;
    error: string | null;
    fetch: () => Promise<void>;
    update: (id: string, payload: Partial<UpdateAccountPayload>) => Promise<void>;
    reset: () => void;
}

export const useAccountStore = create<AccountState>((set, get) => ({
    accounts: [],
    isLoading: false,
    error: null,

    fetch: async () => {
        set({ isLoading: true, error: null });
        try {
            const accounts = await accountService.getAll();
            set({ accounts, isLoading: false });
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Erro ao carregar contas', isLoading: false });
        }
    },

    update: async (id, payload) => {
        set({ error: null });
        try {
            const updated = await accountService.update(id, payload);
            set((state) => ({
                accounts: state.accounts.map((a) => (a.id === id ? updated : a)),
            }));
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Erro ao atualizar conta' });
            throw err;
        }
    },

    reset: () => set({ accounts: [], isLoading: false, error: null }),
}));
