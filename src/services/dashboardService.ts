import api from './api';
import { MonthlySummary } from '../types';

export const dashboardService = {
  getSummary: async (month: number, year: number, accountId?: string): Promise<MonthlySummary> => {
    const { data } = await api.get<MonthlySummary>('/dashboard/summary', {
      params: { month, year, ...(accountId && { accountId }) },
    });
    return data;
  },
};
