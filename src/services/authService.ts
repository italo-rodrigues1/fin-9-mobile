import api from './api';
import { AuthResponse } from '../types';

export const authService = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  updateProfile: async (name: string) => {
    const { data } = await api.patch('/auth/profile', { name });
    return data;
  },
};
