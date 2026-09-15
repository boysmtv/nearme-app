import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../LoginPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const { mockLogin } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
}));

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isAuthenticated: false,
    logout: vi.fn(),
  }),
}));

const { mockRequestOtp, mockVerifyOtp } = vi.hoisted(() => ({
  mockRequestOtp: vi.fn(),
  mockVerifyOtp: vi.fn(),
}));

vi.mock('../../lib/api', () => ({
  publicApi: {
    auth: {
      requestOtp: mockRequestOtp,
      verifyOtp: mockVerifyOtp,
    },
  },
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <LoginPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockLogin.mockResolvedValue(undefined);
    mockRequestOtp.mockResolvedValue({ success: true });
    mockVerifyOtp.mockResolvedValue({ data: { accessToken: 'tok', refreshToken: 'ref' } });
  });

  it('renders DEKAT brand and heading', () => {
    renderPage();
    expect(screen.getByText('DEKAT')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Masuk' })).toBeInTheDocument();
    expect(screen.getByText(/masuk ke akun dekat anda/i)).toBeInTheDocument();
  });

  it('renders password form by default', () => {
    renderPage();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /masuk$/i })).toBeInTheDocument();
  });

  it('renders mode toggle buttons', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kode otp/i })).toBeInTheDocument();
  });

  it('shows register link', () => {
    renderPage();
    const link = screen.getByRole('link', { name: /daftar sekarang/i });
    expect(link).toHaveAttribute('href', '/register');
  });

  it('DEKAT brand links to home', () => {
    renderPage();
    const brand = screen.getByText('DEKAT');
    expect(brand.closest('a')).toHaveAttribute('href', '/');
  });

  it('validates empty email on password submit', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /masuk$/i }));
    await waitFor(() => {
      expect(screen.getByText(/email tidak valid/i)).toBeInTheDocument();
    });
  });

  it('validates short password', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '12345' } });
    fireEvent.click(screen.getByRole('button', { name: /masuk$/i }));
    await waitFor(() => {
      expect(screen.getByText(/password harus minimal 6 karakter/i)).toBeInTheDocument();
    });
  });

  it('calls login on valid password submission', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /masuk$/i }));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'password123');
    });
  });

  it('shows error on login failure', async () => {
    mockLogin.mockRejectedValue(new Error('bad'));
    renderPage();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /masuk$/i }));
    await waitFor(() => {
      expect(screen.getByText('Email atau password salah')).toBeInTheDocument();
    });
  });

  it('shows loading state during password login', async () => {
    mockLogin.mockReturnValue(new Promise(() => {}));
    renderPage();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /masuk$/i }));
    await waitFor(() => {
      expect(screen.getByText(/masuk\.\.\./i)).toBeInTheDocument();
    });
  });

  it('switches to OTP mode', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /kode otp/i }));
    await waitFor(() => {
      expect(screen.getByText(/kirim kode otp/i)).toBeInTheDocument();
    });
    expect(screen.queryByLabelText(/password$/i)).not.toBeInTheDocument();
  });

  it('switches back to password mode from OTP', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /kode otp/i }));
    await waitFor(() => { expect(screen.getByText(/kirim kode otp/i)).toBeInTheDocument(); });
    fireEvent.click(screen.getByRole('button', { name: /^password$/i }));
    await waitFor(() => {
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });
  });

  it('requests OTP successfully shows code input', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /kode otp/i }));
    await waitFor(() => { expect(screen.getByText(/kirim kode otp/i)).toBeInTheDocument(); });
    fireEvent.change(screen.getByPlaceholderText(/email@contoh.com/i), { target: { value: 'otp@test.com' } });
    fireEvent.click(screen.getByText(/kirim kode otp/i));
    await waitFor(() => {
      expect(mockRequestOtp).toHaveBeenCalledWith('otp@test.com', 'LOGIN');
      expect(screen.getByText(/kode otp dikirim ke/i)).toBeInTheDocument();
      expect(screen.getByText('otp@test.com')).toBeInTheDocument();
    });
  });

  it('shows error on OTP request failure', async () => {
    mockRequestOtp.mockRejectedValue(new Error('fail'));
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /kode otp/i }));
    await waitFor(() => { expect(screen.getByText(/kirim kode otp/i)).toBeInTheDocument(); });
    fireEvent.change(screen.getByPlaceholderText(/email@contoh.com/i), { target: { value: 'otp@test.com' } });
    fireEvent.click(screen.getByText(/kirim kode otp/i));
    await waitFor(() => {
      expect(screen.getByText('Gagal mengirim kode OTP')).toBeInTheDocument();
    });
  });

  it('verifies OTP and navigates', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /kode otp/i }));
    await waitFor(() => { expect(screen.getByText(/kirim kode otp/i)).toBeInTheDocument(); });
    fireEvent.change(screen.getByPlaceholderText(/email@contoh.com/i), { target: { value: 'otp@test.com' } });
    fireEvent.click(screen.getByText(/kirim kode otp/i));
    await waitFor(() => { expect(screen.getByText(/kode otp dikirim ke/i)).toBeInTheDocument(); });
    const codeInput = screen.getByPlaceholderText('000000');
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /verifikasi & masuk/i }));
    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith('otp@test.com', '123456', 'LOGIN');
      expect(screen.getByText(/login berhasil!/i)).toBeInTheDocument();
    });
  });

  it('shows error on OTP verify failure', async () => {
    mockVerifyOtp.mockRejectedValue(new Error('bad'));
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /kode otp/i }));
    await waitFor(() => { expect(screen.getByText(/kirim kode otp/i)).toBeInTheDocument(); });
    fireEvent.change(screen.getByPlaceholderText(/email@contoh.com/i), { target: { value: 'otp@test.com' } });
    fireEvent.click(screen.getByText(/kirim kode otp/i));
    await waitFor(() => { expect(screen.getByText(/kode otp dikirim ke/i)).toBeInTheDocument(); });
    const codeInput = screen.getByPlaceholderText('000000');
    fireEvent.change(codeInput, { target: { value: '111111' } });
    fireEvent.click(screen.getByRole('button', { name: /verifikasi & masuk/i }));
    await waitFor(() => {
      expect(screen.getByText('Kode OTP salah atau sudah kedaluwarsa')).toBeInTheDocument();
    });
  });

  it('resend email resets OTP form', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /kode otp/i }));
    await waitFor(() => { expect(screen.getByText(/kirim kode otp/i)).toBeInTheDocument(); });
    fireEvent.change(screen.getByPlaceholderText(/email@contoh.com/i), { target: { value: 'otp@test.com' } });
    fireEvent.click(screen.getByText(/kirim kode otp/i));
    await waitFor(() => { expect(screen.getByText(/kode otp dikirim ke/i)).toBeInTheDocument(); });
    fireEvent.click(screen.getByText(/ganti email atau kirim ulang/i));
    await waitFor(() => {
      expect(screen.getByText(/kirim kode otp/i)).toBeInTheDocument();
    });
  });

  it('mode toggle clears previous error', async () => {
    mockLogin.mockRejectedValueOnce(new Error('bad'));
    renderPage();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /masuk$/i }));
    await waitFor(() => { expect(screen.getByText('Email atau password salah')).toBeInTheDocument(); });
    fireEvent.click(screen.getByRole('button', { name: /kode otp/i }));
    await waitFor(() => {
      expect(screen.queryByText('Email atau password salah')).not.toBeInTheDocument();
    });
  });

  it('shows otp success screen after verify', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /kode otp/i }));
    await waitFor(() => { expect(screen.getByText(/kirim kode otp/i)).toBeInTheDocument(); });
    fireEvent.change(screen.getByPlaceholderText(/email@contoh.com/i), { target: { value: 'otp@test.com' } });
    fireEvent.click(screen.getByText(/kirim kode otp/i));
    await waitFor(() => { expect(screen.getByText(/kode otp dikirim ke/i)).toBeInTheDocument(); });
    const codeInput = screen.getByPlaceholderText('000000');
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /verifikasi & masuk/i }));
    await waitFor(() => {
      expect(screen.getByText(/login berhasil!/i)).toBeInTheDocument();
      expect(screen.getByText(/mengalihkan ke beranda/i)).toBeInTheDocument();
    });
  });

  it('OTP verify stores tokens in localStorage', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /kode otp/i }));
    await waitFor(() => { expect(screen.getByText(/kirim kode otp/i)).toBeInTheDocument(); });
    fireEvent.change(screen.getByPlaceholderText(/email@contoh.com/i), { target: { value: 'otp@test.com' } });
    fireEvent.click(screen.getByText(/kirim kode otp/i));
    await waitFor(() => { expect(screen.getByText(/kode otp dikirim ke/i)).toBeInTheDocument(); });
    const codeInput = screen.getByPlaceholderText('000000');
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /verifikasi & masuk/i }));
    await waitFor(() => {
      expect(localStorage.getItem('auth_token')).toBe('tok');
      expect(localStorage.getItem('auth_refresh')).toBe('ref');
    });
  });

  it('does not show OTP form in password mode', () => {
    renderPage();
    expect(screen.queryByRole('button', { name: /kirim kode otp/i })).not.toBeInTheDocument();
  });

  it('shows placeholder text in password fields', () => {
    renderPage();
    expect(screen.getByPlaceholderText(/email@contoh.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/masukkan password/i)).toBeInTheDocument();
  });
});
