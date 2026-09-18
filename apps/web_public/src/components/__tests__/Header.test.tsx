import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from '../Header';

const mockNavigate = vi.fn();
const mockLogout = vi.fn();
const mockAuthState = vi.fn(() => ({ user: null, isAuthenticated: false, logout: mockLogout }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../lib/auth', () => ({
  useAuth: () => mockAuthState(),
}));

vi.mock('../../lib/api', () => ({
  api: { get: vi.fn().mockResolvedValue({ data: { data: [{ id: 'n1', read: false }, { id: 'n2', read: true }] } }) },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function renderHeader() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <Header />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.mockReturnValue({ user: null, isAuthenticated: false, logout: mockLogout });
  });

  it('menampilkan logo DEKAT', () => {
    renderHeader();
    expect(screen.getByText('DEKAT')).toBeInTheDocument();
  });

  it('menampilkan teks Booking Platform', () => {
    renderHeader();
    expect(screen.getByText('Booking Platform')).toBeInTheDocument();
  });

  it('menampilkan form search dengan placeholder', () => {
    renderHeader();
    const inputs = screen.getAllByPlaceholderText(/Cari layanan/);
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('navigasi ke /search saat submit search form dengan query', () => {
    renderHeader();
    const input = screen.getAllByPlaceholderText(/Cari layanan/)[0];
    fireEvent.change(input, { target: { value: 'barbershop' } });
    fireEvent.submit(input.closest('form')!);
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=barbershop');
  });

  it('tidak navigasi jika search query kosong', () => {
    renderHeader();
    const input = screen.getAllByPlaceholderText(/Cari layanan/)[0];
    fireEvent.submit(input.closest('form')!);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('menampilkan link navigasi', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: /Cari Layanan/ })).toHaveAttribute('href', '/search');
    expect(screen.getByRole('link', { name: /Masuk/ })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /Daftar/ })).toHaveAttribute('href', '/register');
  });

  it('logo mengarah ke halaman utama', () => {
    renderHeader();
    const logoLink = screen.getByRole('link', { name: /DEKAT/ });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('mobile search input mengubah query dan submit navigasi', () => {
    renderHeader();
    const inputs = screen.getAllByPlaceholderText(/Cari layanan/);
    expect(inputs.length).toBe(2);
    fireEvent.change(inputs[1], { target: { value: 'salon' } });
    fireEvent.submit(inputs[1].closest('form')!);
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=salon');
  });

  it('authenticated: fetch notifikasi dan tampil badge unread', async () => {
    mockAuthState.mockReturnValue({
      user: { name: 'Siti', email: 'siti@gmail.com', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
      logout: mockLogout,
    });
    renderHeader();
    await waitFor(() => {
      expect(screen.getByText('Chat')).toBeInTheDocument();
    });
    expect(screen.getByText('Akun Saya')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('authenticated provider: tampil Dashboard Provider', async () => {
    mockAuthState.mockReturnValue({
      user: { name: 'Budi', email: 'budi@test.com', role: 'ROLE_PROVIDER_OWNER' },
      isAuthenticated: true,
      logout: mockLogout,
    });
    renderHeader();
    await waitFor(() => {
      expect(screen.getByText('Dashboard Provider')).toBeInTheDocument();
    });
  });

  it('klik Keluar memanggil logout', async () => {
    mockAuthState.mockReturnValue({
      user: { name: 'Siti', email: 'siti@gmail.com', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
      logout: mockLogout,
    });
    renderHeader();
    await waitFor(() => {
      expect(screen.getByText('Keluar')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Keluar'));
    expect(mockLogout).toHaveBeenCalled();
  });
});
