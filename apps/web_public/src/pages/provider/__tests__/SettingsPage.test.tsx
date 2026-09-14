import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsPage from '../SettingsPage';

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

vi.mock('../../../lib/api', () => ({
  providerApi: {
    settings: { get: vi.fn(), update: vi.fn() },
    blockedDates: { list: vi.fn(), add: vi.fn(), remove: vi.fn() },
  },
}));

vi.mock('../../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="provider-layout">{children}</div>,
}));

import { providerApi } from '../../../lib/api';

const mockSettingsGet = providerApi.settings.get as ReturnType<typeof vi.fn>;
const mockSettingsUpdate = providerApi.settings.update as ReturnType<typeof vi.fn>;
const mockBlockedList = providerApi.blockedDates.list as ReturnType<typeof vi.fn>;
const mockBlockedAdd = providerApi.blockedDates.add as ReturnType<typeof vi.fn>;
const mockBlockedRemove = providerApi.blockedDates.remove as ReturnType<typeof vi.fn>;

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
}

function renderPage(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <SettingsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const settingsData = {
  businessName: 'Barbershop Central',
  description: 'Best barbershop in town',
  phone: '081234567890',
  email: 'info@barbershop.id',
  address: 'Jl. Sudirman No. 1',
  autoConfirm: true,
  depositRequired: false,
  cancellationPolicy: 'Free cancellation up to 24 hours',
  operatingHours: [
    { dayOfWeek: 0, open: '10:00', close: '18:00', isClosed: true },
    { dayOfWeek: 1, open: '09:00', close: '17:00', isClosed: false },
    { dayOfWeek: 2, open: '09:00', close: '17:00', isClosed: false },
    { dayOfWeek: 3, open: '09:00', close: '17:00', isClosed: false },
    { dayOfWeek: 4, open: '09:00', close: '17:00', isClosed: false },
    { dayOfWeek: 5, open: '09:00', close: '17:00', isClosed: false },
    { dayOfWeek: 6, open: '10:00', close: '16:00', isClosed: false },
  ],
  notifications: {
    emailBookingConfirmation: true,
    emailBookingReminder: true,
    smsBookingReminder: false,
  },
};

const blockedDates = [
  { date: '2026-12-25', reason: 'Christmas' },
  { date: '2026-01-01', reason: 'New Year' },
];

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSettingsGet.mockResolvedValue({ data: settingsData });
    mockBlockedList.mockResolvedValue({ data: blockedDates });
  });

  it('renders heading and ProviderLayout', async () => {
    renderPage();
    expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /pengaturan/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/kelola profil bisnis dan preferensi/i)).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    mockSettingsGet.mockReturnValue(new Promise(() => {}));
    renderPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders business profile form with prefilled values', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Barbershop Central')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('Best barbershop in town')).toBeInTheDocument();
    expect(screen.getByDisplayValue('081234567890')).toBeInTheDocument();
    expect(screen.getByDisplayValue('info@barbershop.id')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Jl. Sudirman No. 1')).toBeInTheDocument();
  });

  it('renders form labels', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Barbershop Central')).toBeInTheDocument();
    });
    expect(screen.getByText('Nama Bisnis')).toBeInTheDocument();
    expect(screen.getByText('Deskripsi')).toBeInTheDocument();
    expect(screen.getByText('Telepon')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Alamat')).toBeInTheDocument();
  });

  it('renders operating hours section', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Barbershop Central')).toBeInTheDocument();
    });
    expect(screen.getByText('Jam Operasional')).toBeInTheDocument();
    expect(screen.getByText('Minggu')).toBeInTheDocument();
    expect(screen.getByText('Senin')).toBeInTheDocument();
    expect(screen.getByText('Sabtu')).toBeInTheDocument();
  });

  it('renders booking policy section', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Barbershop Central')).toBeInTheDocument();
    });
    expect(screen.getByText('Kebijakan Booking')).toBeInTheDocument();
    expect(screen.getByText('Konfirmasi otomatis')).toBeInTheDocument();
    expect(screen.getByText('Wajib deposit')).toBeInTheDocument();
    expect(screen.getByText('Kebijakan Pembatalan')).toBeInTheDocument();
  });

  it('renders notifications section', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Barbershop Central')).toBeInTheDocument();
    });
    expect(screen.getByText('Notifikasi')).toBeInTheDocument();
    expect(screen.getByText('Email konfirmasi booking')).toBeInTheDocument();
    expect(screen.getByText('Email pengingat booking')).toBeInTheDocument();
    expect(screen.getByText('SMS pengingat booking')).toBeInTheDocument();
  });

  it('renders blocked dates section', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Barbershop Central')).toBeInTheDocument();
    });
    expect(screen.getByText('Tanggal Blokir')).toBeInTheDocument();
    expect(screen.getByText(/tutup booking pada tanggal tertentu/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('2026-12-25')).toBeInTheDocument();
    });
    expect(screen.getByText(/Christmas/)).toBeInTheDocument();
    expect(screen.getByText('2026-01-01')).toBeInTheDocument();
    expect(screen.getByText(/New Year/)).toBeInTheDocument();
  });

  it('adds blocked date', async () => {
    const user = userEvent.setup();
    mockBlockedAdd.mockResolvedValue({ data: {} });
    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Barbershop Central')).toBeInTheDocument();
    });
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const blockedDateInput = dateInputs[dateInputs.length - 1];
    await user.type(blockedDateInput, '2026-12-26');
    const reasonInput = screen.getByPlaceholderText('Alasan (opsional)');
    await user.type(reasonInput, 'Holiday');
    await user.click(screen.getByRole('button', { name: /blokir/i }));
    await waitFor(() => {
      expect(mockBlockedAdd).toHaveBeenCalled();
    });
  });

  it('removes blocked date', async () => {
    const user = userEvent.setup();
    mockBlockedRemove.mockResolvedValue({ data: {} });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('2026-12-25')).toBeInTheDocument();
    });
    const removeButtons = screen.getAllByText('Hapus');
    await user.click(removeButtons[0]);
    await waitFor(() => {
      expect(mockBlockedRemove).toHaveBeenCalledWith('2026-12-25');
    });
  });

  it('shows save button', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Barbershop Central')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /simpan pengaturan/i })).toBeInTheDocument();
  });

  it('submits settings form', async () => {
    const user = userEvent.setup();
    mockSettingsUpdate.mockResolvedValue({ data: {} });
    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Barbershop Central')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /simpan pengaturan/i }));
    await waitFor(() => {
      expect(mockSettingsUpdate).toHaveBeenCalled();
    });
  });

  it('renders empty blocked dates state', async () => {
    mockBlockedList.mockResolvedValue({ data: [] });
    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Barbershop Central')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Belum ada tanggal diblokir')).toBeInTheDocument();
    });
  });
});
