import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotificationPreferencesPage from '../NotificationPreferencesPage';

const { mockGet, mockPut } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPut: vi.fn(),
}));

vi.mock('../../../lib/api', () => ({
  api: {
    get: (...args: any[]) => mockGet(...args),
    put: (...args: any[]) => mockPut(...args),
  },
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <NotificationPreferencesPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('NotificationPreferencesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: [] });
    mockPut.mockResolvedValue({ data: {} });
  });

  it('renders heading and subtitle', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /preferensi notifikasi/i })).toBeInTheDocument();
    expect(screen.getByText('Atur notifikasi mana yang ingin Anda terima')).toBeInTheDocument();
  });

  it('shows all 8 default notification preferences', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Booking Dikonfirmasi')).toBeInTheDocument();
    });
    expect(screen.getByText('Pengingat Booking')).toBeInTheDocument();
    expect(screen.getByText('Booking Dibatalkan')).toBeInTheDocument();
    expect(screen.getByText('Pembayaran Berhasil')).toBeInTheDocument();
    expect(screen.getByText('Promo & Diskon')).toBeInTheDocument();
    expect(screen.getByText('Pengingat Ulasan')).toBeInTheDocument();
    expect(screen.getByText('Poin Loyalty')).toBeInTheDocument();
    expect(screen.getByText('Newsletter')).toBeInTheDocument();
  });

  it('shows description for each preference', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Notifikasi saat booking Anda dikonfirmasi provider')).toBeInTheDocument();
    });
    expect(screen.getByText('Pengingat H-24 dan H-2 sebelum jadwal')).toBeInTheDocument();
    expect(screen.getByText('Notifikasi saat booking dibatalkan')).toBeInTheDocument();
  });

  it('shows column headers', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Jenis Notifikasi')).toBeInTheDocument();
    });
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Push')).toBeInTheDocument();
    expect(screen.getByText('In-App')).toBeInTheDocument();
  });

  it('shows loading skeleton while fetching', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = renderPage();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows save button with correct text', async () => {
    renderPage();
    expect(screen.getByRole('button', { name: /simpan preferensi/i })).toBeInTheDocument();
  });

  it('toggles email preference off when clicked', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Booking Dikonfirmasi')).toBeInTheDocument();
    });
    const row = screen.getByText('Booking Dikonfirmasi').closest('div[class*="grid"]');
    expect(row).toBeTruthy();
    const toggleBtns = row!.querySelectorAll('button');
    expect(toggleBtns.length).toBe(3);
    await user.click(toggleBtns[0]);
  });

  it('toggles push preference', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Booking Dikonfirmasi')).toBeInTheDocument();
    });
    const row = screen.getByText('Booking Dikonfirmasi').closest('div[class*="grid"]');
    const toggleBtns = row!.querySelectorAll('button');
    await user.click(toggleBtns[1]);
  });

  it('toggles in-app preference', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Booking Dikonfirmasi')).toBeInTheDocument();
    });
    const row = screen.getByText('Booking Dikonfirmasi').closest('div[class*="grid"]');
    const toggleBtns = row!.querySelectorAll('button');
    await user.click(toggleBtns[2]);
  });

  it('save button calls API with preferences', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Booking Dikonfirmasi')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /simpan preferensi/i }));
    expect(mockPut).toHaveBeenCalledWith('/notifications/preferences', { preferences: expect.any(Array) });
  });

  it('save button shows "Menyimpan..." while pending', async () => {
    const user = userEvent.setup();
    mockPut.mockReturnValue(new Promise(() => {}));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Booking Dikonfirmasi')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /simpan preferensi/i }));
    expect(screen.getByText('Menyimpan...')).toBeInTheDocument();
  });

  it('save success invalidates queries', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Booking Dikonfirmasi')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /simpan preferensi/i }));
    expect(mockPut).toHaveBeenCalled();
  });

  it('does not show loading skeleton after data loads', async () => {
    const { container } = renderPage();
    await waitFor(() => {
      expect(screen.getByText('Booking Dikonfirmasi')).toBeInTheDocument();
    });
    expect(container.querySelectorAll('.animate-pulse').length).toBe(0);
  });
});
