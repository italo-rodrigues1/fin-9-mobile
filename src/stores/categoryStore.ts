import { readCaches } from '../services/readCaches';
import { errorMessage } from '../utils/errorMessage';
import { create } from 'zustand';
import { Category } from '../types';
import { categoryService } from '../services/categoryService';

let requestVersion = 0;

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetch: (force?: boolean) => Promise<void>;
  create: (payload: {
    name: string;
    color?: string;
    icon?: string;
  }) => Promise<void>;
  update: (
    id: string,
    payload: Partial<{ name: string; color: string; icon: string }>,
  ) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reset: () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetch: async (force = false) => {
    const version = ++requestVersion;
    set({ isLoading: true, error: null });
    try {
      const categories = await categoryService.getAll(force);
      if (version !== requestVersion) return;
      set({ categories, isLoading: false });
    } catch (err: any) {
      if (version !== requestVersion) return;
      set({
        error: errorMessage(err, 'Erro ao carregar categorias'),
        isLoading: false,
      });
    }
  },

  create: async (payload) => {
    try {
      await categoryService.create(payload);
      await get().fetch();
    } catch (err: any) {
      throw new Error(errorMessage(err, 'Erro ao criar categoria'));
    }
  },

  update: async (id, payload) => {
    try {
      await categoryService.update(id, payload);
      await get().fetch();
    } catch (err: any) {
      throw new Error(errorMessage(err, 'Erro ao atualizar categoria'));
    }
  },

  remove: async (id) => {
    try {
      await categoryService.delete(id);
      await get().fetch();
    } catch (err: any) {
      throw new Error(errorMessage(err, 'Erro ao excluir categoria'));
    }
  },

  reset: () => {
    requestVersion++;
    readCaches.categories.clear();
    set({ categories: [], isLoading: false, error: null });
  },
}));
