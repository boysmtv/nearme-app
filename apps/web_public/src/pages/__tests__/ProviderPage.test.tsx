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

const mockUseAuth = vi.fn(() => ({
  user: null,
  isAuthenticated: false,
}));

vi.mock('../../lib/auth', () => ({
  useAuth: (...args: any[]) => mockUseAuth(...args),
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
import { publicApi, mediaApi } from '../../lib/api';

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
    (mediaApi.upload as any).mockResolvedValue({ data: { id: 'up1' } });
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
      expect(screen.getByText('Masuk untuk menulis ulasan setelah booking selesai.')).toBeInTheDocument();
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

  it('hides rating when provider.rating is 0', async () => {
    (publicApi.providers.getBySlug as any).mockResolvedValue({ data: { ...providerData, rating: 0, reviewCount: 0 } });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    expect(screen.queryByText('(0 ulasan)')).not.toBeInTheDocument();
  });

  it('shows cover image when coverUrl exists', async () => {
    (publicApi.providers.getBySlug as any).mockResolvedValue({ data: { ...providerData, coverUrl: 'http://example.com/cover.jpg' } });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    const coverImg = document.querySelector('img[alt="Barbershop Central"]');
    expect(coverImg).toBeInTheDocument();
  });

  it('shows logo image when logoUrl exists', async () => {
    (publicApi.providers.getBySlug as any).mockResolvedValue({ data: { ...providerData, logoUrl: 'http://example.com/logo.jpg' } });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    const logoImg = document.querySelector('img[alt="Barbershop Central"]');
    expect(logoImg).toBeInTheDocument();
  });

  it('shows provider location fallback to address', async () => {
    (publicApi.providers.getBySlug as any).mockResolvedValue({ data: { ...providerData, location: '', address: 'Jl. Test No. 1' } });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Jl. Test No. 1')).toBeInTheDocument();
    });
  });

  it('shows provider address when location is undefined', async () => {
    const dataWithoutLocation = { ...providerData };
    delete (dataWithoutLocation as any).location;
    (publicApi.providers.getBySlug as any).mockResolvedValue({ data: { ...dataWithoutLocation, address: 'Jl. Addr No. 2' } });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Jl. Addr No. 2')).toBeInTheDocument();
    });
  });

  it('renders staff with more than 5 portfolio items', async () => {
    const manyPortfolioStaff = [{
      ...staffData[0],
      portfolio: Array.from({ length: 7 }, (_, i) => ({ id: `p${i}`, url: `http://example.com/p${i}.jpg`, fileName: `portfolio${i}.jpg` })),
    }];
    (publicApi.staff.listByProvider as any).mockResolvedValue({ data: manyPortfolioStaff });
    renderProvider();
    await waitFor(() => { expect(screen.getByText('Barbershop Central')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText(/Staf/));
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('renders staff with title undefined', async () => {
    const staffNoTitle = [{ ...staffData[0], title: undefined }, staffData[1]];
    (publicApi.staff.listByProvider as any).mockResolvedValue({ data: staffNoTitle });
    renderProvider();
    await waitFor(() => { expect(screen.getByText('Barbershop Central')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText(/Staf/));
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    expect(screen.getAllByText(/Staf/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows review date formatting', async () => {
    renderProvider();
    await waitFor(() => { expect(screen.getByText('Barbershop Central')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => { expect(screen.getByText('Budi')).toBeInTheDocument(); });
    expect(screen.getByText('10/9/2026')).toBeInTheDocument();
  });

  it('shows review without photos', async () => {
    const reviewNoPhotos = [{ ...reviewsData[0], photos: [] }];
    (publicApi.reviews.listByProvider as any).mockResolvedValue({ data: { data: reviewNoPhotos } });
    renderProvider();
    await waitFor(() => { expect(screen.getByText('Barbershop Central')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => { expect(screen.getByText('Budi')).toBeInTheDocument(); });
  });

  it('shows review without verified booking', async () => {
    const reviewUnverified = [{ ...reviewsData[0], verifiedBooking: false }];
    (publicApi.reviews.listByProvider as any).mockResolvedValue({ data: { data: reviewUnverified } });
    renderProvider();
    await waitFor(() => { expect(screen.getByText('Barbershop Central')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => { expect(screen.getByText('Budi')).toBeInTheDocument(); });
    expect(screen.queryByText('✓ Verified booking')).not.toBeInTheDocument();
  });

  it('shows review without title', async () => {
    const reviewNoTitle = [{ ...reviewsData[0], title: '' }];
    (publicApi.reviews.listByProvider as any).mockResolvedValue({ data: { data: reviewNoTitle } });
    renderProvider();
    await waitFor(() => { expect(screen.getByText('Barbershop Central')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => { expect(screen.getByText('Budi')).toBeInTheDocument(); });
  });

  it('shows review with no avatar (initial)', async () => {
    const reviewNoAvatar = [{ ...reviewsData[0], customerAvatar: '' }];
    (publicApi.reviews.listByProvider as any).mockResolvedValue({ data: { data: reviewNoAvatar } });
    renderProvider();
    await waitFor(() => { expect(screen.getByText('Barbershop Central')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => { expect(screen.getByText('B')).toBeInTheDocument(); });
  });

  it('shows review with null customerName', async () => {
    const reviewNullName = [{ ...reviewsData[0], customerName: null }];
    (publicApi.reviews.listByProvider as any).mockResolvedValue({ data: { data: reviewNullName } });
    renderProvider();
    await waitFor(() => { expect(screen.getByText('Barbershop Central')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => { expect(screen.getByText('?')).toBeInTheDocument(); });
  });

  it('shows review with no createdAt', async () => {
    const reviewNoDate = [{ ...reviewsData[0], createdAt: '' }];
    (publicApi.reviews.listByProvider as any).mockResolvedValue({ data: { data: reviewNoDate } });
    renderProvider();
    await waitFor(() => { expect(screen.getByText('Barbershop Central')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => { expect(screen.getByText('Budi')).toBeInTheDocument(); });
  });

  it('toggles favorite on staff member', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'User', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
    });
    renderProvider();
    await waitFor(() => { expect(screen.getByText('Barbershop Central')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText(/Staf/));
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    const favButtons = screen.getAllByLabelText('Favorite');
    await userEvent.click(favButtons[0]);
    await waitFor(() => {
      expect(publicApi.favorites.add).toHaveBeenCalled();
    });
  });

  it('shows report success message', async () => {
    renderProvider();
    await waitFor(() => { expect(screen.getByText('Barbershop Central')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => { expect(screen.getByText('Budi')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText('Laporkan'));
    await waitFor(() => {
      expect(screen.getByText(/Laporan terkirim/)).toBeInTheDocument();
    });
  });

  it('shows report error message', async () => {
    (publicApi.reviews.report as any).mockRejectedValue(new Error('Report failed'));
    renderProvider();
    await waitFor(() => { expect(screen.getByText('Barbershop Central')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => { expect(screen.getByText('Budi')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText('Laporkan'));
    await waitFor(() => {
      expect(screen.getByText('Report failed')).toBeInTheDocument();
    });
  });

  it('shows review comment via body field when comment is null', async () => {
    const reviewBodyOnly = [{ ...reviewsData[0], comment: null, body: 'Body content' }];
    (publicApi.reviews.listByProvider as any).mockResolvedValue({ data: { data: reviewBodyOnly } });
    renderProvider();
    await waitFor(() => { expect(screen.getByText('Barbershop Central')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => { expect(screen.getByText('Body content')).toBeInTheDocument(); });
  });

  it('shows review with empty comment and body', async () => {
    const reviewEmpty = [{ ...reviewsData[0], comment: null, body: null }];
    (publicApi.reviews.listByProvider as any).mockResolvedValue({ data: { data: reviewEmpty } });
    renderProvider();
    await waitFor(() => { expect(screen.getByText('Barbershop Central')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => { expect(screen.getByText('Budi')).toBeInTheDocument(); });
  });

  it('shows "not found" link back to search', async () => {
    (publicApi.providers.getBySlug as any).mockResolvedValue({ data: null });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Provider tidak ditemukan')).toBeInTheDocument();
    });
    expect(screen.getByText('Kembali ke pencarian')).toBeInTheDocument();
  });

  it('renders services with service cards', async () => {
    renderProvider();
    await waitFor(() => { expect(screen.getByText('Barbershop Central')).toBeInTheDocument(); });
    await waitFor(() => { expect(screen.getAllByTestId('service-card')).toHaveLength(2); });
  });

  it('handles gallery returning nested data', async () => {
    (publicApi.media.publicProviderGallery as any).mockResolvedValue({ data: galleryData });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('2 foto dalam galeri')).toBeInTheDocument();
    });
  });

  it('shows gallery section with grid layout', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('2 foto dalam galeri')).toBeInTheDocument();
    });
    const galleryImages = document.querySelectorAll('img[alt="gallery1.jpg"]');
    expect(galleryImages.length).toBe(1);
    const gallerySection = screen.getByText('Galeri').closest('div');
    expect(gallerySection).toBeInTheDocument();
  });

  it('shows "Belum ada foto galeri" when no gallery', async () => {
    (publicApi.media.publicProviderGallery as any).mockResolvedValue({ data: [] });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText(/Belum ada foto galeri/)).toBeInTheDocument();
    });
    expect(screen.getByText('0 foto dalam galeri')).toBeInTheDocument();
  });

  it('shows operating hours when available', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Jam Operasional')).toBeInTheDocument();
    });
    expect(screen.getByText('Senin')).toBeInTheDocument();
    expect(screen.getByText('Selasa')).toBeInTheDocument();
    expect(screen.getByText('Sabtu')).toBeInTheDocument();
  });

  it('shows "Tutup" for closed days', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Minggu')).toBeInTheDocument();
    });
    const tutupElements = screen.getAllByText('Tutup');
    expect(tutupElements.length).toBeGreaterThanOrEqual(1);
    expect(tutupElements[0]).toHaveClass('text-red-500');
  });

  it('switches to staff tab', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Staf/));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    const staffTab = screen.getByText(/Staf/);
    expect(staffTab.className).toContain('border-primary-500');
  });

  it('shows staff with avatar fallback initials', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Staf/));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    expect(screen.getByText('AN')).toBeInTheDocument();
  });

  it('shows staff with portfolio images', async () => {
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
    expect(portfolioImages[0]).toHaveClass('rounded-lg');
  });

  it('shows staff with "+N more" portfolio overflow', async () => {
    const manyPortfolioStaff = [{
      ...staffData[0],
      portfolio: Array.from({ length: 8 }, (_, i) => ({ id: `p${i}`, url: `http://example.com/p${i}.jpg`, fileName: `portfolio${i}.jpg` })),
    }];
    (publicApi.staff.listByProvider as any).mockResolvedValue({ data: manyPortfolioStaff });
    renderProvider();
    await waitFor(() => { expect(screen.getByText('Barbershop Central')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText(/Staf/));
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('switches to reviews tab', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    const reviewsTabBtn = screen.getAllByText(/Ulasan/).find(
      (el) => el.tagName === 'BUTTON',
    )!;
    await userEvent.click(reviewsTabBtn);
    await waitFor(() => {
      expect(screen.getByText('Budi')).toBeInTheDocument();
    });
    expect(reviewsTabBtn.className).toContain('border-primary-500');
  });

  it('shows review with photos in grid', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('Budi')).toBeInTheDocument();
    });
    const photoGrid = document.querySelector('.grid.grid-cols-4');
    expect(photoGrid).toBeInTheDocument();
    const reviewPhotos = document.querySelectorAll('img[alt="photo1.jpg"]');
    expect(reviewPhotos.length).toBe(1);
  });

  it('shows verified booking badge', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('✓ Verified booking')).toBeInTheDocument();
    });
    const badge = screen.getByText('✓ Verified booking');
    expect(badge).toHaveClass('bg-green-100');
  });

  it('shows review report button', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('Budi')).toBeInTheDocument();
    });
    const reportBtn = screen.getByText('Laporkan');
    expect(reportBtn).toBeInTheDocument();
    expect(reportBtn.tagName).toBe('BUTTON');
  });

  it('clicks report button → shows "Melaporkan..."', async () => {
    (publicApi.reviews.report as any).mockReturnValue(new Promise(() => {}));
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('Budi')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Laporkan'));
    await waitFor(() => {
      expect(screen.getByText('Melaporkan...')).toBeInTheDocument();
    });
  });

  it('ReviewForm validation: requires booking ID', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'User', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
    });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('Kirim Ulasan')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Kirim Ulasan'));
    await waitFor(() => {
      expect(screen.getByText(/Booking ID wajib diisi/)).toBeInTheDocument();
    });
  });

  it('ReviewForm validation: requires rating >= 1', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'User', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
    });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('Kirim Ulasan')).toBeInTheDocument();
    });
    const bookingInput = screen.getByPlaceholderText(/3fa85f64/);
    await userEvent.type(bookingInput, 'some-booking-id');
    await userEvent.click(screen.getByText('Kirim Ulasan'));
    await waitFor(() => {
      expect(screen.getByText(/Rating wajib diisi/)).toBeInTheDocument();
    });
  });

  it('ReviewForm validation: requires body', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'User', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
    });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('Kirim Ulasan')).toBeInTheDocument();
    });
    const bookingInput = screen.getByPlaceholderText(/3fa85f64/);
    await userEvent.type(bookingInput, 'some-booking-id');
    const rate5 = screen.getByLabelText('Rate 5');
    await userEvent.click(rate5);
    await userEvent.click(screen.getByText('Kirim Ulasan'));
    await waitFor(() => {
      expect(screen.getByText(/Komentar wajib diisi/)).toBeInTheDocument();
    });
  });

  it('shows upload photo section in ReviewForm', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'User', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
    });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('Foto Ulasan (maks 8)')).toBeInTheDocument();
    });
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
    expect(fileInput).toHaveAttribute('multiple');
  });

  it('toggles favorite on staff', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'User', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
    });
    renderProvider();
    await waitFor(() => { expect(screen.getByText('Barbershop Central')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText(/Staf/));
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    const favButton = screen.getAllByLabelText('Favorite')[0];
    expect(favButton).toHaveClass('bg-gray-100');
    await userEvent.click(favButton);
    await waitFor(() => {
      expect(publicApi.favorites.add).toHaveBeenCalledWith('st1');
    });
  });

  it('shows cover image when coverUrl exists', async () => {
    (publicApi.providers.getBySlug as any).mockResolvedValue({
      data: { ...providerData, coverUrl: 'http://example.com/cover.jpg' },
    });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    const coverImg = document.querySelector('img[alt="Barbershop Central"]');
    expect(coverImg).toBeInTheDocument();
    expect(coverImg).toHaveAttribute('src', 'http://example.com/cover.jpg');
    expect(coverImg).toHaveClass('object-cover');
  });

  it('shows logo fallback when no logoUrl', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    const logoFallback = screen.getByText('BA');
    expect(logoFallback).toBeInTheDocument();
    expect(logoFallback).toHaveClass('text-primary-600');
    const logoContainer = logoFallback.closest('div');
    expect(logoContainer).toHaveClass('bg-primary-100');
  });

  it('shows star rating component for provider', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    const stars = document.querySelectorAll('svg.text-yellow-400');
    expect(stars.length).toBeGreaterThanOrEqual(4);
    const emptyStars = document.querySelectorAll('svg.text-gray-200');
    expect(emptyStars.length).toBe(1);
  });

  it('shows staff rating when > 0', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Staf/));
    await waitFor(() => {
      expect(screen.getByText('4.8')).toBeInTheDocument();
    });
  });

  it('hides staff rating when 0', async () => {
    const staffWithZeroRating = [{ ...staffData[0], rating: 0 }, staffData[1]];
    (publicApi.staff.listByProvider as any).mockResolvedValue({ data: staffWithZeroRating });
    renderProvider();
    await waitFor(() => { expect(screen.getByText('Barbershop Central')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText(/Staf/));
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    expect(screen.queryByText('0.0')).not.toBeInTheDocument();
  });

  it('shows staff specialties as badges', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Staf/));
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    const specBadge = screen.getByText('Potong Rambut');
    expect(specBadge).toHaveClass('rounded-full');
    expect(specBadge).toHaveClass('bg-gray-100');
  });

  it('does not show favorite button when not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Staf/));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    expect(screen.queryByLabelText('Favorite')).not.toBeInTheDocument();
  });

  it('toggles favorite removes when already favorited', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'User', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
    });
    renderProvider();
    await waitFor(() => { expect(screen.getByText('Barbershop Central')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText(/Staf/));
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    const favButton = screen.getAllByLabelText('Favorite')[0];
    await userEvent.click(favButton);
    await waitFor(() => {
      expect(publicApi.favorites.add).toHaveBeenCalledWith('st1');
    });
    await userEvent.click(favButton);
    await waitFor(() => {
      expect(publicApi.favorites.remove).toHaveBeenCalledWith('st1');
    });
  });

  it('shows review form fields for authenticated user', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'User', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
    });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('Tulis Ulasan')).toBeInTheDocument();
    });
    expect(screen.getByText('Booking ID')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Judul')).toBeInTheDocument();
    expect(screen.getByText('Komentar')).toBeInTheDocument();
  });

  it('shows operating hours section with correct day names', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Jam Operasional')).toBeInTheDocument();
    });
    expect(screen.getByText('Senin')).toBeInTheDocument();
    expect(screen.getByText('Selasa')).toBeInTheDocument();
    expect(screen.getByText('Sabtu')).toBeInTheDocument();
    expect(screen.getByText('Minggu')).toBeInTheDocument();
  });

  it('shows operating hours times for open days', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Jam Operasional')).toBeInTheDocument();
    });
    const times = screen.getAllByText('09:00 - 18:00');
    expect(times.length).toBe(2);
    expect(screen.getByText('10:00 - 16:00')).toBeInTheDocument();
  });

  it('shows provider without openingHours gracefully', async () => {
    const providerNoHours = { ...providerData };
    delete (providerNoHours as any).openingHours;
    (publicApi.providers.getBySlug as any).mockResolvedValue({ data: providerNoHours });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    expect(screen.queryByText('Jam Operasional')).not.toBeInTheDocument();
  });

  it('shows provider with empty openingHours array', async () => {
    (publicApi.providers.getBySlug as any).mockResolvedValue({ data: { ...providerData, openingHours: [] } });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    expect(screen.queryByText('Jam Operasional')).not.toBeInTheDocument();
  });

  it('shows staff bio text', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Staf/));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    expect(screen.getByText('Pengalaman 5 tahun')).toBeInTheDocument();
    expect(screen.getByText('Baru bergabung')).toBeInTheDocument();
  });

  it('shows review serviceName', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
  });

  it('shows review star rating', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('Budi')).toBeInTheDocument();
    });
    const reviewStars = document.querySelectorAll('.rounded-xl svg.text-yellow-400');
    expect(reviewStars.length).toBeGreaterThanOrEqual(5);
  });

  it('shows ReviewForm description text', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'User', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
    });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText(/Ulasan memerlukan Booking ID/)).toBeInTheDocument();
    });
  });

  it('shows ReviewForm body character count', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'User', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
    });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('0/2000')).toBeInTheDocument();
    });
  });

  it('updates body character count on input', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'User', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
    });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('0/2000')).toBeInTheDocument();
    });
    const textarea = screen.getByPlaceholderText('Bagaimana pengalaman Anda?');
    await userEvent.type(textarea, 'Test review');
    expect(screen.getByText('11/2000')).toBeInTheDocument();
  });

  it('shows submit button text changes when pending', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'User', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
    });
    (publicApi.reviews.create as any).mockReturnValue(new Promise(() => {}));
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('Kirim Ulasan')).toBeInTheDocument();
    });
    const bookingInput = screen.getByPlaceholderText(/3fa85f64/);
    await userEvent.type(bookingInput, 'some-booking-id');
    const rate5 = screen.getByLabelText('Rate 5');
    await userEvent.click(rate5);
    const textarea = screen.getByPlaceholderText('Bagaimana pengalaman Anda?');
    await userEvent.type(textarea, 'Great service');
    await userEvent.click(screen.getByText('Kirim Ulasan'));
    await waitFor(() => {
      expect(screen.getByText('Mengirim...')).toBeInTheDocument();
    });
  });

  it('star hover highlights and title input updates', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'User', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
    });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByLabelText('Rate 3')).toBeInTheDocument();
    });
    fireEvent.mouseEnter(screen.getByLabelText('Rate 4'));
    fireEvent.mouseLeave(screen.getByLabelText('Rate 4'));
    const titleInput = screen.getByPlaceholderText('Ringkasan pengalaman Anda');
    fireEvent.change(titleInput, { target: { value: 'Judul bagus' } });
    expect(titleInput).toHaveValue('Judul bagus');
  });

  it('uploads review photo and shows count', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'User', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
    });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('Foto Ulasan (maks 8)')).toBeInTheDocument();
    });
    const bookingInput = screen.getByPlaceholderText(/3fa85f64/);
    await userEvent.type(bookingInput, 'bk-1');
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'foto.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(mediaApi.upload).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByText('1/8 foto terupload')).toBeInTheDocument();
    });
    expect(fileInput.value).toBe('');
  });

  it('rejects oversized photo with alert', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'User', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
    });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('Foto Ulasan (maks 8)')).toBeInTheDocument();
    });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const big = new File([new ArrayBuffer(11 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
    Object.defineProperty(big, 'size', { value: 11 * 1024 * 1024 });
    fireEvent.change(fileInput, { target: { files: [big] } });
    expect(alertSpy).toHaveBeenCalledWith('File too large max 10MB');
    expect(mediaApi.upload).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('shows uploading and upload error states', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'User', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
    });
    (mediaApi.upload as any).mockReturnValue(new Promise(() => {}));
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('Foto Ulasan (maks 8)')).toBeInTheDocument();
    });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [new File(['x'], 'a.jpg', { type: 'image/jpeg' })] } });
    await waitFor(() => {
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });
  });

  it('shows upload error message on failure', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'User', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
    });
    (mediaApi.upload as any).mockRejectedValue(new Error('upload gagal'));
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('Foto Ulasan (maks 8)')).toBeInTheDocument();
    });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [new File(['x'], 'a.jpg', { type: 'image/jpeg' })] } });
    await waitFor(() => {
      expect(screen.getByText('upload gagal')).toBeInTheDocument();
    });
  });

  it('shows success message after review submit', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'User', role: 'ROLE_CUSTOMER' },
      isAuthenticated: true,
    });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Ulasan/));
    await waitFor(() => {
      expect(screen.getByText('Kirim Ulasan')).toBeInTheDocument();
    });
    await userEvent.type(screen.getByPlaceholderText(/3fa85f64/), 'bk-9');
    await userEvent.click(screen.getByLabelText('Rate 5'));
    await userEvent.type(screen.getByPlaceholderText('Bagaimana pengalaman Anda?'), 'Luar biasa sekali');
    await userEvent.click(screen.getByText('Kirim Ulasan'));
    await waitFor(() => {
      expect(screen.getByText('Ulasan berhasil dikirim. Terima kasih!')).toBeInTheDocument();
    });
  });
});
