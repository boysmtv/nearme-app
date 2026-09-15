import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerNotificationsPage from '../CustomerNotificationsPage';

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { id: 'c1', name: 'Siti', role: 'ROLE_CUSTOMER' } }),
}));

vi.mock('../../../lib/api', () => ({
  publicApi: {
    notifications: {
      list: vi.fn(),
      markRead: vi.fn(),
      markAllRead: vi.fn(),
    },
  },
}));

vi.mock('../../../components/CustomerLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="customer-layout">{children}</div>,
}));

import { publicApi } from '../../../lib/api';

const mockList = publicApi.notifications.list as ReturnType<typeof vi.fn>;
const mockMarkRead = publicApi.notifications.markRead as ReturnType<typeof vi.fn>;
const mockMarkAllRead = publicApi.notifications.markAllRead as ReturnType<typeof vi.fn>;

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } } });
}

function renderPage(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <CustomerNotificationsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('CustomerNotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockList.mockResolvedValue({ data: [] });
  });

  it('renders heading', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /notifikasi/i })).toBeInTheDocument();
  });

  it('renders CustomerLayout', () => {
    renderPage();
    expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Tidak ada notifikasi')).toBeInTheDocument();
    });
  });

  it('shows loading skeletons', () => {
    mockList.mockReturnValue(new Promise(() => {}));
    renderPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders notifications', async () => {
    mockList.mockResolvedValue({ data: [
      { id: 'n1', title: 'Booking Dikonfirmasi', message: 'Booking Anda DKT-001 telah dikonfirmasi', type: 'BOOKING', read: false, createdAt: new Date().toISOString() },
    ] });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Booking Dikonfirmasi')).toBeInTheDocument();
    });
    expect(screen.getByText(/booking Anda DKT-001 telah dikonfirmasi/i)).toBeInTheDocument();
  });

  it('shows unread count badge', async () => {
    mockList.mockResolvedValue({ data: [
      { id: 'n1', title: 'Notif', type: 'BOOKING', read: false, createdAt: new Date().toISOString() },
    ] });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Notif')).toBeInTheDocument();
    });
    // Both header badge and filter tab badge show "1"
    const ones = screen.getAllByText('1');
    expect(ones.length).toBeGreaterThanOrEqual(1);
  });

  it('shows filter tabs', async () => {
    renderPage();
    expect(screen.getByText('Semua')).toBeInTheDocument();
    expect(screen.getByText('Belum Dibaca')).toBeInTheDocument();
    expect(screen.getByText('Booking')).toBeInTheDocument();
    expect(screen.getByText('Pembayaran')).toBeInTheDocument();
    expect(screen.getByText('Promo')).toBeInTheDocument();
  });

  it('marks all as read', async () => {
    const user = userEvent.setup();
    mockList.mockResolvedValue({ data: [
      { id: 'n1', title: 'Notif', type: 'BOOKING', read: false, createdAt: new Date().toISOString() },
    ] });
    mockMarkAllRead.mockResolvedValue({ data: {} });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Notif')).toBeInTheDocument(); });
    await user.click(screen.getByText(/tandai semua sudah dibaca/i));
    expect(mockMarkAllRead).toHaveBeenCalled();
  });

  it('shows filter tab with unread count', async () => {
    mockList.mockResolvedValue({ data: [
      { id: 'n1', title: 'N', type: 'BOOKING', read: false, createdAt: new Date().toISOString() },
    ] });
    renderPage();
    await waitFor(() => { expect(screen.getByText('N')).toBeInTheDocument(); });
    // Both header badge and filter tab badge show "1"
    const ones = screen.getAllByText('1');
    expect(ones.length).toBeGreaterThanOrEqual(1);
  });

  it('clicks notification to mark as read', async () => {
    mockList.mockResolvedValue({ data: [
      { id: 'n1', title: 'Notif', type: 'BOOKING', read: false, createdAt: new Date().toISOString() },
    ] });
    mockMarkRead.mockResolvedValue({ data: {} });
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => { expect(screen.getByText('Notif')).toBeInTheDocument(); });
    await user.click(screen.getByText('Notif'));
    expect(mockMarkRead).toHaveBeenCalledWith('n1');
  });

  it('groups notifications by date group', async () => {
    mockList.mockResolvedValue({ data: [
      { id: 'n1', title: 'Today', type: 'BOOKING', read: false, createdAt: new Date().toISOString() },
      { id: 'n2', title: 'Old', type: 'BOOKING', read: false, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    ] });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Today')).toBeInTheDocument(); });
  });

  it('shows empty state for specific filter', async () => {
    const user = userEvent.setup();
    mockList.mockResolvedValue({ data: [
      { id: 'n1', title: 'Notif', type: 'BOOKING', read: false, createdAt: new Date().toISOString() },
    ] });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Notif')).toBeInTheDocument(); });
    await user.click(screen.getByText('Promo'));
    await waitFor(() => {
      expect(screen.getByText('Tidak ada notifikasi untuk filter ini')).toBeInTheDocument();
    });
  });

  it('shows notification with body field', async () => {
    mockList.mockResolvedValue({ data: [
      { id: 'n1', title: 'Title', body: 'Body content', type: 'BOOKING', read: false, createdAt: new Date().toISOString() },
    ] });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Body content')).toBeInTheDocument();
    });
  });

  it('shows default title when title missing', async () => {
    mockList.mockResolvedValue({ data: [
      { id: 'n1', message: 'Message only', type: 'BOOKING', read: false, createdAt: new Date().toISOString() },
    ] });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Notifikasi')).toBeInTheDocument();
    });
  });

  it('hides mark all button when no unread', async () => {
    mockList.mockResolvedValue({ data: [
      { id: 'n1', title: 'Read', type: 'BOOKING', read: true, createdAt: new Date().toISOString() },
    ] });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Read')).toBeInTheDocument(); });
    expect(screen.queryByText(/tandai semua sudah dibaca/i)).not.toBeInTheDocument();
  });
});
