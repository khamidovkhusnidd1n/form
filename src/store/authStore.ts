import { useState, useCallback } from 'react';
import type { AdminUser } from '../types';

const AUTH_KEY = 'centr-form-auth';

export function getStoredAuth(): { user: AdminUser | null; token: string | null } {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : { user: null, token: null };
  } catch {
    return { user: null, token: null };
  }
}

export function setStoredAuth(user: AdminUser, token: string) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ user, token }));
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function useAuth() {
  const [auth, setAuth] = useState(getStoredAuth);

  const login = useCallback((user: AdminUser, token: string) => {
    setStoredAuth(user, token);
    setAuth({ user, token });
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setAuth({ user: null, token: null });
  }, []);

  return { user: auth.user, token: auth.token, isAuthenticated: !!auth.token, login, logout };
}
