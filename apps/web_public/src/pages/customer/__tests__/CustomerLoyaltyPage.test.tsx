import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerLoyaltyPage from '../CustomerLoyaltyPage';

const mockProfile = {
  name: 'Siti Customer',
  loyaltyPoints: 750,
  totalBookings: 15,
  totalSpent: 2500000,
};

const mockLoyaltyData = {
  transactions: [
    { date: '2026-09-10T10:00:00+07:00', description: 'Booking Haircut', type: 'EARN', points: 75 },
    { date: '2026-09-08T14:00:00+07:00', description: 'Tukar Diskon Rp25.000', type: 'REDEEM', points: 250 },
    { date: '2026-09-05T09:00:00+07:00', description: 'Booking Facial', type: 'EARN', points: 150 },
  ],
};

vi.mock('../../../lib/api', () => ({
  publicApi: {
    customer: { getProfile: vi.fn() },
  },
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../../../components/CustomerLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="customer-layout">{children}</div>,
}));

import { publicApi, api } from '../../../lib/api';

let queryClient: QueryClient;

function renderLoyalty() {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, cacheTime: 0 } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <CustomerLoyaltyPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('CustomerLoyaltyPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders Program Loyalitas heading and subtitle', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    (api.get as any).mockResolvedValue({ data: mockLoyaltyData });
    renderLoyalty();
    await waitFor(() => {
      expect(screen.getByText('Program Loyalitas')).toBeInTheDocument();
      expect(screen.getByText('Kumpulkan poin, naikkan tier, nikmati benefit eksklusif')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    (publicApi.customer.getProfile as any).mockReturnValue(new Promise(() => {}));
    (api.get as any).mockReturnValue(new Promise(() => {}));
    const { container } = renderLoyalty();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('displays loyalty points in hero card', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    (api.get as any).mockResolvedValue({ data: mockLoyaltyData });
    renderLoyalty();
    await waitFor(() => {
      expect(screen.getAllByText('750').length).toBeGreaterThan(0);
    });
  });

  it('displays correct tier (Silver for 750 points)', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    (api.get as any).mockResolvedValue({ data: mockLoyaltyData });
    renderLoyalty();
    await waitFor(() => {
      expect(screen.getByText('Tier Silver')).toBeInTheDocument();
    });
  });

  it('shows progress to next tier', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    (api.get as any).mockResolvedValue({ data: mockLoyaltyData });
    renderLoyalty();
    await waitFor(() => {
      expect(screen.getByText(/poin lagi/)).toBeInTheDocument();
      expect(screen.getAllByText('Gold').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows tier comparison section with all tiers', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    (api.get as any).mockResolvedValue({ data: mockLoyaltyData });
    renderLoyalty();
    await waitFor(() => {
      expect(screen.getByText('Perbandingan Tier')).toBeInTheDocument();
      expect(screen.getByText('Bronze')).toBeInTheDocument();
      expect(screen.getAllByText('Silver').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Gold').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Platinum')).toBeInTheDocument();
    });
  });

  it('marks current tier as active', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    (api.get as any).mockResolvedValue({ data: mockLoyaltyData });
    renderLoyalty();
    await waitFor(() => {
      const activeBadges = screen.getAllByText('Aktif');
      expect(activeBadges.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows points history table with transactions', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    (api.get as any).mockResolvedValue({ data: mockLoyaltyData });
    renderLoyalty();
    await waitFor(() => {
      expect(screen.getByText('Riwayat Poin')).toBeInTheDocument();
      expect(screen.getByText('Booking Haircut')).toBeInTheDocument();
      expect(screen.getByText('Tukar Diskon Rp25.000')).toBeInTheDocument();
      expect(screen.getByText('Booking Facial')).toBeInTheDocument();
    });
  });

  it('shows earn methods section', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    (api.get as any).mockResolvedValue({ data: mockLoyaltyData });
    renderLoyalty();
    await waitFor(() => {
      expect(screen.getByText('Cara Mendapat Poin')).toBeInTheDocument();
      expect(screen.getByText('Booking Layanan')).toBeInTheDocument();
      expect(screen.getByText('Beri Ulasan')).toBeInTheDocument();
      expect(screen.getByText('Ajak Teman')).toBeInTheDocument();
    });
  });

  it('shows redeem options section', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    (api.get as any).mockResolvedValue({ data: mockLoyaltyData });
    renderLoyalty();
    await waitFor(() => {
      expect(screen.getByText('Tukar Poin')).toBeInTheDocument();
      expect(screen.getByText('Diskon Rp25.000')).toBeInTheDocument();
      expect(screen.getByText('Diskon Rp50.000')).toBeInTheDocument();
      expect(screen.getByText('Gratis Booking Layanan Dasar')).toBeInTheDocument();
      expect(screen.getByText('Gratis Booking Premium')).toBeInTheDocument();
    });
  });

  it('enables redeem button for options user can afford', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    (api.get as any).mockResolvedValue({ data: mockLoyaltyData });
    renderLoyalty();
    await waitFor(() => {
      const redeemButtons = screen.getAllByText('Tukarkan');
      expect(redeemButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows insufficient points for expensive options', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    (api.get as any).mockResolvedValue({ data: mockLoyaltyData });
    renderLoyalty();
    await waitFor(() => {
      const insufficientButtons = screen.getAllByText('Poin Tidak Cukup');
      expect(insufficientButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows booking count and total spent', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    (api.get as any).mockResolvedValue({ data: mockLoyaltyData });
    renderLoyalty();
    await waitFor(() => {
      expect(screen.getByText('15 booking')).toBeInTheDocument();
      expect(screen.getByText(/2\.500\.000/)).toBeInTheDocument();
    });
  });

  it('shows empty history state when no transactions', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    (api.get as any).mockResolvedValue({ data: { transactions: [] } });
    renderLoyalty();
    await waitFor(() => {
      expect(screen.getByText('Belum ada riwayat poin')).toBeInTheDocument();
    });
  });

  it('handles Platinum tier (max tier) with no next tier text', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: { ...mockProfile, loyaltyPoints: 6000 } });
    (api.get as any).mockResolvedValue({ data: mockLoyaltyData });
    renderLoyalty();
    await waitFor(() => {
      expect(screen.getByText('Selamat! Anda sudah mencapai tier tertinggi')).toBeInTheDocument();
    });
  });

  it('handles Bronze tier with correct next tier info', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: { ...mockProfile, loyaltyPoints: 100 } });
    (api.get as any).mockResolvedValue({ data: mockLoyaltyData });
    renderLoyalty();
    await waitFor(() => {
      expect(screen.getByText('Tier Bronze')).toBeInTheDocument();
      expect(screen.getByText(/poin lagi/)).toBeInTheDocument();
    });
  });

  it('shows earn method descriptions', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    (api.get as any).mockResolvedValue({ data: mockLoyaltyData });
    renderLoyalty();
    await waitFor(() => {
      expect(screen.getByText(/Dapatkan 1 poin untuk setiap/)).toBeInTheDocument();
      expect(screen.getByText(/Dapatkan 5 poin untuk setiap ulasan/)).toBeInTheDocument();
      expect(screen.getByText(/Dapatkan 50 poin untuk setiap referral/)).toBeInTheDocument();
    });
  });
});
