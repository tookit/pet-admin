import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { STORAGE_KEYS } from '@/constants/app';
import { mockApi } from '@/mocks/api';

export interface AuthUser {
  name: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Session storage is user-writable, so treat its contents as untrusted. */
function readStoredUser(): AuthUser | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.USER);
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  } catch {
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  const login = useCallback(async (email: string) => {
    const nextUser = await mockApi.login(email);
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
