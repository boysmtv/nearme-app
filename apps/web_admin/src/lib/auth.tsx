import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from './api';

interface AdminUser { id: string; email: string; name: string; role: string; mfaVerified: boolean; }
interface AuthCtx { user: AdminUser | null; isAuthenticated: boolean; login: (e: string, p: string, mfa?: string) => Promise<boolean>; logout: () => void; }
const AuthContext = createContext<AuthCtx | null>(null);

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
    const u: AdminUser = { id: '', email, name: '', role: 'ADMIN', mfaVerified: !!mfaCode };
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
