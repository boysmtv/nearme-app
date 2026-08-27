import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApi } from './api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ROLE_CUSTOMER' | 'ROLE_PROVIDER_OWNER' | 'ROLE_PROVIDER_STAFF' | 'ROLE_PLATFORM_ADMIN';
  hasProfile: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  });
  const navigate = useNavigate();

  const buildUser = useCallback((token: string): AuthUser => {
    const payload = decodeToken(token) ?? {};
    const roles = (payload.roles ?? []) as string[];
    const role = roles[0] ?? 'ROLE_CUSTOMER';
    return {
      id: (payload.sub ?? '') as string,
      email: (payload.email ?? '') as string,
      name: (payload.name ?? '') as string,
      role: role as AuthUser['role'],
      hasProfile: roles.includes('has_profile') || role !== 'ROLE_CUSTOMER',
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await publicApi.auth.login(email, password);
    const token = res.data.accessToken;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_refresh', res.data.refreshToken);
    const u = buildUser(token);
    localStorage.setItem('auth_user', JSON.stringify(u));
    setUser(u);
    if (u.role === 'ROLE_CUSTOMER') navigate('/');
    else if (u.role.startsWith('ROLE_PROVIDER')) navigate('/provider/dashboard');
    else navigate('/admin/dashboard');
  }, [navigate, buildUser]);

  const register = useCallback(async (name: string, email: string, phone: string, password: string) => {
    const res = await publicApi.auth.register(name, email, phone, password);
    const token = res.data.accessToken;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_refresh', res.data.refreshToken);
    const u = buildUser(token);
    localStorage.setItem('auth_user', JSON.stringify(u));
    setUser(u);
    navigate('/profile/complete');
  }, [navigate, buildUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh');
    localStorage.removeItem('auth_user');
    setUser(null);
    navigate('/');
  }, [navigate]);

  const refreshUser = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const u = buildUser(token);
      localStorage.setItem('auth_user', JSON.stringify(u));
      setUser(u);
    }
  }, [buildUser]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
