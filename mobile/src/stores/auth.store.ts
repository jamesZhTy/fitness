import { create } from 'zustand';
import { getItem, setItem, deleteItem } from '../services/storage';
import { User } from '../types/user';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const tokens = await authService.login(email, password);
    await setItem('accessToken', tokens.accessToken);
    await setItem('refreshToken', tokens.refreshToken);
    const user = await userService.getProfile();
    set({ user, isAuthenticated: true });
  },

  register: async (email, password, username) => {
    const tokens = await authService.register(email, password, username);
    await setItem('accessToken', tokens.accessToken);
    await setItem('refreshToken', tokens.refreshToken);
    const user = await userService.getProfile();
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await deleteItem('accessToken');
    await deleteItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = await getItem('accessToken');
      if (token) {
        const user = await userService.getProfile();
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
