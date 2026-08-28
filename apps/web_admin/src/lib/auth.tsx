import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from './api';

interface AdminUser { id: string; email: string; name: string; role: string; mfaVerified: boolean; }
interface AuthCtx { user: AdminUser | null; isAuthenticated: boolean; login: (e: string, p: string, mfa?: string) => Promise<boolean>; logout: () => void; }
const AuthContext = createContext<AuthCtx | null>(null);

function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    return JSON.parse(atob(parts[1]));
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => { const s = localStorage.getItem('admin_user'); return s ? JSON.parse(s) : null; });
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string, mfaCode?: string) => {
    const res = await adminApi.auth.login(email, password, mfaCode);
    if (res.data.requiresMfa && !mfaCode) return false;
    localStorage.setItem('auth_token', res.data.accessToken);
    if (res.data.refreshToken) {
      localStorage.setItem('auth_refresh', res.data.refreshToken);
    }
    const payload = decodeToken(res.data.accessToken) ?? {};
    const roles = (payload.roles ?? []) as string[];
    const role = roles[0] ?? 'ROLE_PLATFORM_ADMIN';
    // Single login handling: if not admin, redirect to appropriate portal (web_public)
    if (role === 'ROLE_CUSTOMER') {
      window.location.href = 'http://localhost:4100';
      return true;
    }
    if (role.startsWith('ROLE_PROVIDER')) {
      window.location.href = 'http://localhost:4100/provider/dashboard';
      return true;
    }
    const u: AdminUser = { id: (payload.sub ?? '') as string, email: (payload.email ?? email) as string, name: (payload.name ?? '') as string, role, mfaVerified: !!mfaCode };
    localStorage.setItem('admin_user', JSON.stringify(u));
    setUser(u);
    navigate('/dashboard');
    return true;
  }, [navigate]);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem('auth_refresh');
    adminApi.auth.logout(refreshToken ?? undefined).catch(() => {});
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh');
    localStorage.removeItem('admin_user');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  return <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
