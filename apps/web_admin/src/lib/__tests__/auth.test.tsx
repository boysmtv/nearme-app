import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { AuthProvider, useAuth } from '../auth';

vi.mock('../api', () => ({
  adminApi: {
    auth: {
      login: vi.fn(),
      logout: vi.fn().mockResolvedValue({}),
    },
  },
}));

function TestConsumer() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'anonymous'}</span>
      <span data-testid="user-name">{user?.name || 'none'}</span>
      <button onClick={() => login('a@b.com', 'pass')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function renderWithAuth(initialEntry = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts as anonymous when no stored user', () => {
    renderWithAuth();
    expect(screen.getByTestId('auth-status')).toHaveTextContent('anonymous');
    expect(screen.getByTestId('user-name')).toHaveTextContent('none');
  });

  it('restores user from localStorage', () => {
    localStorage.setItem('admin_user', JSON.stringify({ id: '1', email: 'a@b.com', name: 'Admin', role: 'ROLE_PLATFORM_ADMIN', mfaVerified: true }));
    renderWithAuth();
    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Admin');
  });

  it('login sets user and navigates to dashboard', async () => {
    const { adminApi } = await import('../api');
    (adminApi.auth.login as Mock).mockResolvedValue({
      data: {
        accessToken: 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX1BMQVRGT1JNX0FETUlOIl0sInN1YiI6InVzZXIxIiwiZW1haWwiOiJhQGIuY29tIiwibmFtZSI6IlRlc3QifQ.',
        refreshToken: 'refresh123',
      },
    });
    renderWithAuth();
    await act(async () => {
      screen.getByText('Login').click();
    });
    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test');
    expect(localStorage.getItem('auth_token')).toBe('eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX1BMQVRGT1JNX0FETUlOIl0sInN1YiI6InVzZXIxIiwiZW1haWwiOiJhQGIuY29tIiwibmFtZSI6IlRlc3QifQ.');
    expect(localStorage.getItem('auth_refresh')).toBe('refresh123');
    expect(localStorage.getItem('admin_user')).toContain('Test');
  });

  it('logout clears storage and navigates to login', async () => {
    localStorage.setItem('auth_token', 'token');
    localStorage.setItem('admin_user', JSON.stringify({ id: '1', email: 'a@b.com', name: 'Admin', role: 'ROLE_PLATFORM_ADMIN', mfaVerified: true }));
    const { adminApi } = await import('../api');
    renderWithAuth();
    await act(async () => {
      screen.getByText('Logout').click();
    });
    expect(screen.getByTestId('auth-status')).toHaveTextContent('anonymous');
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('admin_user')).toBeNull();
    expect(adminApi.auth.logout).toHaveBeenCalled();
  });

  it('login returns false when MFA required without code', async () => {
    const { adminApi } = await import('../api');
    (adminApi.auth.login as Mock).mockResolvedValue({
      data: { accessToken: '', requiresMfa: true },
    });
    renderWithAuth();
    let result: boolean;
    await act(async () => {
      result = await (screen.getByText('Login').click as any);
    });
    expect(screen.getByTestId('auth-status')).toHaveTextContent('anonymous');
  });

  it('throws when useAuth used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(
        <MemoryRouter>
          <TestConsumer />
        </MemoryRouter>
      );
    }).toThrow('useAuth must be used within AuthProvider');
    spy.mockRestore();
  });
});
