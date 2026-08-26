import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../auth';

vi.mock('../api', () => ({
  providerApi: {
    auth: {
      login: vi.fn(),
      logout: vi.fn(),
    },
  },
}));

import { providerApi } from '../api';

const mockLogin = vi.mocked(providerApi.auth.login);
const mockLogout = vi.mocked(providerApi.auth.logout);

function TestComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="is-authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user-email">{user?.email ?? 'none'}</span>
      <button onClick={() => login('test@test.com', 'password123')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function renderWithAuth(initialEntries?: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('AuthProvider', () => {
  it('starts unauthenticated when no stored user', () => {
    renderWithAuth();
    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user-email').textContent).toBe('none');
  });

  it('restores user from localStorage on mount', () => {
    localStorage.setItem('provider_user', JSON.stringify({
      id: '',
      email: 'stored@test.com',
      name: '',
      businessName: '',
      role: 'OWNER',
    }));
    renderWithAuth();
    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user-email').textContent).toBe('stored@test.com');
  });

  it('login stores tokens and user in localStorage', async () => {
    mockLogin.mockResolvedValue({
      data: { accessToken: 'access-123', refreshToken: 'refresh-456' },
    });
    renderWithAuth(['/login']);

    await userEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(localStorage.getItem('auth_token')).toBe('access-123');
      expect(localStorage.getItem('auth_refresh')).toBe('refresh-456');
      expect(localStorage.getItem('provider_user')).toBeTruthy();
    });
  });

  it('login sets authenticated state', async () => {
    mockLogin.mockResolvedValue({
      data: { accessToken: 'at', refreshToken: 'rt' },
    });
    renderWithAuth(['/login']);

    await userEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    });
  });

  it('logout clears localStorage and sets unauthenticated', async () => {
    localStorage.setItem('auth_token', 'existing-token');
    localStorage.setItem('auth_refresh', 'existing-refresh');
    localStorage.setItem('provider_user', JSON.stringify({ email: 'x@x.com' }));
    mockLogout.mockResolvedValue({});

    renderWithAuth(['/dashboard']);

    await userEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('auth_refresh')).toBeNull();
      expect(localStorage.getItem('provider_user')).toBeNull();
      expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    });
  });

  it('logout calls api with refresh token', async () => {
    localStorage.setItem('auth_refresh', 'my-refresh');
    mockLogout.mockResolvedValue({});

    renderWithAuth(['/dashboard']);
    await userEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledWith('my-refresh');
    });
  });
});

describe('useAuth outside AuthProvider', () => {
  it('throws error when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(
        <MemoryRouter>
          <TestComponent />
        </MemoryRouter>,
      );
    }).toThrow('useAuth must be used within AuthProvider');
    consoleSpy.mockRestore();
  });
});
