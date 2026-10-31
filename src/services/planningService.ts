import api from './api';
import { readCaches } from './readCaches';
import { Budget, Recurrence, Statement, Transaction, Transfer } from '../types';
export function invalidateFinance() {
  readCaches.accounts.clear();
  readCaches.transactions.clear();
}
export const planningService = {
  statement: async (id: string, skip = 0): Promise<Statement> =>
    (
      await api.get('/accounts/' + id + '/statement', {
        params: { skip, take: 30 },
      })
    ).data,
  getTransfer: async (id: string): Promise<Transfer> =>
    (await api.get('/transfers/' + id)).data,
  transfers: async (): Promise<Transfer[]> =>
    (await api.get('/transfers')).data,
  saveTransfer: async (
    payload: Omit<Transfer, 'id' | 'fromAccount' | 'toAccount'>,
    id?: string,
  ) => {
    const result = id
      ? await api.patch('/transfers/' + id, payload)
      : await api.post('/transfers', payload);
    invalidateFinance();
    return result.data;
  },
  deleteTransfer: async (id: string) => {
    await api.delete('/transfers/' + id);
    invalidateFinance();
  },
  upcoming: async (): Promise<Transaction[]> =>
    (await api.get('/planning/upcoming')).data,
  recurrences: async (): Promise<Recurrence[]> =>
    (await api.get('/recurrences')).data,
  saveRecurrence: async (
    payload: Partial<Recurrence> & { effectiveDate?: string },
    id?: string,
  ) => {
    const result = id
      ? await api.patch('/recurrences/' + id, payload)
      : await api.post('/recurrences', payload);
    invalidateFinance();
    return result.data;
  },
  budgets: async (month: number, year: number): Promise<Budget[]> =>
    (await api.get('/budgets', { params: { month, year } })).data,
  saveBudget: async (payload: {
    categoryId: string;
    month: number;
    year: number;
    amount: number;
  }) => {
    await api.post('/budgets', payload);
  },
  deleteBudget: async (id: string) => {
    await api.delete('/budgets/' + id);
  },
};
