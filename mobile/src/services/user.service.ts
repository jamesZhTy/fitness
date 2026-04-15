import api from './api';
import { User } from '../types/user';

export const userService = {
  getProfile: async (): Promise<User> => {
    const res = await api.get('/users/me');
    return res.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const res = await api.patch('/users/me', data);
    return res.data;
  },
};
