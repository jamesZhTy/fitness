import api from './api';
import { AuthTokens } from '../types/user';

export const authService = {
  register: async (email: string, password: string, username: string): Promise<AuthTokens> => {
    const res = await api.post('/auth/register', { email, password, username });
    return res.data;
  },

  login: async (email: string, password: string): Promise<AuthTokens> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
};
