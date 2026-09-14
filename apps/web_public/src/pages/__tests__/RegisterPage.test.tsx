import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterPage from '../RegisterPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({
    register: vi.fn().mockResolvedValue(undefined),
    user: null,
    isAuthenticated: false,
  }),
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderRegister() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <RegisterPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders registration form with DEKAT branding', () => {
    renderRegister();
    expect(screen.getByText('DEKAT')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Daftar' })).toBeInTheDocument();
  });

  it('renders name, email, phone, and password fields', () => {
    renderRegister();
    expect(screen.getByLabelText(/nama lengkap/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nomor telepon/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Konfirmasi Password')).toBeInTheDocument();
  });

  it('shows login link', () => {
    renderRegister();
    expect(screen.getByText(/sudah punya akun/i)).toBeInTheDocument();
  });

  it('shows validation errors on empty submission', async () => {
    renderRegister();
    fireEvent.click(screen.getByRole('button', { name: /daftar$/i }));
    await waitFor(() => {
      expect(screen.getByText(/minimal 2 karakter/i)).toBeInTheDocument();
    });
  });
});
