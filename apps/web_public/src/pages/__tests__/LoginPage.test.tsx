import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../LoginPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

const { mockLogin, mockRequestOtp, mockVerifyOtp } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockRequestOtp: vi.fn(),
  mockVerifyOtp: vi.fn(),
}));

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isAuthenticated: false,
    logout: vi.fn(),
  }),
}));

vi.mock('../../lib/api', () => ({
  publicApi: {
    auth: {
      requestOtp: mockRequestOtp,
      verifyOtp: mockVerifyOtp,
    },
  },
}));

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderLogin() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <LoginPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('web_public LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockLogin.mockResolvedValue(undefined);
    mockRequestOtp.mockResolvedValue({ success: true });
    mockVerifyOtp.mockResolvedValue({ data: { accessToken: 'tok', refreshToken: 'ref' } });
  });

  it('renders login form with DEKAT branding', () => {
    renderLogin();
    expect(screen.getByText('DEKAT')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Masuk' })).toBeInTheDocument();
  });

  it('renders password and OTP mode toggle', () => {
    renderLogin();
    const btns = screen.getAllByRole('button');
    expect(btns.find(b => b.textContent?.includes('Password'))).toBeInTheDocument();
    expect(btns.find(b => b.textContent?.includes('Kode OTP'))).toBeInTheDocument();
  });

  it('renders email and password fields', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows register link', () => {
    renderLogin();
    expect(screen.getByText(/daftar sekarang/i)).toBeInTheDocument();
  });

  it('switches to OTP mode', async () => {
    renderLogin();
    fireEvent.click(screen.getAllByRole('button').find(b => b.textContent?.includes('Kode OTP'))!);
    await waitFor(() => { expect(screen.getByText(/kirim kode otp/i)).toBeInTheDocument(); });
  });

  it('shows validation errors on empty submission', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /masuk$/i }));
    await waitFor(() => { expect(screen.getByText(/email tidak valid/i)).toBeInTheDocument(); });
  });

  it('calls login on valid password submission', async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /masuk$/i }));
    await waitFor(() => { expect(mockLogin).toHaveBeenCalledWith('a@b.com', '123456'); });
  });

  it('shows error on login failure', async () => {
    mockLogin.mockRejectedValue(new Error('bad'));
    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /masuk$/i }));
    await waitFor(() => { expect(screen.getByText('Email atau password salah')).toBeInTheDocument(); });
  });

  it('request OTP success shows OTP input', async () => {
    renderLogin();
    fireEvent.click(screen.getAllByRole('button').find(b => b.textContent?.includes('Kode OTP'))!);
    await waitFor(() => { expect(screen.getByText(/kirim kode otp/i)).toBeInTheDocument(); });
    fireEvent.change(screen.getByPlaceholderText(/email@contoh.com/i), { target: { value: 'x@y.com' } });
    fireEvent.click(screen.getByText(/kirim kode otp/i));
    await waitFor(() => {
      expect(mockRequestOtp).toHaveBeenCalledWith('x@y.com', 'LOGIN');
      expect(screen.getByText(/kode otp dikirim ke/i)).toBeInTheDocument();
    });
  });

  it('request OTP failure shows error', async () => {
    mockRequestOtp.mockRejectedValue(new Error('bad'));
    renderLogin();
    fireEvent.click(screen.getAllByRole('button').find(b => b.textContent?.includes('Kode OTP'))!);
    await waitFor(() => { expect(screen.getByText(/kirim kode otp/i)).toBeInTheDocument(); });
    fireEvent.change(screen.getByPlaceholderText(/email@contoh.com/i), { target: { value: 'x@y.com' } });
    fireEvent.click(screen.getByText(/kirim kode otp/i));
    await waitFor(() => { expect(screen.getByText('Gagal mengirim kode OTP')).toBeInTheDocument(); });
  });

  it('resend email resets OTP form', async () => {
    renderLogin();
    fireEvent.click(screen.getAllByRole('button').find(b => b.textContent?.includes('Kode OTP'))!);
    await waitFor(() => { expect(screen.getByText(/kirim kode otp/i)).toBeInTheDocument(); });
    fireEvent.change(screen.getByPlaceholderText(/email@contoh.com/i), { target: { value: 'x@y.com' } });
    fireEvent.click(screen.getByText(/kirim kode otp/i));
    await waitFor(() => { expect(screen.getByText(/kode otp dikirim ke/i)).toBeInTheDocument(); });
    fireEvent.click(screen.getByText(/ganti email atau kirim ulang/i));
    await waitFor(() => { expect(screen.getByText(/kirim kode otp/i)).toBeInTheDocument(); });
  });

  it('mode toggle clears error', async () => {
    mockLogin.mockRejectedValue(new Error('bad'));
    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /masuk$/i }));
    await waitFor(() => { expect(screen.getByText('Email atau password salah')).toBeInTheDocument(); });
    mockLogin.mockResolvedValue(undefined);
    fireEvent.click(screen.getAllByRole('button').find(b => b.textContent?.includes('Kode OTP'))!);
    await waitFor(() => { expect(screen.queryByText('Email atau password salah')).not.toBeInTheDocument(); });
  });
});
