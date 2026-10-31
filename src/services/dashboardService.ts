import api from './api';
import { FinancialReport } from '../types';

export const dashboardService = {
  getSummary: async (month: number, year: number): Promise<FinancialReport> => {
    const { data } = await api.get<FinancialReport>(
      `/dashboard/summary?month=${month}&year=${year}`,
    );
    return data;
  },
};
