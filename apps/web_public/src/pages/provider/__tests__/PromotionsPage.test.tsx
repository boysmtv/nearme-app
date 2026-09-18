import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PromotionsPage from '../PromotionsPage';

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

vi.mock('../../../lib/api', () => ({
  providerApi: {
    coupons: { list: vi.fn(), create: vi.fn(), delete: vi.fn(), update: vi.fn() },
    campaigns: { list: vi.fn(), create: vi.fn(), activate: vi.fn(), pause: vi.fn() },
    customers: { list: vi.fn() },
    loyalty: { getCustomerHistory: vi.fn(), earn: vi.fn() },
  },
}));

vi.mock('../../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="provider-layout">{children}</div>,
}));

import { providerApi } from '../../../lib/api';

const mockCouponsList = providerApi.coupons.list as ReturnType<typeof vi.fn>;
const mockCouponsCreate = providerApi.coupons.create as ReturnType<typeof vi.fn>;
const mockCouponsUpdate = providerApi.coupons.update as ReturnType<typeof vi.fn>;
const mockCampaignsList = providerApi.campaigns.list as ReturnType<typeof vi.fn>;
const mockCampaignsCreate = providerApi.campaigns.create as ReturnType<typeof vi.fn>;
const mockCampaignsPause = providerApi.campaigns.pause as ReturnType<typeof vi.fn>;
const mockCampaignsActivate = providerApi.campaigns.activate as ReturnType<typeof vi.fn>;
const mockCustomersList = providerApi.customers.list as ReturnType<typeof vi.fn>;
const mockLoyaltyHistory = providerApi.loyalty.getCustomerHistory as ReturnType<typeof vi.fn>;
const mockLoyaltyEarn = providerApi.loyalty.earn as ReturnType<typeof vi.fn>;

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
}

