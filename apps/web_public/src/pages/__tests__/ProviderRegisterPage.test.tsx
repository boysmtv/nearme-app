import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockNavigate = vi.fn();
let authState = { user: null as any, isAuthenticated: false };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../lib/auth', () => ({
  useAuth: () => authState,
}));

vi.mock('../../lib/api', () => ({
  publicApi: { auth: { register: vi.fn() } },
  providerApi: { tenant: { create: vi.fn().mockResolvedValue({ data: { id: 't1' } }) } },
}));

vi.mock('../../components/Header', () => ({
  default: () => <header data-testid="header">Header</header>,
}));

vi.mock('../../components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

import ProviderRegisterPage from '../ProviderRegisterPage';
import { providerApi } from '../../lib/api';

function renderProviderRegister() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <ProviderRegisterPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('ProviderRegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState = { user: null, isAuthenticated: false };
  });

  it('renders provider registration heading', () => {
    renderProviderRegister();
    expect(screen.getByRole('heading', { name: 'Daftar sebagai Provider' })).toBeInTheDocument();
  });

  it('shows login prompt when not authenticated', () => {
    renderProviderRegister();
    expect(screen.getByText(/anda perlu login terlebih dahulu/i)).toBeInTheDocument();
    expect(screen.getByText('Login / Daftar')).toBeInTheDocument();
  });

  it('renders header and footer', () => {
    renderProviderRegister();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('shows form when authenticated', () => {
    authState = { user: { email: 'budi@test.com' }, isAuthenticated: true };
    renderProviderRegister();
    expect(screen.getByPlaceholderText('Barbershop Central')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /daftar provider/i })).toBeInTheDocument();
  });

  it('auto-fills email from user when authenticated', () => {
    authState = { user: { email: 'budi@test.com' }, isAuthenticated: true };
    renderProviderRegister();
    const emailInput = screen.getByPlaceholderText('info@barbershop.com');
    expect(emailInput).toHaveValue('budi@test.com');
  });

  it('auto-generates slug from name', async () => {
    authState = { user: { email: 'budi@test.com' }, isAuthenticated: true };
    renderProviderRegister();
    const nameInput = screen.getByPlaceholderText('Barbershop Central');
    await userEvent.type(nameInput, 'Barbershop Central');
    const slugInput = screen.getByPlaceholderText('barbershop-central');
    expect(slugInput).toHaveValue('barbershop-central');
  });

  it('shows slug preview URL', () => {
    authState = { user: { email: 'budi@test.com' }, isAuthenticated: true };
    renderProviderRegister();
    expect(screen.getByText(/URL: \/provider\//)).toBeInTheDocument();
  });

  it('shows field validation errors on submit with empty fields', async () => {
    authState = { user: { email: 'budi@test.com' }, isAuthenticated: true };
    renderProviderRegister();
    await userEvent.click(screen.getByRole('button', { name: /daftar provider/i }));
    await waitFor(() => {
      expect(screen.getByText(/nama minimal 2 karakter/i)).toBeInTheDocument();
    });
  });

  it('shows phone validation error for short phone', async () => {
    authState = { user: { email: 'budi@test.com' }, isAuthenticated: true };
    renderProviderRegister();
    const nameInput = screen.getByPlaceholderText('Barbershop Central');
    await userEvent.type(nameInput, 'Barbershop');
    const phoneInput = screen.getByPlaceholderText('08123456789');
    await userEvent.type(phoneInput, '123');
    await userEvent.click(screen.getByRole('button', { name: /daftar provider/i }));
    await waitFor(() => {
      expect(screen.getByText(/nomor telepon minimal 10 digit/i)).toBeInTheDocument();
    });
  });

  it('submits form successfully when all fields are valid', async () => {
    authState = { user: { email: 'budi@test.com' }, isAuthenticated: true };
    renderProviderRegister();
    const nameInput = screen.getByPlaceholderText('Barbershop Central');
    await userEvent.type(nameInput, 'Barbershop Central');
    const phoneInput = screen.getByPlaceholderText('08123456789');
    await userEvent.type(phoneInput, '08123456789');
    await userEvent.click(screen.getByRole('button', { name: /daftar provider/i }));
    await waitFor(() => {
      expect(providerApi.tenant.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Barbershop Central',
        slug: 'barbershop-central',
      }));
    });
  });

  it('shows success message after submission', async () => {
    authState = { user: { email: 'budi@test.com' }, isAuthenticated: true };
    renderProviderRegister();
    const nameInput = screen.getByPlaceholderText('Barbershop Central');
    await userEvent.type(nameInput, 'Barbershop Central');
    await userEvent.click(screen.getByRole('button', { name: /daftar provider/i }));
    await waitFor(() => {
      expect(screen.getByText(/registrasi berhasil/i)).toBeInTheDocument();
    });
  });

  it('shows error message on submission failure', async () => {
    (providerApi.tenant.create as any).mockRejectedValueOnce({ response: { data: { message: 'Slug sudah digunakan' } } });
    authState = { user: { email: 'budi@test.com' }, isAuthenticated: true };
    renderProviderRegister();
    const nameInput = screen.getByPlaceholderText('Barbershop Central');
    await userEvent.type(nameInput, 'Barbershop Central');
    await userEvent.click(screen.getByRole('button', { name: /daftar provider/i }));
    await waitFor(() => {
      expect(screen.getByText('Slug sudah digunakan')).toBeInTheDocument();
    });
  });

  it('navigates to provider dashboard after success', async () => {
    authState = { user: { email: 'budi@test.com' }, isAuthenticated: true };
    renderProviderRegister();
    const nameInput = screen.getByPlaceholderText('Barbershop Central');
    await userEvent.type(nameInput, 'Barbershop Central');
    await userEvent.click(screen.getByRole('button', { name: /daftar provider/i }));
    await waitFor(() => {
      expect(screen.getByText(/registrasi berhasil/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/provider/dashboard');
    }, { timeout: 5000 });
  });

  it('shows admin contact info', () => {
    authState = { user: { email: 'budi@test.com' }, isAuthenticated: true };
    renderProviderRegister();
    expect(screen.getByText(/hubungi admin@dekat.id/i)).toBeInTheDocument();
  });

  it('shows about link', () => {
    authState = { user: { email: 'budi@test.com' }, isAuthenticated: true };
    renderProviderRegister();
    expect(screen.getByText('Pelajari tentang DEKAT')).toBeInTheDocument();
  });

  it('disables button while loading', async () => {
    (providerApi.tenant.create as any).mockReturnValue(new Promise(() => {}));
    authState = { user: { email: 'budi@test.com' }, isAuthenticated: true };
    renderProviderRegister();
    const nameInput = screen.getByPlaceholderText('Barbershop Central');
    await userEvent.type(nameInput, 'Barbershop Central');
    fireEvent.click(screen.getByRole('button', { name: /daftar provider/i }));
    await waitFor(() => {
      expect(screen.getByText('Mengirim...')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /mengirim/i })).toBeDisabled();
  });
});
