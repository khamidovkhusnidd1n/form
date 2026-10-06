import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '../types';

const AUTH_KEY = 'centr-form-auth-v2';

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: AdminUser, token: string, refreshToken: string) => void;
  logout: () => void;
  updateTokens: (token: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, token, refreshToken) => 
        set({ user, token, refreshToken, isAuthenticated: !!token }),
      logout: () => 
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
      updateTokens: (token, refreshToken) => 
        set({ token, refreshToken, isAuthenticated: !!token }),
    }),
    {
      name: AUTH_KEY,
    }
  )
);

// Backward compatibility helpers
export function getStoredAuth() {
  const state = useAuthStore.getState();
  return { 
    user: state.user, 
    token: state.token, 
    refreshToken: state.refreshToken 
  };
}

export function clearStoredAuth() {
  useAuthStore.getState().logout();
}

export const useAuth = () => useAuthStore();
