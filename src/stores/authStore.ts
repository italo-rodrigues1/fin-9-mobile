import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services/authService';
import { AUTH_TOKEN_KEY, tokenStorage } from '../services/tokenStorage';
import { useCategoryStore } from './categoryStore';
import { useAccountStore } from './accountStore';
import { useTransactionStore } from './transactionStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  loadToken: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  clearError: () => void;
}

const resetAppStores = () => {
  useAccountStore.getState().reset();
  useCategoryStore.getState().reset();
  useTransactionStore.getState().reset();
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.login(email, password);
      await tokenStorage.setItem(AUTH_TOKEN_KEY, token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao fazer login';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.register(name, email, password);
      await tokenStorage.setItem(AUTH_TOKEN_KEY, token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar conta';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    await tokenStorage.removeItem(AUTH_TOKEN_KEY);
    resetAppStores();
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  deleteAccount: async () => {
    try {
      await authService.deleteAccount();
      await tokenStorage.removeItem(AUTH_TOKEN_KEY);
      resetAppStores();
      set({ user: null, token: null, isAuthenticated: false, error: null, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao excluir conta';
      set({ error: message });
      throw new Error(message);
    }
  },

  loadToken: async () => {
    try {
      const token = await tokenStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        const user = await authService.getProfile();
        set({ token, user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      await tokenStorage.removeItem(AUTH_TOKEN_KEY);
      resetAppStores();
      set({ isLoading: false });
    }
  },

  updateProfile: async (name) => {
    try {
      const user = await authService.updateProfile(name);
      set({ user });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao atualizar perfil';
      set({ error: message });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),
}));
