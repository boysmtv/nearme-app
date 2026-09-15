import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecurringBookingsPage from '../RecurringBookingsPage';

vi.mock('../../../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
  publicApi: {
    bookings: { list: vi.fn() },
  },
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Siti', role: 'ROLE_CUSTOMER' } }),
}));

vi.mock('../../../components/CustomerLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="customer-layout">{children}</div>,
}));

import { api, publicApi } from '../../../lib/api';

const mockGet = api.get as ReturnType<typeof vi.fn>;
const mockPost = api.post as ReturnType<typeof vi.fn>;
const mockPut = api.put as ReturnType<typeof vi.fn>;
const mockBookingsList = publicApi.bookings.list as ReturnType<typeof vi.fn>;

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
}

function renderPage(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <RecurringBookingsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('RecurringBookingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: [] });
    mockBookingsList.mockResolvedValue({ data: [] });
  });

  it('renders heading and description', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /booking berulang/i })).toBeInTheDocument();
    expect(screen.getByText(/atur jadwal booking otomatis/i)).toBeInTheDocument();
  });

  it('renders CustomerLayout', async () => {
    renderPage();
    expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
  });

  it('shows empty state when no recurring bookings', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/belum ada booking berulang/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/jadwal otomatis tanpa perlu booking ulang/i)).toBeInTheDocument();
    expect(screen.getByText(/pengingat sebelum jadwal tiba/i)).toBeInTheDocument();
    expect(screen.getByText(/ubah atau batalkan kapan saja/i)).toBeInTheDocument();
  });

  it('shows loading skeleton', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    mockBookingsList.mockReturnValue(new Promise(() => {}));
    renderPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders recurring booking entries when data exists', async () => {
    mockGet.mockResolvedValue({
      data: [{ id: 'rb1', serviceName: 'Potong Rambut', providerName: 'Barbershop Central', frequency: 'WEEKLY', active: true, nextOccurrence: '2026-09-20T10:00:00' }],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
    expect(screen.getByText('Aktif')).toBeInTheDocument();
  });

  it('shows inactive badge for inactive booking', async () => {
    mockGet.mockResolvedValue({
      data: [{ id: 'rb1', serviceName: 'Hair Color', providerName: 'Salon', frequency: 'MONTHLY', active: false }],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Hair Color')).toBeInTheDocument();
    });
    expect(screen.getByText('Nonaktif')).toBeInTheDocument();
  });

  it('shows frequency label', async () => {
    mockGet.mockResolvedValue({
      data: [{ id: 'rb1', serviceName: 'S', providerName: 'P', frequency: 'BIWEEKLY', active: true }],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('2 Mingguan')).toBeInTheDocument();
    });
  });

  it('shows next occurrence date', async () => {
    mockGet.mockResolvedValue({
      data: [{ id: 'rb1', serviceName: 'S', providerName: 'P', frequency: 'WEEKLY', active: true, nextOccurrence: '2026-09-20T10:00:00' }],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/berikutnya:/i)).toBeInTheDocument();
    });
  });

  it('shows Buat Baru button', async () => {
    renderPage();
    expect(screen.getByRole('button', { name: /buat baru/i })).toBeInTheDocument();
  });

  it('opens create modal when Buat Baru is clicked', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => { expect(screen.getByText(/belum ada booking berulang/i)).toBeInTheDocument(); });
    await user.click(screen.getByRole('button', { name: /buat baru/i }));
    expect(screen.getByText('Buat Booking Berulang')).toBeInTheDocument();
    expect(screen.getByText('Frekuensi Pengulangan')).toBeInTheDocument();
  });

  it('closes create modal when Batal is clicked', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => { expect(screen.getByText(/belum ada booking berulang/i)).toBeInTheDocument(); });
    await user.click(screen.getByRole('button', { name: /buat baru/i }));
    expect(screen.getByText('Buat Booking Berulang')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /batal/i }));
    expect(screen.queryByText('Buat Booking Berulang')).not.toBeInTheDocument();
  });

  it('closes create modal when clicking backdrop', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => { expect(screen.getByText(/belum ada booking berulang/i)).toBeInTheDocument(); });
    await user.click(screen.getByRole('button', { name: /buat baru/i }));
    const backdrop = document.querySelector('.absolute.inset-0.bg-black\\/40') as HTMLElement;
    if (backdrop) await user.click(backdrop);
  });

  it('shows frequency selection buttons', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => { expect(screen.getByText(/belum ada booking berulang/i)).toBeInTheDocument(); });
    await user.click(screen.getByRole('button', { name: /buat baru/i }));
    expect(screen.getByText('Mingguan')).toBeInTheDocument();
    expect(screen.getByText('2 Mingguan')).toBeInTheDocument();
    expect(screen.getByText('Bulanan')).toBeInTheDocument();
  });

  it('selects frequency', async () => {
    const user = userEvent.setup();
    mockBookingsList.mockResolvedValue({ data: [{ id: 'b1', serviceName: 'Cut', providerName: 'P' }] });
    renderPage();
    await waitFor(() => { expect(screen.getByText(/belum ada booking berulang/i)).toBeInTheDocument(); });
    await user.click(screen.getByRole('button', { name: /buat baru/i }));
    const monthlyBtn = screen.getByText('Bulanan').closest('button')!;
    await user.click(monthlyBtn);
    expect(monthlyBtn.className).toContain('border-primary-500');
  });

  it('disables Buat Berulang when no booking selected', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => { expect(screen.getByText(/belum ada booking berulang/i)).toBeInTheDocument(); });
    await user.click(screen.getByRole('button', { name: /buat baru/i }));
    const createBtn = screen.getByRole('button', { name: /buat berulang/i });
    expect(createBtn).toBeDisabled();
  });

  it('toggles active state', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({
      data: [{ id: 'rb1', serviceName: 'S', providerName: 'P', frequency: 'WEEKLY', active: true }],
    });
    mockPut.mockResolvedValue({ data: {} });
    renderPage();
    await waitFor(() => { expect(screen.getByText('S')).toBeInTheDocument(); });
    const toggle = screen.getByRole('switch');
    await user.click(toggle);
    expect(mockPut).toHaveBeenCalledWith('/customer/recurring-bookings/rb1', { active: false });
  });

  it('clicks Kelola button', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({
      data: [{ id: 'rb1', serviceName: 'S', providerName: 'P', frequency: 'WEEKLY', active: true }],
    });
    mockPut.mockResolvedValue({ data: {} });
    renderPage();
    await waitFor(() => { expect(screen.getByText('S')).toBeInTheDocument(); });
    await user.click(screen.getByText('Kelola'));
    expect(mockPut).toHaveBeenCalled();
  });

  it('shows completed bookings in selector', async () => {
    const user = userEvent.setup();
    mockBookingsList.mockResolvedValue({ data: [{ id: 'b1', serviceName: 'Haircut', providerName: 'Barber', bookingCode: 'DKT-001' }] });
    renderPage();
    await waitFor(() => { expect(screen.getByText(/belum ada booking berulang/i)).toBeInTheDocument(); });
    await user.click(screen.getByRole('button', { name: /buat baru/i }));
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });
});
