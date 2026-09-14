import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BookingsPage from '../BookingsPage';

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

vi.mock('../../../lib/api', () => ({
  providerApi: {
    bookings: {
      list: vi.fn(),
      getById: vi.fn(),
      updateStatus: vi.fn(),
    },
  },
}));

vi.mock('../../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="provider-layout">{children}</div>,
}));

import { providerApi } from '../../../lib/api';

const mockList = providerApi.bookings.list as ReturnType<typeof vi.fn>;
const mockGetById = providerApi.bookings.getById as ReturnType<typeof vi.fn>;
const mockUpdateStatus = providerApi.bookings.updateStatus as ReturnType<typeof vi.fn>;

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
}

function renderPage(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <BookingsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const bookings = [
  { id: 'b1', bookingCode: 'DKT-001', customerName: 'Siti', serviceName: 'Haircut', staffName: 'Andi', status: 'CONFIRMED', totalAmount: 50000, slotTime: '2026-09-15T10:00:00+07:00' },
  { id: 'b2', bookingCode: 'DKT-002', customerName: 'Rina', serviceName: 'Hair Color', staffName: 'Rudi', status: 'PENDING_PAYMENT', totalAmount: 120000, slotTime: '2026-09-15T14:00:00+07:00' },
  { id: 'b3', bookingCode: 'DKT-003', customerName: 'Dian', serviceName: 'Shave', staffName: 'Andi', status: 'COMPLETED', totalAmount: 30000, slotTime: '2026-09-14T09:00:00+07:00' },
  { id: 'b4', bookingCode: 'DKT-004', customerName: 'Eka', serviceName: 'Manicure', staffName: 'Rudi', status: 'CANCELLED', totalAmount: 45000, slotTime: '2026-09-13T11:00:00+07:00' },
];

const paginatedResponse = {
  data: {
    data: bookings,
    pagination: { totalPages: 2, page: 1, limit: 20, total: 35 },
  },
};

describe('BookingsPage (provider)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockList.mockResolvedValue(paginatedResponse);
  });

  it('renders heading and ProviderLayout', async () => {
    renderPage();
    expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /booking/i })).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    mockList.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
  });

  it('renders booking table with all columns', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('DKT-001')).toBeInTheDocument();
    });
    expect(screen.getByText('Kode')).toBeInTheDocument();
    expect(screen.getByText('Pelanggan')).toBeInTheDocument();
    expect(screen.getByText('Layanan')).toBeInTheDocument();
    expect(screen.getByText('Staf')).toBeInTheDocument();
    expect(screen.getByText('Waktu')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders all booking rows with correct data', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('DKT-001')).toBeInTheDocument();
    });
    expect(screen.getByText('Siti')).toBeInTheDocument();
    expect(screen.getByText('Haircut')).toBeInTheDocument();
    expect(screen.getAllByText('Andi').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Rp50.000')).toBeInTheDocument();
    expect(screen.getByText('Rina')).toBeInTheDocument();
    expect(screen.getByText('Hair Color')).toBeInTheDocument();
    expect(screen.getByText('Rp120.000')).toBeInTheDocument();
  });

  it('displays status badges with correct styles', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('DKT-001')).toBeInTheDocument();
    });
    expect(screen.getAllByText('CONFIRMED').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('PENDING_PAYMENT')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('CANCELLED')).toBeInTheDocument();
  });

  it('shows empty state when no bookings', async () => {
    mockList.mockResolvedValue({ data: { data: [], pagination: { totalPages: 1 } } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Tidak ada booking')).toBeInTheDocument();
    });
  });

  it('opens detail modal when clicking Detail button', async () => {
    const user = userEvent.setup();
    mockGetById.mockResolvedValue({
      data: {
        ...bookings[0],
        customerPhone: '081234567890',
        depositAmount: 10000,
        confirmationPin: '123456',
      },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('DKT-001')).toBeInTheDocument();
    });
    const detailButtons = screen.getAllByText('Detail');
    await user.click(detailButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Detail Booking')).toBeInTheDocument();
    });
    expect(screen.getByText('081234567890')).toBeInTheDocument();
    expect(screen.getByText('123456')).toBeInTheDocument();
    expect(screen.getByText('Rp10.000')).toBeInTheDocument();
  });

  it('shows update status buttons in detail modal for CONFIRMED booking', async () => {
    const user = userEvent.setup();
    mockGetById.mockResolvedValue({
      data: { ...bookings[0], customerPhone: '081234567890', confirmationPin: '123456' },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('DKT-001')).toBeInTheDocument();
    });
    await user.click(screen.getAllByText('Detail')[0]);
    await waitFor(() => {
      expect(screen.getByText('Detail Booking')).toBeInTheDocument();
    });
    expect(screen.getByText('Update Status:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mulai/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /batalkan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tidak hadir/i })).toBeInTheDocument();
  });

  it('closes detail modal when clicking close button', async () => {
    const user = userEvent.setup();
    mockGetById.mockResolvedValue({
      data: { ...bookings[0], customerPhone: '081234567890', confirmationPin: '123456' },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('DKT-001')).toBeInTheDocument();
    });
    await user.click(screen.getAllByText('Detail')[0]);
    await waitFor(() => {
      expect(screen.getByText('Detail Booking')).toBeInTheDocument();
    });
    await user.click(screen.getByText('\u00d7'));
    await waitFor(() => {
      expect(screen.queryByText('Detail Booking')).not.toBeInTheDocument();
    });
  });

  it('calls updateStatus mutation when clicking status button', async () => {
    const user = userEvent.setup();
    mockGetById.mockResolvedValue({
      data: { ...bookings[0], customerPhone: '081234567890', confirmationPin: '123456' },
    });
    mockUpdateStatus.mockResolvedValue({ data: {} });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('DKT-001')).toBeInTheDocument();
    });
    await user.click(screen.getAllByText('Detail')[0]);
    await waitFor(() => {
      expect(screen.getByText('Detail Booking')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /mulai/i }));
    expect(mockUpdateStatus).toHaveBeenCalledWith('b1', 'IN_PROGRESS');
  });

  it('displays pagination when totalPages > 1', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Halaman/)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /berikutnya/i })).toBeInTheDocument();
  });

  it('navigates to next page when clicking next', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Halaman/)).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /berikutnya/i }));
    await waitFor(() => {
      expect(mockList).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    });
  });

  it('resets page to 1 when status filter changes', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('DKT-001')).toBeInTheDocument();
    });
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'CONFIRMED');
    expect(mockList).toHaveBeenCalledWith(expect.objectContaining({ status: 'CONFIRMED', page: 1 }));
  });

  it('filters by date when date input changes', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('DKT-001')).toBeInTheDocument();
    });
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    await user.type(dateInput, '2026-09-15');
    expect(mockList).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
  });

  it('shows loading state for detail modal', async () => {
    const user = userEvent.setup();
    mockGetById.mockReturnValue(new Promise(() => {}));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('DKT-001')).toBeInTheDocument();
    });
    await user.click(screen.getAllByText('Detail')[0]);
    await waitFor(() => {
      expect(screen.getByText('Memuat detail...')).toBeInTheDocument();
    });
  });

  it('shows data not found when detail is null', async () => {
    const user = userEvent.setup();
    mockGetById.mockResolvedValue({ data: null });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('DKT-001')).toBeInTheDocument();
    });
    await user.click(screen.getAllByText('Detail')[0]);
    await waitFor(() => {
      expect(screen.getByText('Data tidak ditemukan')).toBeInTheDocument();
    });
  });
});
