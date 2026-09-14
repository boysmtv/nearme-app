import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/api', () => ({
  publicApi: {
    providers: { getBySlug: vi.fn() },
    services: { listByProvider: vi.fn() },
    staff: { listByProvider: vi.fn() },
    reviews: { listByProvider: vi.fn(), create: vi.fn(), report: vi.fn() },
    media: { publicProviderGallery: vi.fn() },
    favorites: { add: vi.fn(), remove: vi.fn() },
  },
  mediaApi: { upload: vi.fn() },
}));

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
  }),
}));

vi.mock('../../components/Header', () => ({
  default: () => <header data-testid="header">Header</header>,
}));

vi.mock('../../components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('../../components/ServiceCard', () => ({
  default: ({ service }: any) => <div data-testid="service-card">{service?.name}</div>,
}));

import ProviderPage from '../ProviderPage';
import { publicApi } from '../../lib/api';

const providerData = {
  id: 'p1',
  name: 'Barbershop Central',
  slug: 'barbershop-central',
  category: 'Barbershop',
  rating: 4.5,
  reviewCount: 12,
  description: 'Best barbershop in town',
  location: 'Jakarta Selatan',
  logoUrl: '',
  coverUrl: '',
  openingHours: [
    { dayOfWeek: 1, open: '09:00', close: '18:00', isClosed: false },
    { dayOfWeek: 2, open: '09:00', close: '18:00', isClosed: false },
    { dayOfWeek: 6, open: '10:00', close: '16:00', isClosed: false },
    { dayOfWeek: 0, open: '', close: '', isClosed: true },
  ],
};

const servicesData = [
  { id: 's1', name: 'Potong Rambut', price: 50000, duration: 30 },
  { id: 's2', name: 'Hair Coloring', price: 150000, duration: 90 },
];

const staffData = [
  {
    id: 'st1',
    name: 'Andi',
    avatarUrl: '',
    rating: 4.8,
    title: 'Senior Barber',
    bio: 'Pengalaman 5 tahun',
    specialties: ['Potong Rambut', 'Fade'],
    portfolio: [{ id: 'p1', url: 'http://example.com/p1.jpg', fileName: 'portfolio1.jpg' }],
  },
  {
    id: 'st2',
    name: 'Rudi',
    avatarUrl: 'http://example.com/avatar.jpg',
    rating: 4.2,
    title: 'Junior Barber',
    bio: 'Baru bergabung',
    specialties: [],
    portfolio: [],
  },
];

const reviewsData = [
  {
    id: 'r1',
    customerName: 'Budi',
    customerAvatar: '',
    rating: 5,
    title: 'Sangat puas',
    comment: 'Pelayanan terbaik',
    body: 'Pelayanan terbaik',
    serviceName: 'Potong Rambut',
    createdAt: '2026-09-10T10:00:00+07:00',
    verifiedBooking: true,
    photos: [{ id: 'ph1', url: 'http://example.com/ph1.jpg', fileName: 'photo1.jpg' }],
  },
];

const galleryData = [
  { id: 'g1', url: 'http://example.com/g1.jpg', fileName: 'gallery1.jpg' },
  { id: 'g2', url: 'http://example.com/g2.jpg', fileName: 'gallery2.jpg' },
];

