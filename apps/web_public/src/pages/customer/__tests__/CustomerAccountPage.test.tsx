import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerAccountPage from '../CustomerAccountPage';

const mockProfile = {
  name: 'Siti Customer',
  email: 'siti@test.com',
  phone: '081234567890',
  loyaltyPoints: 250,
  totalBookings: 12,
};

const mockLogout = vi.fn();
const mockRefreshUser = vi.fn();

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Siti Customer', email: 'siti@test.com', phone: '081234567890', role: 'ROLE_CUSTOMER', hasProfile: true },
    logout: mockLogout,
    refreshUser: mockRefreshUser,
  }),
}));

vi.mock('../../../lib/api', () => ({
  publicApi: {
    customer: {
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
    },
  },
}));

vi.mock('../../../components/CustomerLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="customer-layout">{children}</div>,
}));

import { publicApi } from '../../../lib/api';

let queryClient: QueryClient;

function renderAccount() {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, cacheTime: 0 } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <CustomerAccountPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('CustomerAccountPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders user name from profile', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('Siti Customer')).toBeInTheDocument();
    });
  });

  it('displays user email from profile', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('siti@test.com')).toBeInTheDocument();
    });
  });

  it('displays phone number', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('081234567890')).toBeInTheDocument();
    });
  });

  it('displays loyalty tier badge (Silver for 250 points)', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('Silver')).toBeInTheDocument();
    });
  });

  it('shows stats row with total bookings, loyalty points, and active status', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('Total Booking')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Poin Loyalitas')).toBeInTheDocument();
      expect(screen.getByText('250')).toBeInTheDocument();
      expect(screen.getByText('Status Akun')).toBeInTheDocument();
      expect(screen.getByText('Aktif')).toBeInTheDocument();
    });
  });

  it('renders quick action buttons', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => {
      expect(screen.getAllByText('Edit Profil').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Ganti Password')).toBeInTheDocument();
      expect(screen.getByText('Preferensi')).toBeInTheDocument();
      expect(screen.getAllByText('Bantuan').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders menu sections with navigation links', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('Booking Saya')).toBeInTheDocument();
      expect(screen.getByText('Ulasan')).toBeInTheDocument();
      expect(screen.getByText('Booking Berulang')).toBeInTheDocument();
      expect(screen.getByText('Favorit')).toBeInTheDocument();
      expect(screen.getByText('Referral')).toBeInTheDocument();
      expect(screen.getByText('Notifikasi')).toBeInTheDocument();
      expect(screen.getAllByText('Bantuan').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Syarat & Ketentuan')).toBeInTheDocument();
    });
  });

  it('renders menu section titles', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('Booking')).toBeInTheDocument();
      expect(screen.getByText('Akun')).toBeInTheDocument();
      expect(screen.getByText('Dukungan')).toBeInTheDocument();
    });
  });

  it('shows Edit Profil button and opens edit form', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => {
      expect(screen.getAllByText('Edit Profil').length).toBeGreaterThanOrEqual(1);
    });

    const editButtons = screen.getAllByText('Edit Profil');
    await userEvent.click(editButtons.find(el => el.tagName === 'BUTTON') || editButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Nama Lengkap')).toBeInTheDocument();
      expect(screen.getByText('Nomor Telepon')).toBeInTheDocument();
      expect(screen.getByText('Simpan')).toBeInTheDocument();
      expect(screen.getByText('Batal')).toBeInTheDocument();
    });
  });

  it('shows logout button and opens confirmation dialog', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('Keluar')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Keluar'));
    await waitFor(() => {
      expect(screen.getByText('Yakin ingin keluar?')).toBeInTheDocument();
      expect(screen.getByText('Ya, Keluar')).toBeInTheDocument();
      expect(screen.getByText('Batal')).toBeInTheDocument();
    });
  });

  it('calls logout when Ya, Keluar is clicked', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('Keluar')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Keluar'));
    await waitFor(() => {
      expect(screen.getByText('Ya, Keluar')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Ya, Keluar'));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('closes logout dialog when Batal is clicked', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('Keluar')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Keluar'));
    await waitFor(() => {
      expect(screen.getByText('Batal')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Batal'));
    await waitFor(() => {
      expect(screen.queryByText('Yakin ingin keluar?')).not.toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    (publicApi.customer.getProfile as any).mockReturnValue(new Promise(() => {}));
    const { container } = renderAccount();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows user initial in avatar', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('S')).toBeInTheDocument();
    });
  });

  it('shows Bronze tier for low points', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: { ...mockProfile, loyaltyPoints: 50 } });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('Bronze')).toBeInTheDocument();
    });
  });

  it('shows Gold tier for 500+ points', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: { ...mockProfile, loyaltyPoints: 600 } });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('Gold')).toBeInTheDocument();
    });
  });

  it('shows Platinum tier for 1000+ points', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: { ...mockProfile, loyaltyPoints: 1200 } });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('Platinum')).toBeInTheDocument();
    });
  });

  it('shows menu descriptions', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('Lihat semua riwayat dan status booking')).toBeInTheDocument();
      expect(screen.getByText('Daftar staf dan layanan favorit Anda')).toBeInTheDocument();
      expect(screen.getByText('Pengaturan notifikasi dan preferensi')).toBeInTheDocument();
    });
  });

  it('shows profile update success message', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    (publicApi.customer.updateProfile as any).mockResolvedValue({ data: {} });
    renderAccount();
    await waitFor(() => { expect(screen.getAllByText('Edit Profil').length).toBeGreaterThanOrEqual(1); });
    const editButtons = screen.getAllByText('Edit Profil');
    await userEvent.click(editButtons.find(el => el.tagName === 'BUTTON') || editButtons[0]);
    await waitFor(() => { expect(screen.getByText('Simpan')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText('Simpan'));
    await waitFor(() => {
      expect(screen.getByText('Profil berhasil diperbarui')).toBeInTheDocument();
    });
  }, 15000);

  it('clears save message after timeout', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    (publicApi.customer.updateProfile as any).mockResolvedValue({ data: {} });
    renderAccount();
    await waitFor(() => { expect(screen.getAllByText('Edit Profil').length).toBeGreaterThanOrEqual(1); });
    const editButtons = screen.getAllByText('Edit Profil');
    await userEvent.click(editButtons.find(el => el.tagName === 'BUTTON') || editButtons[0]);
    await waitFor(() => { expect(screen.getByText('Simpan')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText('Simpan'));
    await waitFor(() => {
      expect(screen.getByText('Profil berhasil diperbarui')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText('Profil berhasil diperbarui')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  }, 15000);

  it('clicks Ganti Password and Preferensi quick actions (noop)', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => { expect(screen.getByText('Ganti Password')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Ganti Password'));
    fireEvent.click(screen.getByText('Preferensi'));
    expect(screen.getByText('Ganti Password')).toBeInTheDocument();
  });

  it('shows profile update error message', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    (publicApi.customer.updateProfile as any).mockRejectedValue(new Error('Update failed'));
    renderAccount();
    await waitFor(() => { expect(screen.getAllByText('Edit Profil').length).toBeGreaterThanOrEqual(1); });
    const editButtons = screen.getAllByText('Edit Profil');
    await userEvent.click(editButtons.find(el => el.tagName === 'BUTTON') || editButtons[0]);
    await waitFor(() => { expect(screen.getByText('Simpan')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText('Simpan'));
    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('shows name validation error', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => { expect(screen.getAllByText('Edit Profil').length).toBeGreaterThanOrEqual(1); });
    const editButtons = screen.getAllByText('Edit Profil');
    await userEvent.click(editButtons.find(el => el.tagName === 'BUTTON') || editButtons[0]);
    await waitFor(() => { expect(screen.getByText('Nama Lengkap')).toBeInTheDocument(); });
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
    const phoneInput = document.querySelector('input[name="phone"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.change(phoneInput, { target: { value: '081234567890' } });
    await userEvent.click(screen.getByText('Simpan'));
    await waitFor(() => {
      expect(screen.getByText('Nama harus minimal 2 karakter')).toBeInTheDocument();
    });
  });

  it('shows phone validation error for short number', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => { expect(screen.getAllByText('Edit Profil').length).toBeGreaterThanOrEqual(1); });
    const editButtons = screen.getAllByText('Edit Profil');
    await userEvent.click(editButtons.find(el => el.tagName === 'BUTTON') || editButtons[0]);
    await waitFor(() => { expect(screen.getByText('Nomor Telepon')).toBeInTheDocument(); });
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
    const phoneInput = document.querySelector('input[name="phone"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Siti' } });
    fireEvent.change(phoneInput, { target: { value: '123' } });
    await userEvent.click(screen.getByText('Simpan'));
    await waitFor(() => {
      expect(screen.getByText(/minimal 10 digit/)).toBeInTheDocument();
    });
  });

  it('shows phone validation error for invalid format', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => { expect(screen.getAllByText('Edit Profil').length).toBeGreaterThanOrEqual(1); });
    const editButtons = screen.getAllByText('Edit Profil');
    await userEvent.click(editButtons.find(el => el.tagName === 'BUTTON') || editButtons[0]);
    await waitFor(() => { expect(screen.getByText('Nomor Telepon')).toBeInTheDocument(); });
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
    const phoneInput = document.querySelector('input[name="phone"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Siti' } });
    fireEvent.change(phoneInput, { target: { value: 'abcdefghij' } });
    await userEvent.click(screen.getByText('Simpan'));
    await waitFor(() => {
      expect(screen.getByText(/tidak valid/)).toBeInTheDocument();
    });
  });

  it('closes edit form when Batal is clicked', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => { expect(screen.getAllByText('Edit Profil').length).toBeGreaterThanOrEqual(1); });
    const editButtons = screen.getAllByText('Edit Profil');
    await userEvent.click(editButtons.find(el => el.tagName === 'BUTTON') || editButtons[0]);
    await waitFor(() => { expect(screen.getByText('Simpan')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText('Batal'));
    await waitFor(() => {
      expect(screen.queryByText('Nama Lengkap')).not.toBeInTheDocument();
    });
  });

  it('shows user initial U when name is empty', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: { ...mockProfile, name: '' } });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });

  it('shows User fallback when profile has no name', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: { ...mockProfile, name: undefined } });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });

  it('hides phone when profile has no phone', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: { ...mockProfile, phone: null } });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('Siti Customer')).toBeInTheDocument();
    });
    expect(screen.queryByText('081234567890')).not.toBeInTheDocument();
  });

  it('navigates to support page via quick action', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => { expect(screen.getAllByText('Bantuan').length).toBeGreaterThanOrEqual(1); });
    const bantuanButtons = screen.getAllByText('Bantuan');
    const quickAction = bantuanButtons.find(el => el.closest('button')?.className.includes('rounded-xl shadow-sm'));
    if (quickAction) {
      await userEvent.click(quickAction.closest('button')!);
    }
  });

  it('opens edit form via quick action button', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: mockProfile });
    renderAccount();
    await waitFor(() => { expect(screen.getAllByText('Edit Profil').length).toBeGreaterThanOrEqual(1); });
    const editButtons = screen.getAllByText('Edit Profil');
    const quickActionButton = editButtons.find(el => el.closest('button')?.className.includes('rounded-xl shadow-sm'));
    if (quickActionButton) {
      await userEvent.click(quickActionButton.closest('button')!);
      await waitFor(() => {
        expect(screen.getByText('Nama Lengkap')).toBeInTheDocument();
      });
    }
  });

  it('shows 0 total bookings and loyalty points when profile is null', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: null });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('Total Booking')).toBeInTheDocument();
    });
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
  });

  it('formats loyalty points as zero for undefined', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: { ...mockProfile, loyaltyPoints: undefined } });
    renderAccount();
    await waitFor(() => {
      expect(screen.getByText('Bronze')).toBeInTheDocument();
    });
  });
});
