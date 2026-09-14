import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettlementPage from '../SettlementPage';

vi.mock('../../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="provider-layout">{children}</div>,
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <SettlementPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

const settlementsData = [
  { id: 's1', period: 'Sep 2026', totalRevenue: 5000000, commission: 250000, netPayout: 4750000, status: 'PAID', paidAt: '2026-09-10T00:00:00+07:00' },
  { id: 's2', period: 'Aug 2026', totalRevenue: 3000000, commission: 150000, netPayout: 2850000, status: 'PENDING', paidAt: null },
  { id: 's3', period: 'Jul 2026', totalRevenue: 4000000, commission: 200000, netPayout: 3800000, status: 'PROCESSING', paidAt: null },
];

function wrapJson(data) {
  return { json: () => ({ data }) };
}

describe('SettlementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation(() => Promise.resolve(wrapJson(settlementsData)));
  });

  it('renders heading', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /settlement/i })).toBeInTheDocument();
    expect(screen.getByText(/pembayaran dan pencairan dana/i)).toBeInTheDocument();
  });

  it('renders ProviderLayout', async () => {
    renderPage();
    expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
  });

  it('shows empty state when no settlements', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(wrapJson([])));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/belum ada settlement/i)).toBeInTheDocument();
    });
  });

  it('shows Request Payout button', async () => {
    renderPage();
    expect(screen.getByRole('button', { name: /request payout/i })).toBeInTheDocument();
  });

  it('renders settlement data with period', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Sep 2026')).toBeInTheDocument();
    });
    expect(screen.getByText('Aug 2026')).toBeInTheDocument();
    expect(screen.getByText('Jul 2026')).toBeInTheDocument();
  });

  it('renders revenue amounts', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Sep 2026')).toBeInTheDocument();
    });
    expect(screen.getByText('Rp 5.000.000')).toBeInTheDocument();
    expect(screen.getByText('Rp 3.000.000')).toBeInTheDocument();
  });

  it('renders commission amounts', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Sep 2026')).toBeInTheDocument();
    });
    expect(screen.getByText('Rp 250.000')).toBeInTheDocument();
    expect(screen.getByText('Rp 150.000')).toBeInTheDocument();
  });

  it('renders net payout amounts', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Sep 2026')).toBeInTheDocument();
    });
    expect(screen.getByText('Rp 4.750.000')).toBeInTheDocument();
    expect(screen.getByText('Rp 2.850.000')).toBeInTheDocument();
  });

  it('shows PAID status badge', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Sep 2026')).toBeInTheDocument();
    });
    expect(screen.getByText('Dibayar')).toBeInTheDocument();
  });

  it('shows PENDING status badge', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Aug 2026')).toBeInTheDocument();
    });
    expect(screen.getByText('Menunggu')).toBeInTheDocument();
  });

  it('shows PROCESSING status badge', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Jul 2026')).toBeInTheDocument();
    });
    expect(screen.getByText('PROCESSING')).toBeInTheDocument();
  });

  it('shows paid date for paid settlements', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Sep 2026')).toBeInTheDocument();
    });
    expect(screen.getByText('10/9/2026')).toBeInTheDocument();
  });

  it('opens request payout form', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /request payout/i }));
    await waitFor(() => {
      expect(screen.getByText('Request Pencairan Dana')).toBeInTheDocument();
      expect(screen.getByText('Jumlah (IDR)')).toBeInTheDocument();
    });
  });

  it('closes request payout form when Batal is clicked', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /request payout/i }));
    await waitFor(() => {
      expect(screen.getByText('Request Pencairan Dana')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Batal'));
    await waitFor(() => {
      expect(screen.queryByText('Request Pencairan Dana')).not.toBeInTheDocument();
    });
  });

  it('shows table headers', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Periode')).toBeInTheDocument();
    });
    expect(screen.getByText('Pendapatan')).toBeInTheDocument();
    expect(screen.getByText('Komisi')).toBeInTheDocument();
    expect(screen.getByText('Net Payout')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Tanggal Bayar')).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Memuat...')).toBeInTheDocument();
    });
  });

  it('submits payout request with amount', async () => {
    mockFetch.mockImplementationOnce(() => Promise.resolve(wrapJson(settlementsData)));
    mockFetch.mockImplementationOnce(() => Promise.resolve(wrapJson({ id: 'p1' })));
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /request payout/i }));
    await waitFor(() => {
      expect(screen.getByText('Request Pencairan Dana')).toBeInTheDocument();
    });
    const amountInput = screen.getByPlaceholderText('Masukkan jumlah');
    await userEvent.type(amountInput, '1000000');
    await userEvent.click(screen.getByRole('button', { name: /ajukan/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});
