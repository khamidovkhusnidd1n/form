import { useState, useCallback } from 'react';
import type { AdminUser } from '../types';

const AUTH_KEY = 'centr-form-auth';

export function getStoredAuth(): { user: AdminUser | null; token: string | null; refreshToken: string | null } {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : { user: null, token: null, refreshToken: null };
  } catch {
    return { user: null, token: null, refreshToken: null };
  }
}

export function setStoredAuth(user: AdminUser, token: string, refreshToken: string) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ user, token, refreshToken }));
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function useAuth() {
  const [auth, setAuth] = useState(getStoredAuth);

  const login = useCallback((user: AdminUser, token: string, refreshToken: string) => {
    setStoredAuth(user, token, refreshToken);
    setAuth({ user, token, refreshToken });
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setAuth({ user: null, token: null, refreshToken: null });
  }, []);

  return { user: auth.user, token: auth.token, refreshToken: auth.refreshToken, isAuthenticated: !!auth.token, login, logout };
}
