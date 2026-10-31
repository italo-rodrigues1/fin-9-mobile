import { readCaches } from './readCaches';
import api from './api';
import { Account, CreateAccountPayload } from '../types';

export const accountService = {
  getAll: async (force = false): Promise<Account[]> => {
    return readCaches.accounts.load(
      'all',
      async () => {
        const { data } = await api.get<Account[]>('/accounts');
        return data;
      },
      force,
    );
  },

  create: async (payload: CreateAccountPayload): Promise<Account> => {
    const { data } = await api.post<Account>('/accounts', payload);
    readCaches.accounts.clear();
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/accounts/${id}`);
    readCaches.accounts.clear();
  },
};
