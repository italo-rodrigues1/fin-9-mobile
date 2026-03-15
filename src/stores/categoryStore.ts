import { create } from 'zustand';
import { Category } from '../types';
import { categoryService } from '../services/categoryService';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  create: (payload: { name: string; color?: string; icon?: string }) => Promise<void>;
  update: (id: string, payload: Partial<{ name: string; color: string; icon: string }>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoryService.getAll();
      set({ categories, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Erro ao carregar categorias', isLoading: false });
    }
  },

  create: async (payload) => {
    try {
      await categoryService.create(payload);
      await get().fetch();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao criar categoria');
    }
  },

  update: async (id, payload) => {
    try {
      await categoryService.update(id, payload);
      await get().fetch();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao atualizar categoria');
    }
  },

  remove: async (id) => {
    try {
      await categoryService.delete(id);
      await get().fetch();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao excluir categoria');
    }
  },
}));
