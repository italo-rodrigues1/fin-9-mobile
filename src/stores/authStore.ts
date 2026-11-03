import { errorMessage } from '../utils/errorMessage';
import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services/authService';
import { googleAuth } from '../services/googleAuth';
import { AUTH_TOKEN_KEY, tokenStorage } from '../services/tokenStorage';
import { useCategoryStore } from './categoryStore';
import { useAccountStore } from './accountStore';
import { useTransactionStore } from './transactionStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken?: string) => Promise<void>;
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
  isHydrated: false,
  error: null,

  login: async (email, password) => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.login(email, password);
      await tokenStorage.setItem(AUTH_TOKEN_KEY, token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const message = errorMessage(err, 'Erro ao fazer login');
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  loginWithGoogle: async (credential) => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const idToken = credential ?? (await googleAuth.signIn());
      if (!idToken) return;
      const { user, token } = await authService.loginWithGoogle(idToken);
      await tokenStorage.setItem(AUTH_TOKEN_KEY, token);
      set({ user, token, isAuthenticated: true });
    } catch (err) {
      const message = errorMessage(err, 'Não foi possível entrar com Google');
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password) => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.register(name, email, password);
      await tokenStorage.setItem(AUTH_TOKEN_KEY, token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const message = errorMessage(err, 'Erro ao criar conta');
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    await tokenStorage.removeItem(AUTH_TOKEN_KEY);
    resetAppStores();
    set({ user: null, token: null, isAuthenticated: false, error: null });
    void googleAuth.signOut().catch(() => {});
  },

  deleteAccount: async () => {
    try {
      await authService.deleteAccount();
      await tokenStorage.removeItem(AUTH_TOKEN_KEY);
      resetAppStores();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
      void googleAuth.signOut().catch(() => {});
    } catch (err: any) {
      const message = errorMessage(err, 'Erro ao excluir conta');
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
    } finally {
      set({ isHydrated: true });
    }
  },

  updateProfile: async (name) => {
    try {
      const user = await authService.updateProfile(name);
      set({ user });
    } catch (err: any) {
      const message = errorMessage(err, 'Erro ao atualizar perfil');
      set({ error: message });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),
}));
