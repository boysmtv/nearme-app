import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { providerApi } from './api';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  businessName: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('provider_user');
    return stored ? JSON.parse(stored) : null;
  });
  const navigate = useNavigate();

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await providerApi.auth.login(email, password);
      localStorage.setItem('provider_token', res.data.token);
      localStorage.setItem('provider_refresh', res.data.refreshToken);
      const userData: AuthUser = { id: '', email, name: '', businessName: '', role: 'OWNER' };
      localStorage.setItem('provider_user', JSON.stringify(userData));
      setUser(userData);
      navigate('/dashboard');
    },
    [navigate],
  );

  const logout = useCallback(() => {
    providerApi.auth.logout().catch(() => {});
    localStorage.removeItem('provider_token');
    localStorage.removeItem('provider_refresh');
    localStorage.removeItem('provider_user');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
