// context/store.tsx
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  username: string;
  password: string;
  setToken: (token: string) => void;
  clearToken: () => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  username: '',
  password: '',
  setToken: (token) => set({ token }),
  clearToken: () => set({ token: null }),
  setUsername: (username) => set({ username }),
  setPassword: (password) => set({ password }),
  logout: () => set({ token: null, username: '', password: '' }),
}));
