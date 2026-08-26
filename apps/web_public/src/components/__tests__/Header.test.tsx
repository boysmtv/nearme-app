import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../Header';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