function renderPage(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <PromotionsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const coupons = [
  { id: 'c1', code: 'DISKON20', discountType: 'PERCENTAGE', discountValue: 20, maxUses: 100, currentUses: 5, active: true, minOrder: 0 },
  { id: 'c2', code: 'FIXED10K', discountType: 'FIXED', discountValue: 10000, maxUses: 50, currentUses: 10, active: true, minOrder: 50000 },
  { id: 'c3', code: 'EXPIRED', discountType: 'PERCENTAGE', discountValue: 15, maxUses: 20, currentUses: 20, active: false, minOrder: 0 },
];

const campaigns = [
  { id: 'camp1', name: 'Promo Lebaran', type: 'DISCOUNT', startDate: '2026-04-01', endDate: '2026-04-15', status: 'ACTIVE' },
  { id: 'camp2', name: 'Back to School', type: 'LOYALTY', startDate: '2026-09-01', endDate: '2026-09-30', status: 'PAUSED' },
];

const customers = [
  { id: 'cust1', name: 'Siti', email: 'siti@gmail.com', totalBookings: 5, totalSpent: 250000, loyaltyPoints: 150 },
  { id: 'cust2', name: 'Rina', email: 'rina@gmail.com', totalBookings: 3, totalSpent: 180000, loyaltyPoints: 80 },
];

describe('PromotionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCouponsList.mockResolvedValue({ data: coupons });
    mockCampaignsList.mockResolvedValue({ data: campaigns });
    mockCustomersList.mockResolvedValue({ data: { data: customers, pagination: { totalPages: 1 } } });
  });

  it('renders heading, description, and tabs', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /promosi/i })).toBeInTheDocument();
    expect(screen.getByText(/kelola kupon, kampana, dan loyalitas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kupon' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kampanye' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Loyalitas' })).toBeInTheDocument();
    expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
  });

  describe('Coupons tab', () => {
    it('renders coupon list with all columns', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      expect(screen.getByText('FIXED10K')).toBeInTheDocument();
      expect(screen.getByText('EXPIRED')).toBeInTheDocument();
      expect(screen.getByText('Kode')).toBeInTheDocument();
      expect(screen.getByText('Tipe')).toBeInTheDocument();
      expect(screen.getByText('Nilai')).toBeInTheDocument();
      expect(screen.getByText('Penggunaan')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('displays coupon discount values correctly', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      expect(screen.getByText('20%')).toBeInTheDocument();
      expect(screen.getByText('Rp 10.000')).toBeInTheDocument();
      expect(screen.getByText('15%')).toBeInTheDocument();
    });

    it('displays usage counts correctly', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      expect(screen.getByText('5/100')).toBeInTheDocument();
      expect(screen.getByText('10/50')).toBeInTheDocument();
      expect(screen.getByText('20/20')).toBeInTheDocument();
    });

    it('displays active/inactive badges', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      const activeBadges = screen.getAllByText('Aktif');
      expect(activeBadges.length).toBe(2);
      expect(screen.getByText('Nonaktif')).toBeInTheDocument();
    });

    it('shows create coupon form when clicking Buat Kupon', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /buat kupon/i }));
      expect(screen.getByText('Kupon Baru')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('DISKON20')).toBeInTheDocument();
    });

    it('fills coupon form and submits', async () => {
      const user = userEvent.setup();
      mockCouponsCreate.mockResolvedValue({ data: {} });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /buat kupon/i }));
      await user.type(screen.getByPlaceholderText('DISKON20'), 'NEWCODE');
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'FIXED');
      await user.type(screen.getByPlaceholderText('20'), '50000');
      await user.type(screen.getByPlaceholderText('100'), '30');
      const simpanBtn = screen.getAllByText('Simpan')[0];
      await user.click(simpanBtn);
      await waitFor(() => {
        expect(mockCouponsCreate).toHaveBeenCalledWith(
          expect.objectContaining({ code: 'NEWCODE', discountType: 'FIXED' })
        );
      });
    });

    it('closes create form when clicking Batal', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /buat kupon/i }));
      expect(screen.getByText('Kupon Baru')).toBeInTheDocument();
      const batalBtns = screen.getAllByText('Batal');
      await user.click(batalBtns[batalBtns.length - 1]);
      expect(screen.queryByText('Kupon Baru')).not.toBeInTheDocument();
    });

    it('opens edit form for a coupon', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);
      expect(screen.getByText('Edit Kupon')).toBeInTheDocument();
    });

    it('fills edit form and submits', async () => {
      const user = userEvent.setup();
      mockCouponsUpdate.mockResolvedValue({ data: {} });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);
      const kodeInput = screen.getAllByPlaceholderText('DISKON20')[0];
      await user.clear(kodeInput);
      await user.type(kodeInput, 'DISKON25');
      const simpanBtn = screen.getAllByText('Simpan')[0];
      await user.click(simpanBtn);
      await waitFor(() => {
        expect(mockCouponsUpdate).toHaveBeenCalledWith('c1', expect.objectContaining({ code: 'DISKON25' }));
      });
    });

    it('deletes coupon after confirmation', async () => {
      const user = userEvent.setup();
      window.confirm = vi.fn(() => true);
      const mockDelete = providerApi.coupons.delete as ReturnType<typeof vi.fn>;
      mockDelete.mockResolvedValue({ data: {} });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      const deleteButtons = screen.getAllByText('Hapus');
      await user.click(deleteButtons[0]);
      expect(window.confirm).toHaveBeenCalledWith('Hapus kupon "DISKON20"?');
      expect(mockDelete).toHaveBeenCalledWith('c1');
    });

    it('does not delete coupon when confirmation is cancelled', async () => {
      const user = userEvent.setup();
      window.confirm = vi.fn(() => false);
      const mockDelete = providerApi.coupons.delete as ReturnType<typeof vi.fn>;
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      const deleteButtons = screen.getAllByText('Hapus');
      await user.click(deleteButtons[0]);
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('shows empty state when no coupons', async () => {
      mockCouponsList.mockResolvedValue({ data: [] });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Belum ada kupon')).toBeInTheDocument();
      });
    });

    it('shows loading state for coupons', async () => {
      mockCouponsList.mockReturnValue(new Promise(() => {}));
      renderPage();
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Campaigns tab', () => {
    it('switches to campaigns tab and shows campaign list', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Kampanye' }));
      await waitFor(() => {
        expect(screen.getByText('Promo Lebaran')).toBeInTheDocument();
      });
      expect(screen.getByText('Back to School')).toBeInTheDocument();
    });

    it('displays campaign status badges', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Kampanye' }));
      await waitFor(() => {
        expect(screen.getByText('Promo Lebaran')).toBeInTheDocument();
      });
      const activeBadges = screen.getAllByText('Aktif');
      expect(activeBadges.length).toBeGreaterThanOrEqual(1);
    });

    it('pauses active campaign', async () => {
      const user = userEvent.setup();
      mockCampaignsPause.mockResolvedValue({ data: {} });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Kampanye' }));
      await waitFor(() => {
        expect(screen.getByText('Promo Lebaran')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Jeda'));
      expect(mockCampaignsPause).toHaveBeenCalledWith('camp1');
    });

    it('activates paused campaign', async () => {
      const user = userEvent.setup();
      mockCampaignsActivate.mockResolvedValue({ data: {} });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Kampanye' }));
      await waitFor(() => {
        expect(screen.getByText('Back to School')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Aktifkan'));
      expect(mockCampaignsActivate).toHaveBeenCalledWith('camp2');
    });

    it('opens create campaign form', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Kampanye' }));
      await waitFor(() => {
        expect(screen.getByText('Promo Lebaran')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /buat kampanye/i }));
      expect(screen.getByText('Kampanye Baru')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Promo Lebaran')).toBeInTheDocument();
    });

    it('fills campaign form and submits', async () => {
      const user = userEvent.setup();
      mockCampaignsCreate.mockResolvedValue({ data: {} });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Kampanye' }));
      await waitFor(() => {
        expect(screen.getByText('Promo Lebaran')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /buat kampanye/i }));
      await user.type(screen.getByPlaceholderText('Promo Lebaran'), 'Promo Natal');
      const simpanBtn = screen.getAllByText('Simpan')[0];
      await user.click(simpanBtn);
      await waitFor(() => {
        expect(mockCampaignsCreate).toHaveBeenCalled();
      });
    });

    it('shows empty state when no campaigns', async () => {
      const user = userEvent.setup();
      mockCampaignsList.mockResolvedValue({ data: [] });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Kampanye' }));
      await waitFor(() => {
        expect(screen.getByText('Belum ada kampanye')).toBeInTheDocument();
      });
    });
  });

  describe('Loyalty tab', () => {
    it('switches to loyalty tab and shows customer list', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Loyalitas' }));
      await waitFor(() => {
        expect(screen.getByText('Siti')).toBeInTheDocument();
      });
      expect(screen.getByText('siti@gmail.com')).toBeInTheDocument();
      expect(screen.getByText('Rina')).toBeInTheDocument();
      expect(screen.getByText('rina@gmail.com')).toBeInTheDocument();
      expect(screen.getByText('Poin loyalitas pelanggan')).toBeInTheDocument();
    });

    it('displays loyalty points for each customer', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Loyalitas' }));
      await waitFor(() => {
        expect(screen.getByText('Siti')).toBeInTheDocument();
      });
      expect(screen.getByText(/\u2b50 150/)).toBeInTheDocument();
      expect(screen.getByText(/\u2b50 80/)).toBeInTheDocument();
    });

    it('opens earn points form', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Loyalitas' }));
      await waitFor(() => {
        expect(screen.getByText('Siti')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /beri poin/i }));
      expect(screen.getByText('Beri Poin Loyalitas')).toBeInTheDocument();
      expect(screen.getByText('Pilih pelanggan')).toBeInTheDocument();
    });

    it('loads loyalty history when clicking Lihat Riwayat', async () => {
      const user = userEvent.setup();
      mockLoyaltyHistory.mockResolvedValue({
        data: [
          { createdAt: '2026-09-01T10:00:00', type: 'EARN', points: 50, description: 'Booking selesai' },
          { createdAt: '2026-09-05T14:00:00', type: 'REDEEM', points: 20, description: 'Diskon booking' },
        ],
      });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Loyalitas' }));
      await waitFor(() => {
        expect(screen.getByText('Siti')).toBeInTheDocument();
      });
      const historyButtons = screen.getAllByText('Lihat Riwayat');
      await user.click(historyButtons[0]);
      await waitFor(() => {
        expect(screen.getByText('Riwayat Loyalitas')).toBeInTheDocument();
      });
      expect(mockLoyaltyHistory).toHaveBeenCalledWith('cust1');
      expect(screen.getByText('EARN')).toBeInTheDocument();
      expect(screen.getByText('REDEEM')).toBeInTheDocument();
      expect(screen.getByText('+50')).toBeInTheDocument();
      expect(screen.getByText('-20')).toBeInTheDocument();
    });

    it('submits earn points form', async () => {
      const user = userEvent.setup();
      mockLoyaltyEarn.mockResolvedValue({ data: {} });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Loyalitas' }));
      await waitFor(() => {
        expect(screen.getByText('Siti')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /beri poin/i }));
      const customerSelect = screen.getAllByRole('combobox')[0];
      await user.selectOptions(customerSelect, 'cust1');
      const simpanBtn = screen.getAllByText('Simpan')[0];
      await user.click(simpanBtn);
      await waitFor(() => {
        expect(mockLoyaltyEarn).toHaveBeenCalled();
      });
    });

    it('shows empty state when no customers in loyalty tab', async () => {
      const user = userEvent.setup();
      mockCustomersList.mockResolvedValue({ data: { data: [], pagination: { totalPages: 1 } } });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Loyalitas' }));
      await waitFor(() => {
        expect(screen.getByText('Belum ada pelanggan')).toBeInTheDocument();
      });
    });

    it('displays total bookings and total spent for customers', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Loyalitas' }));
      await waitFor(() => {
        expect(screen.getByText('Siti')).toBeInTheDocument();
      });
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Rp 250.000')).toBeInTheDocument();
    });

    it('renders all loyalty history entry types with styles', async () => {
      const user = userEvent.setup();
      mockLoyaltyHistory.mockResolvedValue({
        data: [
          { createdAt: '2026-09-01T10:00:00', type: 'EXPIRE', points: 5, description: 'Kadaluarsa' },
          { createdAt: '2026-09-02T10:00:00', type: 'ADJUST', points: 7, description: 'Penyesuaian' },
          { createdAt: null, type: 'UNKNOWN', points: 0, description: '' },
        ],
      });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Loyalitas' }));
      await waitFor(() => {
        expect(screen.getByText('Siti')).toBeInTheDocument();
      });
      await user.click(screen.getAllByText('Lihat Riwayat')[0]);
      await waitFor(() => {
        expect(screen.getByText('EXPIRE')).toBeInTheDocument();
      });
      expect(screen.getByText('ADJUST')).toBeInTheDocument();
      expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(1);
    });

    it('edits earn form fields and cancels', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Loyalitas' }));
      await waitFor(() => {
        expect(screen.getByText('Siti')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /beri poin/i }));
      const pointsInput = screen.getByDisplayValue('10') as HTMLInputElement;
      fireEvent.change(pointsInput, { target: { value: '25' } });
      expect(pointsInput.value).toBe('25');
      const descInput = screen.getByPlaceholderText('Booking selesai');
      fireEvent.change(descInput, { target: { value: 'Bonus' } });
      expect(descInput).toHaveValue('Bonus');
      await user.click(screen.getByText('Batal'));
      expect(screen.queryByText('Beri Poin Loyalitas')).not.toBeInTheDocument();
    });

    it('closes loyalty history modal', async () => {
      const user = userEvent.setup();
      mockLoyaltyHistory.mockResolvedValue({ data: [] });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Loyalitas' }));
      await waitFor(() => {
        expect(screen.getByText('Siti')).toBeInTheDocument();
      });
      await user.click(screen.getAllByText('Lihat Riwayat')[0]);
      await waitFor(() => {
        expect(screen.getByText('Belum ada riwayat poin')).toBeInTheDocument();
      });
      await user.click(screen.getByText('✕'));
      await waitFor(() => {
        expect(screen.queryByText('Riwayat Loyalitas')).not.toBeInTheDocument();
      });
    });

    it('shows earn pending state', async () => {
      const user = userEvent.setup();
      mockLoyaltyEarn.mockReturnValue(new Promise(() => {}));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Loyalitas' }));
      await waitFor(() => {
        expect(screen.getByText('Siti')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /beri poin/i }));
      const customerSelect = screen.getAllByRole('combobox')[0];
      await user.selectOptions(customerSelect, 'cust1');
      await user.click(screen.getAllByText('Simpan')[0]);
      await waitFor(() => {
        expect(screen.getByText('Menyimpan...')).toBeInTheDocument();
      });
    });

    it('edits coupon type and numeric fields in edit form', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getAllByText('Edit')[0]);
      const selects = screen.getAllByRole('combobox');
      await user.selectOptions(selects[selects.length - 1], 'FIXED');
      const numInputs = screen.getAllByPlaceholderText('20');
      fireEvent.change(numInputs[0], { target: { value: '30' } });
      const maxInputs = screen.getAllByPlaceholderText('100');
      fireEvent.change(maxInputs[0], { target: { value: '200' } });
      expect(numInputs[0]).toHaveValue(30);
    });

    it('cancels edit coupon form', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getAllByText('Edit')[0]);
      expect(screen.getByText('Edit Kupon')).toBeInTheDocument();
      const batalBtns = screen.getAllByText('Batal');
      await user.click(batalBtns[batalBtns.length - 1]);
      await waitFor(() => {
        expect(screen.queryByText('Edit Kupon')).not.toBeInTheDocument();
      });
    });

    it('changes campaign type and dates then cancels', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Kampanye' }));
      await waitFor(() => {
        expect(screen.getByText('Promo Lebaran')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /buat kampanye/i }));
      const typeSelect = screen.getByDisplayValue('Diskon');
      await user.selectOptions(typeSelect, 'REFERRAL');
      const dateInputs = document.querySelectorAll('input[type="date"]');
      fireEvent.change(dateInputs[0], { target: { value: '2026-10-01' } });
      fireEvent.change(dateInputs[1], { target: { value: '2026-10-31' } });
      expect((dateInputs[0] as HTMLInputElement).value).toBe('2026-10-01');
      const batalBtns = screen.getAllByText('Batal');
      await user.click(batalBtns[batalBtns.length - 1]);
      await waitFor(() => {
        expect(screen.queryByText('Kampanye Baru')).not.toBeInTheDocument();
      });
    });

    it('shows campaign create pending state', async () => {
      const user = userEvent.setup();
      mockCampaignsCreate.mockReturnValue(new Promise(() => {}));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Kampanye' }));
      await waitFor(() => {
        expect(screen.getByText('Promo Lebaran')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /buat kampanye/i }));
      await user.type(screen.getByPlaceholderText('Promo Lebaran'), 'X');
      await user.click(screen.getAllByText('Simpan')[0]);
      await waitFor(() => {
        expect(screen.getByText('Menyimpan...')).toBeInTheDocument();
      });
    });

    it('shows campaigns loading skeletons', async () => {
      const user = userEvent.setup();
      mockCampaignsList.mockReturnValue(new Promise(() => {}));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Kampanye' }));
      await waitFor(() => {
        expect(screen.getByText('Kelola kampanye promosi aktif')).toBeInTheDocument();
      });
      expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(1);
    });

    it('shows empty history on loyalty history failure', async () => {
      const user = userEvent.setup();
      mockLoyaltyHistory.mockRejectedValue(new Error('gagal'));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('DISKON20')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Loyalitas' }));
      await waitFor(() => {
        expect(screen.getByText('Siti')).toBeInTheDocument();
      });
      await user.click(screen.getAllByText('Lihat Riwayat')[0]);
      await waitFor(() => {
        expect(screen.getByText('Belum ada riwayat poin')).toBeInTheDocument();
      });
    });
  });
});
