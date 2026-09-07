import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
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
  completeProfile: (data: { nickname?: string; name?: string; phone?: string; email?: string }) => Promise<void>;
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

  const buildUser = useCallback((token: string, hasProfileOverride?: boolean): AuthUser => {
    const payload = decodeToken(token) ?? {};
    const roles = (payload.roles ?? []) as string[];
    const role = roles[0] ?? 'ROLE_CUSTOMER';
    // hasProfile defaults from localStorage / override, fallback to JWT heuristic
    const storedHasProfile = localStorage.getItem('has_profile');
    const hasProfile = hasProfileOverride !== undefined
      ? hasProfileOverride
      : storedHasProfile !== null ? storedHasProfile === 'true' : (roles.includes('has_profile') || role !== 'ROLE_CUSTOMER');
    return {
      id: (payload.sub ?? '') as string,
      email: (payload.email ?? '') as string,
      name: (payload.name ?? '') as string,
      role: role as AuthUser['role'],
      hasProfile,
    };
  }, []);

  const syncHasProfile = useCallback(async (token: string) => {
    try {
      const res = await publicApi.customer.getProfile() as unknown as { success: boolean; data: { exists: boolean; nickname?: string; name?: string; phone?: string } };
      const exists = res?.data?.exists === true;
      // treat hasProfile true if:
      // 1. customer profile exists with nickname, OR
      // 2. user has name AND phone in the User table (already completed before)
      const nickname = res?.data?.nickname ?? res?.data?.name ?? '';
      const hasName = String(nickname).trim().length > 0;
      const hasPhone = String(res?.data?.phone ?? '').trim().length > 0;
      const hasProfile = exists ? hasName : hasName && hasPhone;
      // persist
      localStorage.setItem('has_profile', String(hasProfile));
      const updated = buildUser(token, hasProfile);
      localStorage.setItem('auth_user', JSON.stringify(updated));
      setUser(updated);
      return hasProfile;
    } catch {
      // If API fails, keep existing hasProfile from localStorage (don't reset to false)
      const stored = localStorage.getItem('has_profile');
      return stored === 'true' ? true : null;
    }
  }, [buildUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await publicApi.auth.login(email, password);
    const token = res.data.accessToken;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_refresh', res.data.refreshToken);
    const u = buildUser(token);
    localStorage.setItem('auth_user', JSON.stringify(u));
    setUser(u);
    // Only sync profile for customers; admin/provider skip this
    if (u.role === 'ROLE_CUSTOMER') {
      const hp = await syncHasProfile(token);
      const effectiveHasProfile = hp !== null ? hp : u.hasProfile;
      if (effectiveHasProfile === false) {
        navigate('/profile/complete');
        return;
      }
      navigate('/');
    } else if (u.role.startsWith('ROLE_PROVIDER')) {
      navigate('/provider/dashboard');
    } else if (u.role === 'ROLE_PLATFORM_ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  }, [navigate, buildUser, syncHasProfile]);

  const register = useCallback(async (name: string, email: string, phone: string, password: string) => {
    const res = await publicApi.auth.register(name, email, phone, password);
    const token = res.data.accessToken;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_refresh', res.data.refreshToken);
    // new customer has no profile yet (needs phone/name completion verify)
    localStorage.setItem('has_profile', 'false');
    const u = buildUser(token, false);
    localStorage.setItem('auth_user', JSON.stringify(u));
    setUser(u);
    navigate('/profile/complete');
  }, [navigate, buildUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('has_profile');
    setUser(null);
    navigate('/');
  }, [navigate]);

  const refreshUser = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const u = buildUser(token);
      localStorage.setItem('auth_user', JSON.stringify(u));
      setUser(u);
      // also try background sync
      syncHasProfile(token);
    }
  }, [buildUser, syncHasProfile]);

  const completeProfile = useCallback(async (data: { nickname?: string; name?: string; phone?: string }) => {
    await publicApi.customer.updateProfile(data);
    const token = localStorage.getItem('auth_token');
    if (token) {
      localStorage.setItem('has_profile', 'true');
      const u = buildUser(token, true);
      localStorage.setItem('auth_user', JSON.stringify(u));
      setUser(u);
    }
  }, [buildUser]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && user) {
      // best-effort background profile check on mount
      syncHasProfile(token);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, refreshUser, completeProfile } as AuthContextType}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
