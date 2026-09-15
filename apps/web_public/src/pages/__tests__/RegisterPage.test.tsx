import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterPage from '../RegisterPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const { mockPublicApiRegister } = vi.hoisted(() => ({
  mockPublicApiRegister: vi.fn(),
}));

vi.mock('../../lib/api', () => ({
  publicApi: {
    auth: {
      register: mockPublicApiRegister,
    },
  },
}));

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({
    register: vi.fn(),
    user: null,
    isAuthenticated: false,
  }),
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <RegisterPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockPublicApiRegister.mockResolvedValue({
      data: { accessToken: 'access-token', refreshToken: 'refresh-token' },
    });
  });

  it('renders form with all fields', () => {
    renderPage();
    expect(screen.getByText('DEKAT')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /daftar$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nama lengkap/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nomor telepon/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Konfirmasi Password')).toBeInTheDocument();
  });

  it('shows Daftar button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /daftar$/i })).toBeInTheDocument();
  });

  it('shows Masuk link to login', () => {
    renderPage();
    const link = screen.getByRole('link', { name: /masuk/i });
    expect(link).toHaveAttribute('href', '/login');
  });

  it('shows subtitle text', () => {
    renderPage();
    expect(screen.getByText(/buat akun dekat baru/i)).toBeInTheDocument();
  });

  it('validates empty name shows min 2 chars error', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /daftar$/i }));
    await waitFor(() => {
      expect(screen.getByText(/nama harus minimal 2 karakter/i)).toBeInTheDocument();
    });
  });

  it('validates short password', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText(/nama lengkap/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.type(screen.getByLabelText('Konfirmasi Password'), 'short');
    await user.click(screen.getByRole('button', { name: /daftar$/i }));
    await waitFor(() => {
      expect(screen.getByText(/password harus minimal 8 karakter/i)).toBeInTheDocument();
    });
  });

  it('validates password mismatch', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText(/nama lengkap/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Konfirmasi Password'), 'differentpass');
    await user.click(screen.getByRole('button', { name: /daftar$/i }));
    await waitFor(() => {
      expect(screen.getByText(/password tidak cocok/i)).toBeInTheDocument();
    });
  });

  it('validates invalid email format', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/nama lengkap/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Konfirmasi Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /daftar$/i }));
    await waitFor(() => {
      expect(screen.getByText(/email tidak valid/i)).toBeInTheDocument();
    });
  });

  it('validates invalid phone number', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText(/nama lengkap/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/nomor telepon/i), '123');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Konfirmasi Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /daftar$/i }));
    await waitFor(() => {
      expect(screen.getByText(/nomor telepon tidak valid/i)).toBeInTheDocument();
    });
  });

  it('successful register stores tokens and navigates', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText(/nama lengkap/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Konfirmasi Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /daftar$/i }));
    await waitFor(() => {
      expect(mockPublicApiRegister).toHaveBeenCalledWith('Test User', 'test@example.com', undefined, 'password123');
      expect(localStorage.getItem('auth_token')).toBe('access-token');
      expect(localStorage.getItem('auth_refresh')).toBe('refresh-token');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('register with phone number passes phone', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText(/nama lengkap/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/nomor telepon/i), '081234567890');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Konfirmasi Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /daftar$/i }));
    await waitFor(() => {
      expect(mockPublicApiRegister).toHaveBeenCalledWith('Test User', 'test@example.com', '081234567890', 'password123');
    });
  });

  it('register error shows error message', async () => {
    mockPublicApiRegister.mockRejectedValue(new Error('duplicate email'));
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText(/nama lengkap/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Konfirmasi Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /daftar$/i }));
    await waitFor(() => {
      expect(screen.getByText(/gagal mendaftar/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while submitting', async () => {
    mockPublicApiRegister.mockReturnValue(new Promise(() => {}));
    renderPage();
    fireEvent.change(screen.getByLabelText(/nama lengkap/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Konfirmasi Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /daftar$/i }));
    await waitFor(() => {
      expect(screen.getByText(/mendaftar\.\.\./i)).toBeInTheDocument();
    });
  });

  it('clears error on new submission attempt', async () => {
    mockPublicApiRegister.mockRejectedValueOnce(new Error('fail'));
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText(/nama lengkap/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Konfirmasi Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /daftar$/i }));
    await waitFor(() => {
      expect(screen.getByText(/gagal mendaftar/i)).toBeInTheDocument();
    });
    mockPublicApiRegister.mockResolvedValue({
      data: { accessToken: 'new-access', refreshToken: 'new-refresh' },
    });
    await user.click(screen.getByRole('button', { name: /daftar$/i }));
    await waitFor(() => {
      expect(screen.queryByText(/gagal mendaftar/i)).not.toBeInTheDocument();
    });
  });

  it('phone field accepts valid phone with +62 prefix', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText(/nama lengkap/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/nomor telepon/i), '+6281234567890');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Konfirmasi Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /daftar$/i }));
    await waitFor(() => {
      expect(mockPublicApiRegister).toHaveBeenCalled();
    });
  });

  it('validates all fields empty at once', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /daftar$/i }));
    await waitFor(() => {
      expect(screen.getByText(/nama harus minimal 2 karakter/i)).toBeInTheDocument();
      expect(screen.getByText(/email tidak valid/i)).toBeInTheDocument();
      expect(screen.getByText(/password harus minimal 8 karakter/i)).toBeInTheDocument();
    });
  });

  it('DEKAT brand links to home', () => {
    renderPage();
    const brand = screen.getByText('DEKAT');
    expect(brand.closest('a')).toHaveAttribute('href', '/');
  });
});
