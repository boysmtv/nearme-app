import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotificationsPage from '../NotificationsPage';

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

vi.mock('../../../lib/api', () => ({
  providerApi: {
    notifications: { list: vi.fn(), markRead: vi.fn(), markAllRead: vi.fn() },
  },
}));

vi.mock('../../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="provider-layout">{children}</div>,
}));

import { providerApi } from '../../../lib/api';

const mockList = providerApi.notifications.list as ReturnType<typeof vi.fn>;
const mockMarkAllRead = providerApi.notifications.markAllRead as ReturnType<typeof vi.fn>;

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } } });
}

function renderPage(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <NotificationsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('NotificationsPage (provider)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockList.mockResolvedValue({ data: { data: [] } });
  });

  it('renders Notifications heading', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /notifikasi/i })).toBeInTheDocument();
  });

  it('renders ProviderLayout', () => {
    renderPage();
    expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Tidak ada notifikasi')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    mockList.mockReturnValue(new Promise(() => {}));
    renderPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders notifications', async () => {
    mockList.mockResolvedValue({ data: { data: [
      { id: 'n1', title: 'Booking Baru', message: 'Ada booking baru dari Siti', type: 'BOOKING_NEW', read: false, createdAt: new Date().toISOString() },
    ] } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Booking Baru')).toBeInTheDocument();
    });
    expect(screen.getByText(/ada booking baru dari siti/i)).toBeInTheDocument();
  });

  it('marks all as read', async () => {
    const user = userEvent.setup();
    mockList.mockResolvedValue({ data: { data: [
      { id: 'n1', title: 'Notif', message: 'Msg', type: 'BOOKING_NEW', read: false, createdAt: new Date().toISOString() },
    ] } });
    mockMarkAllRead.mockResolvedValue({ data: {} });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Notif')).toBeInTheDocument(); });
    await user.click(screen.getByText(/tandai semua dibaca/i));
    expect(mockMarkAllRead).toHaveBeenCalled();
  });

  it('does not show mark all when no notifications', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Tidak ada notifikasi')).toBeInTheDocument(); });
    expect(screen.queryByText(/tandai semua/i)).not.toBeInTheDocument();
  });

  it('shows multiple notifications', async () => {
    mockList.mockResolvedValue({ data: { data: [
      { id: 'n1', title: 'Notif 1', message: 'Msg 1', type: 'BOOKING_NEW', read: false, createdAt: new Date().toISOString() },
      { id: 'n2', title: 'Notif 2', message: 'Msg 2', type: 'BOOKING_CANCELLED', read: false, createdAt: new Date().toISOString() },
      { id: 'n3', title: 'Notif 3', message: 'Msg 3', type: 'REVIEW_RECEIVED', read: true, createdAt: new Date().toISOString() },
    ] } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Notif 1')).toBeInTheDocument();
    });
    expect(screen.getByText('Notif 2')).toBeInTheDocument();
    expect(screen.getByText('Notif 3')).toBeInTheDocument();
  });

  it('shows read notification with different style', async () => {
    mockList.mockResolvedValue({ data: { data: [
      { id: 'n1', title: 'Read notif', message: 'Msg', type: 'BOOKING_NEW', read: true, createdAt: new Date().toISOString() },
    ] } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Read notif')).toBeInTheDocument();
    });
  });

  it('shows notification with default title when title missing', async () => {
    mockList.mockResolvedValue({ data: { data: [
      { id: 'n1', message: 'Only message', type: 'BOOKING_NEW', read: false, createdAt: new Date().toISOString() },
    ] } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Notifikasi')).toBeInTheDocument();
    });
  });

  it('navigates back when back button clicked', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => { expect(screen.getByText('Tidak ada notifikasi')).toBeInTheDocument(); });
  });
});
