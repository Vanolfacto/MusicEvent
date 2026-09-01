import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import api, { getErrorMessage } from '../lib/api';
import type { ApiResponse, User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
      setUser(res.data.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
    } catch {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/login', {
      email,
      password,
    });
    localStorage.setItem('accessToken', res.data.data.accessToken);
    localStorage.setItem('user', JSON.stringify(res.data.data.user));
    setUser(res.data.data.user);
  }, []);

  const register = useCallback(async (data: Record<string, unknown>) => {
    const res = await api.post<ApiResponse<{ user: User; accessToken: string }>>(
      '/auth/register',
      data,
    );
    localStorage.setItem('accessToken', res.data.data.accessToken);
    localStorage.setItem('user', JSON.stringify(res.data.data.user));
    setUser(res.data.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn(getErrorMessage(error));
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth mora biti unutar AuthProvider');
  return ctx;
}
