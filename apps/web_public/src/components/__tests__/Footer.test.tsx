import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../Footer';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual };
});

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
}

describe('Footer', () => {
  it('menampilkan logo DEKAT', () => {
    renderFooter();
    expect(screen.getByText('DEKAT')).toBeInTheDocument();
  });

  it('menampilkan deskripsi platform', () => {
    renderFooter();
    expect(screen.getByText(/Platform booking layanan/)).toBeInTheDocument();
  });

  it('menampilkan section Jelajahi dengan link', () => {
    renderFooter();
    expect(screen.getByText('Jelajahi')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cari Layanan' })).toHaveAttribute('href', '/search');
    expect(screen.getByRole('link', { name: 'Masuk' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Daftar Akun' })).toHaveAttribute('href', '/register');
  });

  it('menampilkan section Informasi', () => {
    renderFooter();
    expect(screen.getByText('Informasi')).toBeInTheDocument();
    expect(screen.getByText('Syarat & Ketentuan')).toBeInTheDocument();
    expect(screen.getByText('Kebijakan Privasi')).toBeInTheDocument();
    expect(screen.getByText('Bantuan & FAQ')).toBeInTheDocument();
  });

  it('menampilkan copyright tahun sesuai tahun sekarang', () => {
    renderFooter();
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument();
    expect(screen.getAllByText(/DEKAT/).length).toBeGreaterThan(0);
  });
});
