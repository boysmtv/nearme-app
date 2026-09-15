import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerNearbyPage from '../CustomerNearbyPage';

vi.mock('../../../lib/api', () => ({
  publicApi: {
    providers: { search: vi.fn() },
  },
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Siti', role: 'ROLE_CUSTOMER' }, logout: vi.fn() }),
}));

vi.mock('../../../components/CustomerLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="customer-layout">{children}</div>,
}));

vi.mock('../../../components/LeafletMap', () => ({
  default: () => <div data-testid="leaflet-map" />,
}));

import { publicApi } from '../../../lib/api';

const mockProviders = [
  { id: '1', name: 'Barber Shop', slug: 'barber-shop', category: 'Barbershop', rating: 4.5, distance: 1.2, location: 'Jakarta Selatan' },
  { id: '2', name: 'Salon Cantik', slug: 'salon-cantik', category: 'Salon', rating: 4.8, distance: 2.5, location: 'Jakarta Pusat' },
  { id: '3', name: 'Spa Relax', slug: 'spa-relax', category: 'Spa', rating: 4.2, distance: 0.8, location: 'Jakarta Barat' },
];

function renderNearby() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <CustomerNearbyPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('CustomerNearbyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          success({ coords: { latitude: -6.2, longitude: 106.8, accuracy: 0, altitude: null, altitudeAccuracy: null, heading: null, speed: null }, timestamp: Date.now() } as GeolocationPosition);
        },
      },
      writable: true,
    });
  });

  it('renders page heading', async () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: { providers: [] } });
    renderNearby();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /provider terdekat/i })).toBeInTheDocument();
    });
  });

  it('shows radius buttons', async () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: { providers: [] } });
    renderNearby();
    await waitFor(() => {
      expect(screen.getByText('1 km')).toBeInTheDocument();
      expect(screen.getByText('3 km')).toBeInTheDocument();
      expect(screen.getByText('5 km')).toBeInTheDocument();
      expect(screen.getByText('10 km')).toBeInTheDocument();
      expect(screen.getByText('20 km')).toBeInTheDocument();
    });
  });

  it('default radius is 5km', async () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: { providers: [] } });
    renderNearby();
    await waitFor(() => {
      const btn5 = screen.getByText('5 km');
      expect(btn5.className).toContain('bg-primary-600');
    });
  });

  it('renders map when userLocation available', async () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: { providers: [] } });
    renderNearby();
    await waitFor(() => {
      expect(screen.getByTestId('leaflet-map')).toBeInTheDocument();
    });
  });

  it('shows provider cards when data loaded', async () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: { providers: mockProviders } });
    renderNearby();
    await waitFor(() => {
      expect(screen.getByText('Barber Shop')).toBeInTheDocument();
      expect(screen.getByText('Salon Cantik')).toBeInTheDocument();
      expect(screen.getByText('Spa Relax')).toBeInTheDocument();
    });
  });

  it('shows empty state when no providers', async () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: { providers: [] } });
    renderNearby();
    await waitFor(() => {
      expect(screen.getByText(/tidak ada provider ditemukan/i)).toBeInTheDocument();
    });
  });

  it('shows loading skeletons', async () => {
    (publicApi.providers.search as any).mockReturnValue(new Promise(() => {}));
    renderNearby();
    await waitFor(() => {
      expect(screen.getByText('Memuat...')).toBeInTheDocument();
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  it('changes radius on click', async () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: { providers: [] } });
    renderNearby();
    await waitFor(() => {
      expect(screen.getByText('5 km')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('10 km'));
    await waitFor(() => {
      expect(screen.getByText('10 km').className).toContain('bg-primary-600');
    });
  });

  it('shows sort buttons', async () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: { providers: [] } });
    renderNearby();
    await waitFor(() => {
      expect(screen.getByText('Jarak Terdekat')).toBeInTheDocument();
      expect(screen.getByText('Rating Tertinggi')).toBeInTheDocument();
    });
  });

  it('click rating sort re-sorts providers', async () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: { providers: mockProviders } });
    renderNearby();
    await waitFor(() => {
      expect(screen.getByText('Barber Shop')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Rating Tertinggi'));
    await waitFor(() => {
      const cards = screen.getAllByText(/Barber Shop|Salon Cantik|Spa Relax/);
      const names = cards.map((el) => el.textContent);
      const salonIdx = names.findIndex((n) => n === 'Salon Cantik');
      const barberIdx = names.findIndex((n) => n === 'Barber Shop');
      expect(salonIdx).toBeLessThan(barberIdx);
    });
  });

  it('shows provider name, rating, category', async () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: { providers: [mockProviders[0]] } });
    renderNearby();
    await waitFor(() => {
      expect(screen.getByText('Barber Shop')).toBeInTheDocument();
      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('Barbershop')).toBeInTheDocument();
    });
  });

  it('shows distance when available', async () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: { providers: [mockProviders[0]] } });
    renderNearby();
    await waitFor(() => {
      expect(screen.getByText('1.2 km')).toBeInTheDocument();
    });
  });

  it('shows Cari Manual link in empty state', async () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: { providers: [] } });
    renderNearby();
    await waitFor(() => {
      const link = screen.getByText('Cari Manual').closest('a');
      expect(link).toHaveAttribute('href', '/search');
    });
  });

  it('shows Perbesar Radius button in empty state', async () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: { providers: [] } });
    renderNearby();
    await waitFor(() => {
      expect(screen.getByText('Perbesar Radius')).toBeInTheDocument();
    });
  });

  it('shows provider count', async () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: { providers: mockProviders } });
    renderNearby();
    await waitFor(() => {
      expect(screen.getByText('3 provider ditemukan')).toBeInTheDocument();
    });
  });
});
