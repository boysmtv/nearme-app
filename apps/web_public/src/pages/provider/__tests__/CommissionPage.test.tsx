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

const mockGet = vi.fn();
vi.mock('../../../lib/api', () => ({
  api: { get: (...args: any[]) => mockGet(...args) },
}));

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
    mockGet.mockResolvedValue({ data: { totalRevenue: 0, totalCommission: 0, netPayout: 0, breakdown: [] } });
    renderCommission();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /komisi platform/i })).toBeInTheDocument();
    });
  });

  it('renders ProviderLayout', async () => {
    mockGet.mockResolvedValue({ data: { totalRevenue: 0, totalCommission: 0, netPayout: 0, breakdown: [] } });
    renderCommission();
    await waitFor(() => {
      expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
    });
  });

  it('shows commission stats when data loads', async () => {
    mockGet.mockResolvedValue({
      data: {
        totalRevenue: 1000000,
        totalCommission: 50000,
        netPayout: 950000,
        breakdown: [],
      },
    });
    renderCommission();
    await waitFor(() => {
      expect(screen.getByText(/Rp\s*1\.000\.000/)).toBeInTheDocument();
      expect(screen.getByText(/Rp\s*50\.000/)).toBeInTheDocument();
      expect(screen.getByText(/Rp\s*950\.000/)).toBeInTheDocument();
    });
  });

  it('shows empty breakdown message', async () => {
    mockGet.mockResolvedValue({ data: { totalRevenue: 0, totalCommission: 0, netPayout: 0, breakdown: [] } });
    renderCommission();
    await waitFor(() => {
      expect(screen.getByText('Belum ada data')).toBeInTheDocument();
    });
  });

  it('renders breakdown rows when data exists', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('commission/config')) return Promise.resolve({ data: { rate: 5 } });
      return Promise.resolve({
        data: {
          totalRevenue: 2000000,
          totalCommission: 100000,
          netPayout: 1900000,
          breakdown: [
            { date: '2026-09-10', revenue: 1000000, commission: 50000 },
            { date: '2026-09-11', revenue: 1000000, commission: 50000 },
          ],
        },
      });
    });
    renderCommission();
    await waitFor(() => {
      expect(screen.getByText(/Rp\s*2\.000\.000/)).toBeInTheDocument();
    });
    expect(screen.queryByText('Belum ada data')).not.toBeInTheDocument();
  });
});
