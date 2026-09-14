import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerNotificationsPage from '../CustomerNotificationsPage';

const mockNotifications = [
  {
    id: 'n1',
    title: 'Booking Dikonfirmasi',
    message: 'Booking DKT-001 telah dikonfirmasi oleh provider.',
    type: 'BOOKING',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n2',
    title: 'Pembayaran Diterima',
    message: 'Pembayaran sebesar Rp 75.000 telah diterima.',
    type: 'PAYMENT',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n3',
    title: 'Promo Spesial',
    message: 'Dapatkan diskon 20% untuk booking berikutnya!',
    type: 'PROMO',
    read: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'n4',
    title: 'Booking Dibatalkan',
    message: 'Booking DKT-002 telah dibatalkan.',
    type: 'BOOKING_CANCELLED',
    read: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

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

let queryClient: QueryClient;

function renderNotifications() {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, cacheTime: 0 } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <CustomerNotificationsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('CustomerNotificationsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders Notifikasi heading and unread count badge', async () => {
    (publicApi.notifications.list as any).mockResolvedValue({ data: mockNotifications });
    renderNotifications();
    await waitFor(() => {
      expect(screen.getByText('Notifikasi')).toBeInTheDocument();
      expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows loading skeleton initially', () => {
    (publicApi.notifications.list as any).mockReturnValue(new Promise(() => {}));
    const { container } = renderNotifications();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', async () => {
    (publicApi.notifications.list as any).mockResolvedValue({ data: [] });
    renderNotifications();
    await waitFor(() => {
      expect(screen.getByText('Tidak ada notifikasi')).toBeInTheDocument();
      expect(screen.getByText('Anda sudah membaca semua notifikasi')).toBeInTheDocument();
    });
  });

  it('renders all filter tabs', async () => {
    (publicApi.notifications.list as any).mockResolvedValue({ data: mockNotifications });
    renderNotifications();
    await waitFor(() => {
      expect(screen.getByText('Semua')).toBeInTheDocument();
      expect(screen.getByText('Belum Dibaca')).toBeInTheDocument();
      expect(screen.getByText('Booking')).toBeInTheDocument();
      expect(screen.getByText('Pembayaran')).toBeInTheDocument();
      expect(screen.getByText('Promo')).toBeInTheDocument();
    });
  });

  it('renders notification titles and messages', async () => {
    (publicApi.notifications.list as any).mockResolvedValue({ data: mockNotifications });
    renderNotifications();
    await waitFor(() => {
      expect(screen.getByText('Booking Dikonfirmasi')).toBeInTheDocument();
      expect(screen.getByText('Booking DKT-001 telah dikonfirmasi oleh provider.')).toBeInTheDocument();
      expect(screen.getByText('Pembayaran Diterima')).toBeInTheDocument();
      expect(screen.getByText('Promo Spesial')).toBeInTheDocument();
    });
  });

  it('shows mark all read button when there are unread notifications', async () => {
    (publicApi.notifications.list as any).mockResolvedValue({ data: mockNotifications });
    renderNotifications();
    await waitFor(() => {
      expect(screen.getByText('Tandai semua sudah dibaca')).toBeInTheDocument();
    });
  });

  it('does not show mark all read button when all read', async () => {
    const allRead = mockNotifications.map(n => ({ ...n, read: true }));
    (publicApi.notifications.list as any).mockResolvedValue({ data: allRead });
    renderNotifications();
    await waitFor(() => {
      expect(screen.getByText('Notifikasi')).toBeInTheDocument();
    });
    expect(screen.queryByText('Tandai semua sudah dibaca')).not.toBeInTheDocument();
  });

  it('calls markRead when clicking unread notification', async () => {
    (publicApi.notifications.list as any).mockResolvedValue({ data: mockNotifications });
    renderNotifications();
    await waitFor(() => {
      expect(screen.getByText('Booking Dikonfirmasi')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Booking Dikonfirmasi').closest('.group')!);
    await waitFor(() => {
      expect(publicApi.notifications.markRead).toHaveBeenCalledWith('n1');
    });
  });

  it('calls markAllRead when clicking mark all read button', async () => {
    (publicApi.notifications.list as any).mockResolvedValue({ data: mockNotifications });
    renderNotifications();
    await waitFor(() => {
      expect(screen.getByText('Tandai semua sudah dibaca')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Tandai semua sudah dibaca'));
    await waitFor(() => {
      expect(publicApi.notifications.markAllRead).toHaveBeenCalled();
    });
  });

  it('shows correct count for unread tab badge', async () => {
    (publicApi.notifications.list as any).mockResolvedValue({ data: mockNotifications });
    renderNotifications();
    await waitFor(() => {
      const unreadBadges = screen.getAllByText('2');
      expect(unreadBadges.length).toBe(2);
    });
  });

  it('groups notifications by date', async () => {
    (publicApi.notifications.list as any).mockResolvedValue({ data: mockNotifications });
    renderNotifications();
    await waitFor(() => {
      expect(screen.getByText('Hari Ini')).toBeInTheDocument();
    });
  });

  it('shows empty state for filtered tab with no results', async () => {
    const bookingOnly = mockNotifications.filter(n => n.type === 'BOOKING');
    (publicApi.notifications.list as any).mockResolvedValue({ data: bookingOnly });
    renderNotifications();
    await waitFor(() => {
      expect(screen.getByText('Booking Dikonfirmasi')).toBeInTheDocument();
    });

    const promoTab = screen.getByRole('button', { name: /Promo/i });
    await userEvent.click(promoTab);
    await waitFor(() => {
      expect(screen.getByText('Tidak ada notifikasi untuk filter ini')).toBeInTheDocument();
    });
  });

  it('renders notification type icon and unread indicator dot', async () => {
    (publicApi.notifications.list as any).mockResolvedValue({ data: mockNotifications });
    renderNotifications();
    await waitFor(() => {
      const unreadDots = document.querySelectorAll('.bg-primary-500');
      expect(unreadDots.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('does not show count badge when no unread notifications', async () => {
    const allRead = mockNotifications.map(n => ({ ...n, read: true }));
    (publicApi.notifications.list as any).mockResolvedValue({ data: allRead });
    renderNotifications();
    await waitFor(() => {
      expect(screen.getByText('Notifikasi')).toBeInTheDocument();
    });
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
