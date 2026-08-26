import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ServiceCard from '../ServiceCard';
import type { Service } from '../../lib/types';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual };
});

const baseService: Service = {
  id: 'svc-1',
  providerId: 'prov-1',
  name: 'Potong Rambut',
  description: 'Potong rambut pria dengan style modern',
  duration: 30,
  price: 50000,
  priceType: 'FIXED',
  depositAmount: 0,
  category: 'Barbershop',
  addons: [],
  imageUrl: '',
};

function renderCard(service = baseService, providerSlug = 'barbershop-central', providerId?: string) {
  return render(
    <MemoryRouter>
      <ServiceCard service={service} providerSlug={providerSlug} providerId={providerId} />
    </MemoryRouter>
  );
}

describe('ServiceCard', () => {
  it('render nama layanan dan deskripsi', () => {
    renderCard();
    expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    expect(screen.getByText('Potong rambut pria dengan style modern')).toBeInTheDocument();
  });

  it('menampilkan durasi dalam format menit', () => {
    renderCard();
    expect(screen.getByText('30 menit')).toBeInTheDocument();
  });

  it('menampilkan durasi dalam format jam jika >= 60 menit', () => {
    renderCard({ ...baseService, duration: 120 });
    expect(screen.getByText('2 jam')).toBeInTheDocument();
  });

  it('menampilkan durasi jam dan menit jika tidak bulat', () => {
    renderCard({ ...baseService, duration: 90 });
    expect(screen.getByText('1j 30m')).toBeInTheDocument();
  });

  it('menampilkan harga untuk priceType FIXED', () => {
    renderCard();
    expect(screen.getByText(/Rp\s*50\.000/)).toBeInTheDocument();
  });

  it('menampilkan label Mulai untuk STARTING_FROM', () => {
    renderCard({ ...baseService, priceType: 'STARTING_FROM' });
    expect(screen.getByText('Mulai')).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*50\.000/)).toBeInTheDocument();
  });

  it('menampilkan / jam untuk HOURLY', () => {
    renderCard({ ...baseService, priceType: 'HOURLY' });
    expect(screen.getByText('/ jam')).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*50\.000/)).toBeInTheDocument();
  });

  it('menampilkan Harga untuk QUOTE_REQUIRED tanpa harga', () => {
    renderCard({ ...baseService, priceType: 'QUOTE_REQUIRED', price: 0 });
    expect(screen.getByText('Harga')).toBeInTheDocument();
    expect(screen.queryByText('Rp0')).not.toBeInTheDocument();
  });

  it('menampilkan deposit jika > 0', () => {
    renderCard({ ...baseService, depositAmount: 25000 });
    expect(screen.getByText(/Deposit/)).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*25\.000/)).toBeInTheDocument();
  });

  it('tidak menampilkan deposit jika 0', () => {
    renderCard();
    expect(screen.queryByText(/Deposit/)).not.toBeInTheDocument();
  });

  it('link mengarah ke booking jika providerId ada', () => {
    renderCard(baseService, 'barbershop-central', 'prov-1');
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/booking/prov-1?service=svc-1');
  });

  it('link mengarah ke search jika providerId tidak ada', () => {
    renderCard();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/search');
  });
});
