import api from './api';
import { Account, CreateAccountPayload, UpdateAccountPayload } from '../types';

export const accountService = {
  getAll: async (): Promise<Account[]> => {
    const { data } = await api.get<Account[]>('/accounts');
    return data;
  },

  create: async (payload: CreateAccountPayload): Promise<Account> => {
    const { data } = await api.post<Account>('/accounts', payload);
    return data;
  },

  update: async (id: string, payload: Partial<UpdateAccountPayload>): Promise<Account> => {
    const { data } = await api.patch<Account>('/accounts/' + id, payload);
    return data;
  },
};
