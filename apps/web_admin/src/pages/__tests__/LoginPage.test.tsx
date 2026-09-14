import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../LoginPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../lib/api', () => ({
  adminApi: {
    auth: { login: vi.fn() },
  },
}));

import { adminApi } from '../../lib/api';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderLogin() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <LoginPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });

  it('renders login form with email and password fields', () => {
    const { container } = renderLogin();
    expect(container.querySelector('input[name="email"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="password"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /masuk/i })).toBeInTheDocument();
  });

  it('renders DEKAT logo and Admin Portal heading', () => {
    renderLogin();
    expect(screen.getByText('DEKAT')).toBeInTheDocument();
    expect(screen.getByText('Admin Portal')).toBeInTheDocument();
  });

  it('shows validation error for empty email', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));
    await waitFor(() => {
      expect(screen.getByText(/email tidak valid/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    const { container } = renderLogin();
    fireEvent.input(container.querySelector('input[name="email"]')!, { target: { value: 'test@test.com' } });
    fireEvent.input(container.querySelector('input[name="password"]')!, { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));
    await waitFor(() => {
      expect(screen.getByText(/password minimal 6 karakter/i)).toBeInTheDocument();
    });
  });

  it('calls login API on valid form submission', async () => {
    (adminApi.auth.login as any).mockResolvedValue({
      data: { accessToken: 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX1BMQVRGT1JNX0FETUlOIl19.x', requiresMfa: false },
    });
    const { container } = renderLogin();
    fireEvent.input(container.querySelector('input[name="email"]')!, { target: { value: 'admin@test.com' } });
    fireEvent.input(container.querySelector('input[name="password"]')!, { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));
    await waitFor(() => {
      expect(adminApi.auth.login).toHaveBeenCalledWith('admin@test.com', 'password123', undefined);
    });
  });

  it('shows MFA field when requiresMfa is true', async () => {
    (adminApi.auth.login as any).mockResolvedValue({
      data: { requiresMfa: true, accessToken: '' },
    });
    const { container } = renderLogin();
    fireEvent.input(container.querySelector('input[name="email"]')!, { target: { value: 'admin@test.com' } });
    fireEvent.input(container.querySelector('input[name="password"]')!, { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));
    await waitFor(() => {
      expect(container.querySelector('input[name="mfaCode"]')).toBeInTheDocument();
    });
  });

  it('shows error message on login failure', async () => {
    (adminApi.auth.login as any).mockRejectedValue(new Error('Invalid'));
    const { container } = renderLogin();
    fireEvent.input(container.querySelector('input[name="email"]')!, { target: { value: 'admin@test.com' } });
    fireEvent.input(container.querySelector('input[name="password"]')!, { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));
    await waitFor(() => {
      expect(screen.getByText(/email atau password salah/i)).toBeInTheDocument();
    });
  });
});
