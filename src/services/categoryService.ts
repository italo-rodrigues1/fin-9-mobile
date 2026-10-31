import { readCaches } from './readCaches';
import api from './api';
import { Category } from '../types';

export const categoryService = {
  getAll: async (force = false): Promise<Category[]> => {
    return readCaches.categories.load(
      'all',
      async () => {
        const { data } = await api.get<Category[]>('/categories');
        return data;
      },
      force,
    );
  },

  create: async (payload: {
    name: string;
    color?: string;
    icon?: string;
  }): Promise<Category> => {
    const { data } = await api.post<Category>('/categories', payload);
    readCaches.categories.clear();
    readCaches.transactions.clear();
    return data;
  },

  update: async (
    id: string,
    payload: Partial<{ name: string; color: string; icon: string }>,
  ): Promise<Category> => {
    const { data } = await api.patch<Category>(`/categories/${id}`, payload);
    readCaches.categories.clear();
    readCaches.transactions.clear();
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
    readCaches.categories.clear();
    readCaches.transactions.clear();
  },
};
