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

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue(undefined),
    user: null,
    isAuthenticated: false,
    logout: vi.fn(),
  }),
}));

vi.mock('../../lib/api', () => ({
  publicApi: {
    auth: {
      requestOtp: vi.fn().mockResolvedValue({ success: true }),
      verifyOtp: vi.fn().mockResolvedValue({ data: { accessToken: 'token', refreshToken: 'refresh' } }),
    },
  },
}));

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

describe('web_public LoginPage', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });

  it('renders login form with DEKAT branding', () => {
    renderLogin();
    expect(screen.getByText('DEKAT')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Masuk' })).toBeInTheDocument();
  });

  it('renders password and OTP mode toggle', () => {
    renderLogin();
    const buttons = screen.getAllByRole('button');
    const passwordBtn = buttons.find(b => b.textContent?.includes('Password'));
    const otpBtn = buttons.find(b => b.textContent?.includes('Kode OTP'));
    expect(passwordBtn).toBeInTheDocument();
    expect(otpBtn).toBeInTheDocument();
  });

  it('renders email and password fields in password mode', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows register link', () => {
    renderLogin();
    expect(screen.getByText(/daftar sekarang/i)).toBeInTheDocument();
  });

  it('switches to OTP mode when OTP tab clicked', async () => {
    renderLogin();
    const buttons = screen.getAllByRole('button');
    const otpBtn = buttons.find(b => b.textContent?.includes('Kode OTP'));
    fireEvent.click(otpBtn!);
    await waitFor(() => {
      expect(screen.getByText(/kirim kode otp/i)).toBeInTheDocument();
    });
  });

  it('shows validation errors on empty submission', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /masuk$/i }));
    await waitFor(() => {
      expect(screen.getByText(/email tidak valid/i)).toBeInTheDocument();
    });
  });
});
