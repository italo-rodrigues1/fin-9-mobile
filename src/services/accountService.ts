import api from './api';
import { Account, CreateAccountPayload } from '../types';

export const accountService = {
  getAll: async (): Promise<Account[]> => {
    const { data } = await api.get<Account[]>('/accounts');
    return data;
  },

  create: async (payload: CreateAccountPayload): Promise<Account> => {
    const { data } = await api.post<Account>('/accounts', payload);
    return data;
  },
};
