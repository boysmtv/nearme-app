import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CalendarPage from '../CalendarPage';

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

vi.mock('../../../lib/api', () => ({
  providerApi: {
    calendar: { getBookings: vi.fn() },
  },
}));

vi.mock('../../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="provider-layout">{children}</div>,
}));

import { providerApi } from '../../../lib/api';

const mockGetBookings = providerApi.calendar.getBookings as ReturnType<typeof vi.fn>;

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
}

function renderPage(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <CalendarPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const today = new Date();
const todayStr = today.toISOString().split('T')[0];

const bookings = [
  {
    id: 'b1',
    customerName: 'Siti',
    serviceName: 'Haircut',
    status: 'CONFIRMED',
    startsAt: `${todayStr}T10:00:00`,
  },
  {
    id: 'b2',
    customerName: 'Rina',
    serviceName: 'Hair Color',
    status: 'IN_PROGRESS',
    startsAt: `${todayStr}T14:00:00`,
  },
  {
    id: 'b3',
    customerName: 'Dian',
    serviceName: 'Shave',
    status: 'COMPLETED',
    startsAt: `${todayStr}T16:00:00`,
  },
];

describe('CalendarPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBookings.mockResolvedValue({ data: bookings });
  });

  it('renders heading and ProviderLayout', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /kalender/i })).toBeInTheDocument();
    expect(screen.getByText(/kelola jadwal booking/i)).toBeInTheDocument();
    expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    mockGetBookings.mockReturnValue(new Promise(() => {}));
    renderPage();
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders week/month view toggle buttons', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Minggu')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Minggu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bulan' })).toBeInTheDocument();
  });

  it('renders navigation buttons', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Minggu')).toBeInTheDocument();
    });
    const navButtons = screen.getAllByRole('button').filter((btn) => btn.querySelector('svg'));
    expect(navButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('shows current month and year', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Minggu')).toBeInTheDocument();
    });
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const monthText = `${monthNames[today.getMonth()]} ${today.getFullYear()}`;
    expect(screen.getByText(monthText)).toBeInTheDocument();
  });

  it('renders week view by default with time grid', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('07:00')).toBeInTheDocument();
    });
    expect(screen.getByText('Waktu')).toBeInTheDocument();
    expect(screen.getByText('08:00')).toBeInTheDocument();
    expect(screen.getByText('18:00')).toBeInTheDocument();
  });

  it('renders day abbreviations in week view', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Min')).toBeInTheDocument();
    });
    expect(screen.getByText('Sen')).toBeInTheDocument();
    expect(screen.getByText('Sel')).toBeInTheDocument();
    expect(screen.getByText('Rab')).toBeInTheDocument();
    expect(screen.getByText('Kam')).toBeInTheDocument();
    expect(screen.getByText('Jum')).toBeInTheDocument();
    expect(screen.getByText('Sab')).toBeInTheDocument();
  });

  it('displays bookings in week view', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Siti')).toBeInTheDocument();
    });
    expect(screen.getByText('Haircut')).toBeInTheDocument();
    expect(screen.getByText('Rina')).toBeInTheDocument();
    expect(screen.getByText('Hair Color')).toBeInTheDocument();
  });

  it('switches to month view when clicking Bulan button', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Minggu')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Bulan' }));
    await waitFor(() => {
      expect(screen.queryByText('Waktu')).not.toBeInTheDocument();
    });
  });

  it('switches back to week view when clicking Minggu button', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Minggu')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Bulan' }));
    await waitFor(() => {
      expect(screen.queryByText('Waktu')).not.toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Minggu' }));
    await waitFor(() => {
      expect(screen.getByText('Waktu')).toBeInTheDocument();
    });
  });

  it('navigates to next week', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Minggu')).toBeInTheDocument();
    });
    const navButtons = screen.getAllByRole('button').filter((btn) => btn.querySelector('svg'));
    await user.click(navButtons[navButtons.length - 1]);
    await waitFor(() => {
      expect(mockGetBookings).toHaveBeenCalledTimes(2);
    });
  });

  it('navigates to previous week', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Minggu')).toBeInTheDocument();
    });
    const navButtons = screen.getAllByRole('button').filter((btn) => btn.querySelector('svg'));
    await user.click(navButtons[0]);
    await waitFor(() => {
      expect(mockGetBookings).toHaveBeenCalledTimes(2);
    });
  });

  it('navigates months in month view', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Minggu')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Bulan' }));
    const initialCalls = mockGetBookings.mock.calls.length;
    const navButtons = screen.getAllByRole('button').filter((btn) => btn.querySelector('svg'));
    await user.click(navButtons[navButtons.length - 1]);
    await waitFor(() => {
      expect(mockGetBookings.mock.calls.length).toBeGreaterThan(initialCalls);
    });
  });

  it('displays status color classes on booking chips', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Siti')).toBeInTheDocument();
    });
    const bookingChips = document.querySelectorAll('[class*="border-green"]');
    expect(bookingChips.length).toBeGreaterThanOrEqual(1);
  });

  it('renders empty state when no bookings', async () => {
    mockGetBookings.mockResolvedValue({ data: [] });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Waktu')).toBeInTheDocument();
    });
    const emptyCells = document.querySelectorAll('.border-r.border-gray-50');
    expect(emptyCells.length).toBeGreaterThanOrEqual(1);
  });
});
