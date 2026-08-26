import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProviderCard from '../ProviderCard';
import type { Provider } from '../../lib/types';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual };
});

const baseProvider: Provider = {
  id: 'prov-1',
  name: 'Barbershop Central',
  slug: 'barbershop-central',
  description: 'Barbershop terbaik di Jakarta',
  logoUrl: '',
  coverUrl: '',
  category: 'Barbershop',
  categorySlug: 'barbershop',
  rating: 4.5,
  reviewCount: 120,
  location: 'Jakarta Selatan',
  address: 'Jl. Sudirman No. 123',
  latitude: -6.2,
  longitude: 106.8,
  phone: '081234567890',
  openingHours: [],
  verificationStatus: 'APPROVED',
};

function renderCard(provider = baseProvider) {
  return render(
    <MemoryRouter>
      <ProviderCard provider={provider} />
    </MemoryRouter>
  );
}

describe('ProviderCard', () => {
  it('render nama provider dan kategori', () => {
    renderCard();
    expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    expect(screen.getByText('Barbershop')).toBeInTheDocument();
  });

  it('menampilkan deskripsi provider', () => {
    renderCard();
    expect(screen.getByText('Barbershop terbaik di Jakarta')).toBeInTheDocument();
  });

  it('menampilkan rating jika > 0', () => {
    renderCard();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('tidak menampilkan rating jika 0', () => {
    renderCard({ ...baseProvider, rating: 0 });
    expect(screen.queryByText('0.0')).not.toBeInTheDocument();
  });

  it('menampilkan jumlah ulasan', () => {
    renderCard();
    expect(screen.getByText('120 ulasan')).toBeInTheDocument();
  });

  it('tidak menampilkan jumlah ulasan jika 0', () => {
    renderCard({ ...baseProvider, reviewCount: 0 });
    expect(screen.queryByText(/ulasan/)).not.toBeInTheDocument();
  });

  it('menampilkan cover image jika coverUrl tersedia', () => {
    renderCard({ ...baseProvider, coverUrl: 'https://example.com/cover.jpg' });
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg');
    expect(img).toHaveAttribute('alt', 'Barbershop Central');
  });

  it('menampilkan inisial jika coverUrl kosong', () => {
    renderCard();
    expect(screen.getByText('BC')).toBeInTheDocument();
  });

  it('menampilkan lokasi provider', () => {
    renderCard();
    expect(screen.getByText('Jakarta Selatan')).toBeInTheDocument();
  });

  it('link mengarah ke halaman provider berdasarkan slug', () => {
    renderCard();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/provider/barbershop-central');
  });
});
