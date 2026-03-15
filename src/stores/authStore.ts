import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import { authService } from '../services/authService';
import { useCategoryStore } from './categoryStore';
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
      await SecureStore.setItemAsync('auth_token', token);
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
      await SecureStore.setItemAsync('auth_token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar conta';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    resetAppStores();
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  deleteAccount: async () => {
    try {
      await authService.deleteAccount();
      await SecureStore.deleteItemAsync('auth_token');
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
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        const user = await authService.getProfile();
        set({ token, user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      await SecureStore.deleteItemAsync('auth_token');
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
