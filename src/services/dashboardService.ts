import api from './api';
import { MonthlySummary } from '../types';

export const dashboardService = {
  getSummary: async (month: number, year: number): Promise<MonthlySummary> => {
    const { data } = await api.get<MonthlySummary>(`/dashboard/summary?month=${month}&year=${year}`);
    return data;
  },
};
