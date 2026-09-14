import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CommissionPage from '../CommissionPage';

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' }, logout: vi.fn() }),
}));

vi.mock('../../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="provider-layout">{children}</div>,
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function renderCommission() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <CommissionPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('CommissionPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders heading', async () => {
    mockFetch.mockResolvedValue({ json: () => ({ data: { totalRevenue: 0, totalCommission: 0, netPayout: 0, breakdown: [] } }) });
    renderCommission();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /komisi platform/i })).toBeInTheDocument();
    });
  });

  it('renders ProviderLayout', async () => {
    mockFetch.mockResolvedValue({ json: () => ({ data: { totalRevenue: 0, totalCommission: 0, netPayout: 0, breakdown: [] } }) });
    renderCommission();
    await waitFor(() => {
      expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
    });
  });

  it('shows commission stats when data loads', async () => {
    mockFetch.mockResolvedValue({
      json: () => ({
        data: {
          totalRevenue: 1000000,
          totalCommission: 50000,
          netPayout: 950000,
          breakdown: [],
        },
      }),
    });
    renderCommission();
    await waitFor(() => {
      expect(screen.getByText(/Rp\s*1\.000\.000/)).toBeInTheDocument();
      expect(screen.getByText(/Rp\s*50\.000/)).toBeInTheDocument();
      expect(screen.getByText(/Rp\s*950\.000/)).toBeInTheDocument();
    });
  });

  it('shows empty breakdown message', async () => {
    mockFetch.mockResolvedValue({
      json: () => ({ data: { totalRevenue: 0, totalCommission: 0, netPayout: 0, breakdown: [] } }),
    });
    renderCommission();
    await waitFor(() => {
      expect(screen.getByText('Belum ada data')).toBeInTheDocument();
    });
  });
});
