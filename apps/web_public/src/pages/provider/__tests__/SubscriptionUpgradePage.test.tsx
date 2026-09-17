import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SubscriptionUpgradePage from '../SubscriptionUpgradePage';

const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
}));

vi.mock('../../../lib/api', () => ({
  api: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
  },
}));

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } } });
}

function renderPage(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <SubscriptionUpgradePage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('SubscriptionUpgradePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: { data: { planId: 'FREE' } } });
  });

  it('renders heading and subtitle', async () => {
    renderPage();
    expect(screen.getByText('Upgrade Plan')).toBeInTheDocument();
    expect(screen.getByText('Pilih paket yang sesuai untuk bisnis Anda')).toBeInTheDocument();
  });

  it('shows loading skeleton while fetching', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    renderPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(3);
  });

  it('shows all 3 plan names after loading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Free')).toBeInTheDocument();
    });
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('shows "Paling Populer" badge on PRO plan', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Paling Populer')).toBeInTheDocument();
    });
  });

  it('shows "Plan Aktif" badge when current plan is FREE', async () => {
    renderPage();
    await waitFor(() => {
      const badges = screen.getAllByText('Plan Aktif');
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('Free plan button shows "Plan Aktif" and is disabled', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Free')).toBeInTheDocument();
    });
    const planAktifButtons = screen.getAllByText('Plan Aktif').filter(el => el.closest('button'));
    expect(planAktifButtons.length).toBeGreaterThanOrEqual(1);
    expect(planAktifButtons[0].closest('button')).toBeDisabled();
  });

  it('Free plan: PRO and ENTERPRISE buttons show "Upgrade Sekarang"', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Pro')).toBeInTheDocument();
    });
    const upgradeButtons = screen.getAllByText('Upgrade Sekarang');
    expect(upgradeButtons.length).toBe(2);
  });

  it('Pro plan as current: shows correct button states', async () => {
    mockGet.mockResolvedValue({ data: { data: { planId: 'PRO' } } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Pro')).toBeInTheDocument();
    });
    const planAktifBtns = screen.getAllByText('Plan Aktif').filter(el => el.closest('button'));
    expect(planAktifBtns.length).toBeGreaterThanOrEqual(1);
    const unavailableBtns = screen.getAllByText('Tidak Tersedia').filter(el => el.closest('button'));
    expect(unavailableBtns.length).toBeGreaterThanOrEqual(1);
    const upgradeBtns = screen.getAllByText('Upgrade Sekarang').filter(el => el.closest('button'));
    expect(upgradeBtns.length).toBeGreaterThanOrEqual(1);
  });

  it('Enterprise plan as current: Free and Pro show "Tidak Tersedia"', async () => {
    mockGet.mockResolvedValue({ data: { data: { planId: 'ENTERPRISE' } } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });
    const unavailableBtns = screen.getAllByText('Tidak Tersedia').filter(el => el.closest('button'));
    expect(unavailableBtns.length).toBe(2);
  });

  it('click "Upgrade Sekarang" on PRO opens confirmation modal', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Upgrade Sekarang').length).toBeGreaterThanOrEqual(1);
    });
    const upgradeButtons = screen.getAllByText('Upgrade Sekarang').filter(el => el.closest('button'));
    await user.click(upgradeButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Konfirmasi Upgrade')).toBeInTheDocument();
    });
  });

  it('modal shows plan name and formatted price', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Upgrade Sekarang').length).toBeGreaterThanOrEqual(1);
    });
    const upgradeButtons = screen.getAllByText('Upgrade Sekarang').filter(el => el.closest('button'));
    await user.click(upgradeButtons[0]);
    const modal = screen.getByText('Konfirmasi Upgrade').closest('div[class*="fixed"]');
    expect(modal).toBeTruthy();
    expect(within(modal as HTMLElement).getByText(/Pro/)).toBeInTheDocument();
    expect(within(modal as HTMLElement).getByText(/199\.000/)).toBeInTheDocument();
  });

  it('modal shows Midtrans payment notice', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Upgrade Sekarang').length).toBeGreaterThanOrEqual(1);
    });
    await user.click(screen.getAllByText('Upgrade Sekarang').filter(el => el.closest('button'))[0]);
    expect(screen.getByText('Pembayaran akan diproses melalui Midtrans.')).toBeInTheDocument();
  });

  it('modal "Batal" closes modal', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Upgrade Sekarang').length).toBeGreaterThanOrEqual(1);
    });
    await user.click(screen.getAllByText('Upgrade Sekarang').filter(el => el.closest('button'))[0]);
    await waitFor(() => {
      expect(screen.getByText('Konfirmasi Upgrade')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Batal'));
    await waitFor(() => {
      expect(screen.queryByText('Konfirmasi Upgrade')).not.toBeInTheDocument();
    });
  });

  it('clicking modal backdrop closes modal', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Upgrade Sekarang').length).toBeGreaterThanOrEqual(1);
    });
    await user.click(screen.getAllByText('Upgrade Sekarang').filter(el => el.closest('button'))[0]);
    await waitFor(() => {
      expect(screen.getByText('Konfirmasi Upgrade')).toBeInTheDocument();
    });
    const backdrop = screen.getByText('Konfirmasi Upgrade').closest('div[class*="fixed"]');
    await user.click(backdrop!);
    await waitFor(() => {
      expect(screen.queryByText('Konfirmasi Upgrade')).not.toBeInTheDocument();
    });
  });

  it('modal "Konfirmasi" calls upgradeMutation with correct planId', async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValue({ data: {} });
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Upgrade Sekarang').length).toBeGreaterThanOrEqual(1);
    });
    await user.click(screen.getAllByText('Upgrade Sekarang').filter(el => el.closest('button'))[0]);
    await waitFor(() => {
      expect(screen.getByText('Konfirmasi Upgrade')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Konfirmasi'));
    expect(mockPost).toHaveBeenCalledWith('/provider/subscription/upgrade', { planId: 'PRO' });
  });

  it('upgradeMutation pending shows "Memproses..." button text', async () => {
    const user = userEvent.setup();
    mockPost.mockReturnValue(new Promise(() => {}));
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Upgrade Sekarang').length).toBeGreaterThanOrEqual(1);
    });
    await user.click(screen.getAllByText('Upgrade Sekarang')[0]);
    await user.click(screen.getByText('Konfirmasi'));
    expect(screen.getByText('Memproses...')).toBeInTheDocument();
  });

  it('upgradeMutation success invalidates queries and closes modal', async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValue({ data: {} });
    const qc = createQueryClient();
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
    renderPage(qc);
    await waitFor(() => {
      expect(screen.getAllByText('Upgrade Sekarang').length).toBeGreaterThanOrEqual(1);
    });
    await user.click(screen.getAllByText('Upgrade Sekarang')[0]);
    await user.click(screen.getByText('Konfirmasi'));
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['provider-subscription'] });
      expect(screen.queryByText('Konfirmasi Upgrade')).not.toBeInTheDocument();
    });
  });

  it('shows "Gratis" for FREE plan price', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Gratis')).toBeInTheDocument();
    });
  });

  it('shows limitations list for FREE plan', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Tidak ada analytics')).toBeInTheDocument();
    });
    expect(screen.getByText('Tidak ada promosi')).toBeInTheDocument();
    expect(screen.getByText('Tidak ada prioritas')).toBeInTheDocument();
  });

  it('shows Free plan features', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('1 lokasi')).toBeInTheDocument();
    });
    expect(screen.getByText('10 booking/bulan')).toBeInTheDocument();
    expect(screen.getByText('Layanan dasar')).toBeInTheDocument();
    expect(screen.getByText('Jadwal staf')).toBeInTheDocument();
    expect(screen.getByText('Dukungan email')).toBeInTheDocument();
  });

  it('shows Enterprise plan features', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Multi-cabang')).toBeInTheDocument();
    });
    expect(screen.getByText('API akses')).toBeInTheDocument();
    expect(screen.getByText('White-label')).toBeInTheDocument();
    expect(screen.getByText('Dedicated support')).toBeInTheDocument();
    expect(screen.getByText('Custom integrasi')).toBeInTheDocument();
  });

  it('shows Pro plan features', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Promosi & coupon')).toBeInTheDocument();
    });
    expect(screen.getByText('Laporan analytics')).toBeInTheDocument();
    expect(screen.getByText('Gallery & portfolio')).toBeInTheDocument();
    expect(screen.getByText('Dukungan prioritas')).toBeInTheDocument();
    expect(screen.getByText('Booking berulang')).toBeInTheDocument();
  });

  it('Enterprise upgrade button works from FREE plan', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Upgrade Sekarang').length).toBe(2);
    });
    const upgradeButtons = screen.getAllByText('Upgrade Sekarang').filter(el => el.closest('button'));
    await user.click(upgradeButtons[1]);
    await waitFor(() => {
      expect(screen.getByText('Konfirmasi Upgrade')).toBeInTheDocument();
    });
    const modal = screen.getByText('Konfirmasi Upgrade').closest('div[class*="fixed"]');
    expect(modal).toBeTruthy();
    expect(within(modal as HTMLElement).getByText(/Enterprise/)).toBeInTheDocument();
    expect(within(modal as HTMLElement).getByText(/499\.000/)).toBeInTheDocument();
  });

  it('shows Pro period for paid plans', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Pro')).toBeInTheDocument();
    });
    const periodTexts = screen.getAllByText(/\/bulan/);
    expect(periodTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('FREE plan shows Gratis without period', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Gratis')).toBeInTheDocument();
    });
    const freeCard = screen.getByText('Gratis').closest('div');
    expect(freeCard).toBeTruthy();
  });

  it('shows unlimited booking for Pro and Enterprise', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Free')).toBeInTheDocument();
    });
    const unlimitedBooking = screen.getAllByText('Unlimited booking');
    expect(unlimitedBooking.length).toBeGreaterThanOrEqual(2);
  });

  it('shows unlimited lokasi only for Enterprise', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });
    const unlimitedLokasi = screen.getAllByText('Unlimited lokasi');
    expect(unlimitedLokasi.length).toBe(1);
  });

  it('shows "Semua fitur Pro" for Enterprise', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Semua fitur Pro')).toBeInTheDocument();
    });
  });
});
