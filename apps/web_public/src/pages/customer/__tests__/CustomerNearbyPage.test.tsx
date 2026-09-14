import { render, screen, waitFor } from '@testing-library/react';
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
  default: () => <div data-testid="leaflet-map">Map</div>,
}));

import { publicApi } from '../../../lib/api';

function renderNearby() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <CustomerNearbyPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('CustomerNearbyPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders heading', async () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: { providers: [] } });
    renderNearby();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /provider terdekat/i })).toBeInTheDocument();
    });
  });

  it('renders CustomerLayout', async () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: { providers: [] } });
    renderNearby();
    await waitFor(() => {
      expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
    });
  });

  it('shows provider cards when data is available', async () => {
    (publicApi.providers.search as any).mockResolvedValue({
      data: {
        providers: [
          { id: '1', name: 'Barber Shop', slug: 'barber-shop', category: 'Barbershop', rating: 4.5, distance: 1.2 },
        ],
      },
    });
    renderNearby();
    await waitFor(() => {
      expect(screen.getByText('Barber Shop')).toBeInTheDocument();
    });
  });

  it('shows empty state when no providers found', async () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: { providers: [] } });
    renderNearby();
    await waitFor(() => {
      expect(screen.getByText(/tidak ada provider ditemukan/i)).toBeInTheDocument();
    });
  });

  it('renders radius filter buttons', async () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: { providers: [] } });
    renderNearby();
    await waitFor(() => {
      expect(screen.getByText('1 km')).toBeInTheDocument();
      expect(screen.getByText('5 km')).toBeInTheDocument();
      expect(screen.getByText('20 km')).toBeInTheDocument();
    });
  });
});
