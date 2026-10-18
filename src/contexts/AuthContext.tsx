import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { clearSession } from '@/api/client';
import { getMeAPI, loginAPI } from '@/api/modules/auth.api';
import { STORAGE_KEYS } from '@/constants/app';
import type { ApiUser } from '@/types/api';

interface AuthContextValue {
  user: ApiUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: ApiUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Session storage is user-writable, so treat its contents as untrusted. */
function readStoredUser(): ApiUser | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.USER);
    return stored ? (JSON.parse(stored) as ApiUser) : null;
  } catch {
    clearSession();
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<ApiUser | null>(readStoredUser);

  const login = useCallback(async (username: string, password: string) => {
    const { access_token } = await loginAPI({ username, password });
    sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
    try {
      const nextUser = await getMeAPI();
      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(nextUser));
      setUser(nextUser);
    } catch (error) {
      clearSession();
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const updateUser = useCallback((nextUser: ApiUser) => {
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, login, logout, updateUser }),
    [user, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