function renderProvider(slug = 'barbershop-central') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <MemoryRouter initialEntries={[`/provider/${slug}`]}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/provider/:slug" element={<ProviderPage />} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('ProviderPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (publicApi.providers.getBySlug as any).mockResolvedValue({ data: providerData });
    (publicApi.services.listByProvider as any).mockResolvedValue({ data: servicesData });
    (publicApi.staff.listByProvider as any).mockResolvedValue({ data: staffData });
    (publicApi.reviews.listByProvider as any).mockResolvedValue({ data: { data: reviewsData } });
    (publicApi.media.publicProviderGallery as any).mockResolvedValue({ data: galleryData });
    (publicApi.reviews.report as any).mockResolvedValue({ data: true });
    (publicApi.reviews.create as any).mockResolvedValue({ data: true });
    (publicApi.favorites.add as any).mockResolvedValue({ data: true });
    (publicApi.favorites.remove as any).mockResolvedValue({ data: true });
  });

  it('shows loading skeleton initially', () => {
    (publicApi.providers.getBySlug as any).mockReturnValue(new Promise(() => {}));
    renderProvider();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders provider name and category', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    expect(screen.getByText('Barbershop')).toBeInTheDocument();
  });

  it('shows not found when provider is null', async () => {
    (publicApi.providers.getBySlug as any).mockResolvedValue({ data: null });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Provider tidak ditemukan')).toBeInTheDocument();
    });
  });

  it('renders header and footer', async () => {
    renderProvider();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('shows tabs for services, staff, reviews', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    expect(screen.getByText(/Layanan/)).toBeInTheDocument();
    expect(screen.getByText(/Staf/)).toBeInTheDocument();
    expect(screen.getByText(/Ulasan/)).toBeInTheDocument();
  });

  it('shows Booking Sekarang button', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Booking Sekarang')).toBeInTheDocument();
    });
  });

  it('renders description section', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Best barbershop in town')).toBeInTheDocument();
    });
  });

  it('renders gallery section with photos', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('2 foto dalam galeri')).toBeInTheDocument();
    });
    const galleryImages = document.querySelectorAll('img[alt="gallery1.jpg"]');
    expect(galleryImages.length).toBe(1);
  });

  it('shows empty gallery message when no photos', async () => {
    (publicApi.media.publicProviderGallery as any).mockResolvedValue({ data: [] });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText(/Belum ada foto galeri/)).toBeInTheDocument();
    });
  });

  it('renders opening hours', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Jam Operasional')).toBeInTheDocument();
    });
    expect(screen.getByText('Senin')).toBeInTheDocument();
    expect(screen.getAllByText('09:00 - 18:00').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Minggu')).toBeInTheDocument();
    expect(screen.getByText('Tutup')).toBeInTheDocument();
  });

  it('shows services in services tab', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getAllByTestId('service-card').length).toBeGreaterThanOrEqual(1);
    });
    const serviceCards = screen.getAllByTestId('service-card');
    expect(serviceCards.length).toBe(2);
    expect(serviceCards[0]).toHaveTextContent('Potong Rambut');
    expect(serviceCards[1]).toHaveTextContent('Hair Coloring');
  });

  it('shows empty services message when no services', async () => {
    (publicApi.services.listByProvider as any).mockResolvedValue({ data: [] });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    expect(screen.getByText('Belum ada layanan tersedia')).toBeInTheDocument();
  });

  it('switches to staff tab and displays staff', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Staf/));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
      expect(screen.getByText('Rudi')).toBeInTheDocument();
    });
    expect(screen.getByText('Senior Barber')).toBeInTheDocument();
    expect(screen.getByText('Junior Barber')).toBeInTheDocument();
    expect(screen.getByText('Pengalaman 5 tahun')).toBeInTheDocument();
    expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    expect(screen.getByText('Fade')).toBeInTheDocument();
  });

  it('shows empty staff message when no staff', async () => {
    (publicApi.staff.listByProvider as any).mockResolvedValue({ data: [] });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Staf/));
    await waitFor(() => {
      expect(screen.getByText('Belum ada staf terdaftar')).toBeInTheDocument();
    });
  });

  it('switches to reviews tab and displays reviews', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('Budi')).toBeInTheDocument();
      expect(screen.getByText('Sangat puas')).toBeInTheDocument();
      expect(screen.getByText('Pelayanan terbaik')).toBeInTheDocument();
      expect(screen.getByText('✓ Verified booking')).toBeInTheDocument();
    });
  });

  it('shows empty reviews message when no reviews', async () => {
    (publicApi.reviews.listByProvider as any).mockResolvedValue({ data: { data: [] } });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('Belum ada ulasan')).toBeInTheDocument();
    });
  });

  it('displays staff portfolio images', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Staf/));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    const portfolioImages = document.querySelectorAll('img[alt="portfolio1.jpg"]');
    expect(portfolioImages.length).toBe(1);
  });

  it('displays staff with no portfolio', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Staf/));
    await waitFor(() => {
      expect(screen.getByText('Rudi')).toBeInTheDocument();
    });
    expect(screen.getByText('Belum ada portfolio')).toBeInTheDocument();
  });

  it('displays staff with avatar', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Staf/));
    await waitFor(() => {
      expect(screen.getByText('Rudi')).toBeInTheDocument();
    });
    const avatar = document.querySelector('img[alt="Rudi"]');
    expect(avatar).toBeInTheDocument();
  });

  it('shows review photos', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('Budi')).toBeInTheDocument();
    });
    const reviewPhotos = document.querySelectorAll('img[alt="photo1.jpg"]');
    expect(reviewPhotos.length).toBe(1);
  });

  it('shows review form not authenticated message', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText(/Masuk untuk menulis ulasan/)).toBeInTheDocument();
    });
  });

  it('shows rating count in tab labels', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getAllByText(/Layanan/).length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getAllByText(/Staf/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Ulasan/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders provider logo initial when no logo', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    expect(screen.getByText('BA')).toBeInTheDocument();
  });

  it('renders provider rating', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(12 ulasan)')).toBeInTheDocument();
  });
});
