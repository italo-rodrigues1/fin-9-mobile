import axios from 'axios';
import { API_URL } from '../constants';
import { AUTH_TOKEN_KEY, tokenStorage } from './tokenStorage';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await tokenStorage.removeItem(AUTH_TOKEN_KEY);
    }
    return Promise.reject(error);
  },
);

export default api;
