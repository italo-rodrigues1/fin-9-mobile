import api from './api';
import { Category } from '../types';

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

  create: async (payload: { name: string; color?: string; icon?: string }): Promise<Category> => {
    const { data } = await api.post<Category>('/categories', payload);
    return data;
  },

  update: async (id: string, payload: Partial<{ name: string; color: string; icon: string }>): Promise<Category> => {
    const { data } = await api.patch<Category>(`/categories/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
