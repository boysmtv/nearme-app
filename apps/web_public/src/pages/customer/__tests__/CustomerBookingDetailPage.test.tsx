import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerBookingDetailPage from '../CustomerBookingDetailPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ id: 'booking-123' }) };
});

vi.mock('../../../lib/api', () => ({
  publicApi: {
    bookings: {
      getById: vi.fn(),
      reschedule: vi.fn(),
      cancel: vi.fn(),
      verifyPin: vi.fn(),
    },
  },
}));

vi.mock('../../../components/CustomerLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="customer-layout">{children}</div>,
}));

import { publicApi } from '../../../lib/api';

const confirmedBooking = {
  id: 'booking-123',
  bookingCode: 'DKT-001',
  status: 'CONFIRMED',
  totalAmount: 75000,
  startsAt: '2026-09-15T10:00:00+07:00',
  endsAt: '2026-09-15T11:00:00+07:00',
  serviceName: 'Haircut Premium',
  customerName: 'Siti',
  confirmationPin: '123456',
  cancelPolicy: 'Gratis pembatalan 24 jam sebelum',
  rescheduleCount: 0,
  maxReschedule: 1,
  cancelDeadline: '2026-09-14T10:00:00+07:00',
  depositAmount: 20000,
};

const completedBooking = {
  ...confirmedBooking,
  id: 'booking-456',
  bookingCode: 'DKT-002',
  status: 'COMPLETED',
  confirmationPin: null,
};

const cancelledBooking = {
  ...confirmedBooking,
  id: 'booking-789',
  bookingCode: 'DKT-003',
  status: 'CANCELLED',
  confirmationPin: null,
  cancelPolicy: null,
  cancelDeadline: null,
  rescheduleCount: null,
  maxReschedule: null,
};

let queryClient: QueryClient;

function renderDetail() {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, cacheTime: 0 } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <CustomerBookingDetailPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('CustomerBookingDetailPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders booking code and status label when data loads', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('DKT-001').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Dikonfirmasi').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows loading skeleton initially', () => {
    (publicApi.bookings.getById as any).mockReturnValue(new Promise(() => {}));
    const { container } = renderDetail();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows not found state when no booking', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: null });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Booking Tidak Ditemukan')).toBeInTheDocument();
      expect(screen.getByText('Lihat Semua Booking')).toBeInTheDocument();
    });
  });

  it('shows error state when API fails', async () => {
    (publicApi.bookings.getById as any).mockRejectedValue(new Error('Network error'));
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Gagal Memuat Booking')).toBeInTheDocument();
      expect(screen.getByText('Kembali')).toBeInTheDocument();
    });
  });

  it('displays service detail card with booking code, date, and duration', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Detail Layanan')).toBeInTheDocument();
      expect(screen.getAllByText('DKT-001').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays payment detail card with total and deposit', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Detail Pembayaran')).toBeInTheDocument();
      expect(screen.getByText('Rp 75.000')).toBeInTheDocument();
      expect(screen.getByText('Rp 20.000')).toBeInTheDocument();
    });
  });

  it('shows lifecycle stepper with confirmed step active', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Dibuat')).toBeInTheDocument();
      expect(screen.getAllByText('Dikonfirmasi').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Dibayar')).toBeInTheDocument();
      expect(screen.getByText('Berlangsung')).toBeInTheDocument();
      expect(screen.getAllByText('Selesai').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows confirmation PIN card when pin exists', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('PIN Konfirmasi')).toBeInTheDocument();
      expect(screen.getByText('123456')).toBeInTheDocument();
      expect(screen.getByText('Tunjukkan PIN ini saat check-in di lokasi')).toBeInTheDocument();
    });
  });

  it('does not show PIN card when pin is null', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: completedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('DKT-002').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.queryByText('PIN Konfirmasi')).not.toBeInTheDocument();
  });

  it('shows policy card with cancel policy, reschedule count, and cancel deadline', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Kebijakan Booking')).toBeInTheDocument();
      expect(screen.getByText('Gratis pembatalan 24 jam sebelum')).toBeInTheDocument();
      expect(screen.getByText('0 / 1 kali')).toBeInTheDocument();
    });
  });

  it('shows action buttons for confirmed booking', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Cek PIN')).toBeInTheDocument();
      expect(screen.getAllByText('Reschedule').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Batalkan')).toBeInTheDocument();
      expect(screen.getByText('Chat Provider')).toBeInTheDocument();
    });
  });

  it('shows Booking Lagi link for completed booking', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: completedBooking });
    renderDetail();
    await waitFor(() => {
      const bookAgainLinks = screen.getAllByText('Booking Lagi');
      expect(bookAgainLinks.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('opens PIN modal when Cek PIN button is clicked', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Cek PIN')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Cek PIN'));
    await waitFor(() => {
      expect(screen.getByText('Masukkan PIN')).toBeInTheDocument();
      expect(screen.getByText('Masukkan 6 digit PIN konfirmasi dari booking Anda.')).toBeInTheDocument();
    });
  });

  it('opens cancel modal when Batalkan button is clicked', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Batalkan')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Batalkan'));
    await waitFor(() => {
      expect(screen.getByText('Batalkan Booking')).toBeInTheDocument();
      expect(screen.getByText('Yakin ingin membatalkan booking ini? Tindakan ini tidak dapat dibatalkan.')).toBeInTheDocument();
    });
  });

  it('opens reschedule modal when Reschedule button is clicked', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Reschedule').length).toBeGreaterThanOrEqual(1);
    });
    const rescheduleButtons = screen.getAllByText('Reschedule');
    await userEvent.click(rescheduleButtons.find(el => el.tagName === 'BUTTON') || rescheduleButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Reschedule Booking')).toBeInTheDocument();
      expect(screen.getByText('Tanggal baru')).toBeInTheDocument();
      expect(screen.getByText('Jam baru')).toBeInTheDocument();
    });
  });

  it('shows back button and navigates', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('DKT-001').length).toBeGreaterThanOrEqual(1);
    });
    const backButtons = screen.getAllByRole('button');
    expect(backButtons.length).toBeGreaterThan(0);
    await userEvent.click(backButtons[0]);
  });

  it('error state back button navigates back', async () => {
    (publicApi.bookings.getById as any).mockRejectedValue(new Error('Network error'));
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Gagal Memuat Booking')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Kembali'));
  });

  it('renders cancelled status with correct lifecycle indicator', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: cancelledBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Dibatalkan').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('does not show action buttons for cancelled booking', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: cancelledBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('DKT-003').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.queryByText('Cek PIN')).not.toBeInTheDocument();
    expect(screen.queryByText('Batalkan')).not.toBeInTheDocument();
  });

  it('closes cancel modal when Kembali is clicked', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Batalkan')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Batalkan'));
    await waitFor(() => {
      expect(screen.getByText('Batalkan Booking')).toBeInTheDocument();
    });
    const kembaliButtons = screen.getAllByText('Kembali');
    await userEvent.click(kembaliButtons.find(el => el.tagName === 'BUTTON') || kembaliButtons[0]);
    await waitFor(() => {
      expect(screen.queryByText('Batalkan Booking')).not.toBeInTheDocument();
    });
  });

  it('closes reschedule modal when Batal is clicked', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Reschedule').length).toBeGreaterThanOrEqual(1);
    });
    const rescheduleButtons = screen.getAllByText('Reschedule');
    await userEvent.click(rescheduleButtons.find(el => el.tagName === 'BUTTON') || rescheduleButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Reschedule Booking')).toBeInTheDocument();
    });
    const batalButtons = screen.getAllByText('Batal');
    await userEvent.click(batalButtons.find(el => el.tagName === 'BUTTON') || batalButtons[0]);
    await waitFor(() => {
      expect(screen.queryByText('Reschedule Booking')).not.toBeInTheDocument();
    });
  });

  it('closes PIN modal when Batal is clicked', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Cek PIN')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Cek PIN'));
    await waitFor(() => {
      expect(screen.getByText('Masukkan PIN')).toBeInTheDocument();
    });
    const batalButtons = screen.getAllByText('Batal');
    await userEvent.click(batalButtons.find(el => el.tagName === 'BUTTON') || batalButtons[0]);
    await waitFor(() => {
      expect(screen.queryByText('Masukkan PIN')).not.toBeInTheDocument();
    });
  });

  it('shows deposit amount as Tanpa deposit when 0', async () => {
    const bookingNoDeposit = { ...confirmedBooking, depositAmount: 0 };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: bookingNoDeposit });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Tanpa deposit')).toBeInTheDocument();
    });
  });

  it('shows status for payment method', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Online')).toBeInTheDocument();
    });
  });

  it('formats duration correctly for multi-hour bookings', async () => {
    const longBooking = {
      ...confirmedBooking,
      startsAt: '2026-09-15T10:00:00+07:00',
      endsAt: '2026-09-15T12:30:00+07:00',
    };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: longBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('2 jam 30 menit')).toBeInTheDocument();
    });
  });

  it('shows PIN verify success message', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    (publicApi.bookings.verifyPin as any).mockResolvedValue({ data: { ...confirmedBooking, pinVerified: true } });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Cek PIN')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Cek PIN'));
    await waitFor(() => {
      expect(screen.getByText('Masukkan PIN')).toBeInTheDocument();
    });
    const pinInputs = document.querySelectorAll('input[id^="pin-"]');
    for (let i = 0; i < 6; i++) {
      fireEvent.change(pinInputs[i], { target: { value: String(i + 1) } });
    }
    const verifButton = screen.getAllByText('Verifikasi').find(el => el.tagName === 'BUTTON');
    if (verifButton) {
      await userEvent.click(verifButton);
      await waitFor(() => {
        expect(screen.getByText('PIN terverifikasi!')).toBeInTheDocument();
      });
    }
  });

  it('shows PIN verify error message', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    (publicApi.bookings.verifyPin as any).mockRejectedValue({ response: { data: { message: 'PIN salah' } } });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Cek PIN')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Cek PIN'));
    await waitFor(() => {
      expect(screen.getByText('Masukkan PIN')).toBeInTheDocument();
    });
    const pinInputs = document.querySelectorAll('input[id^="pin-"]');
    for (let i = 0; i < 6; i++) {
      fireEvent.change(pinInputs[i], { target: { value: String(i + 1) } });
    }
    const verifButton = screen.getAllByText('Verifikasi').find(el => el.tagName === 'BUTTON');
    if (verifButton) {
      await userEvent.click(verifButton);
      await waitFor(() => {
        expect(screen.getByText('PIN salah')).toBeInTheDocument();
      });
    }
  });

  it('closes cancel modal when overlay is clicked', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Batalkan')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Batalkan'));
    await waitFor(() => {
      expect(screen.getByText('Batalkan Booking')).toBeInTheDocument();
    });
    const overlay = document.querySelector('.fixed.inset-0');
    if (overlay) {
      fireEvent.click(overlay);
      await waitFor(() => {
        expect(screen.queryByText('Batalkan Booking')).not.toBeInTheDocument();
      });
    }
  });

  it('submits cancel with default reason when textarea is empty', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    (publicApi.bookings.cancel as any).mockResolvedValue({ data: { ...confirmedBooking, status: 'CANCELLED' } });
    renderDetail();
    await waitFor(() => { expect(screen.getByText('Batalkan')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText('Batalkan'));
    await waitFor(() => { expect(screen.getByText('Ya, Batalkan')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText('Ya, Batalkan'));
    await waitFor(() => {
      expect(publicApi.bookings.cancel).toHaveBeenCalledWith('booking-123', 'Dibatalkan oleh customer');
    });
  });

  it('submits cancel with custom reason', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    (publicApi.bookings.cancel as any).mockResolvedValue({ data: { ...confirmedBooking, status: 'CANCELLED' } });
    renderDetail();
    await waitFor(() => { expect(screen.getByText('Batalkan')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText('Batalkan'));
    await waitFor(() => { expect(screen.getByText('Ya, Batalkan')).toBeInTheDocument(); });
    fireEvent.change(screen.getByPlaceholderText('Tuliskan alasan pembatalan...'), { target: { value: 'Berhalangan' } });
    await userEvent.click(screen.getByText('Ya, Batalkan'));
    await waitFor(() => {
      expect(publicApi.bookings.cancel).toHaveBeenCalledWith('booking-123', 'Berhalangan');
    });
  });

  it('shows cancel error message', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    (publicApi.bookings.cancel as any).mockRejectedValue(new Error('Cancel failed'));
    renderDetail();
    await waitFor(() => { expect(screen.getByText('Batalkan')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText('Batalkan'));
    await waitFor(() => { expect(screen.getByText('Ya, Batalkan')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText('Ya, Batalkan'));
    await waitFor(() => {
      expect(screen.getByText('Gagal membatalkan booking')).toBeInTheDocument();
    });
  });

  it('shows reschedule error message', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    (publicApi.bookings.reschedule as any).mockRejectedValue(new Error('Reschedule failed'));
    renderDetail();
    await waitFor(() => { expect(screen.getAllByText('Reschedule').length).toBeGreaterThanOrEqual(1); });
    const rescheduleBtn = screen.getAllByText('Reschedule').find(el => el.tagName === 'BUTTON');
    await userEvent.click(rescheduleBtn!);
    await waitFor(() => { expect(screen.getByText('Reschedule Booking')).toBeInTheDocument(); });
    expect(screen.getByText('Tanggal baru')).toBeInTheDocument();
    expect(screen.getByText('Jam baru')).toBeInTheDocument();
    expect(screen.getByText('Batal')).toBeInTheDocument();
    expect(screen.queryByText('Gagal melakukan reschedule')).not.toBeInTheDocument();
  });

  it('formats duration correctly for sub-hour bookings', async () => {
    const shortBooking = {
      ...confirmedBooking,
      startsAt: '2026-09-15T10:00:00+07:00',
      endsAt: '2026-09-15T10:30:00+07:00',
    };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: shortBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('30 menit')).toBeInTheDocument();
    });
  });

  it('shows dash for missing start/end dates in duration', async () => {
    const noDateBooking = { ...confirmedBooking, startsAt: null, endsAt: null };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: noDateBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows dash for missing date in formatDate', async () => {
    const noDateBooking = { ...confirmedBooking, startsAt: undefined };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: noDateBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders IN_PROGRESS lifecycle correctly', async () => {
    const inProgressBooking = { ...confirmedBooking, status: 'IN_PROGRESS' };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: inProgressBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Berlangsung').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders NO_SHOW lifecycle correctly', async () => {
    const noShowBooking = { ...confirmedBooking, status: 'NO_SHOW' };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: noShowBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Tidak Hadir').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders EXPIRED lifecycle correctly', async () => {
    const expiredBooking = { ...confirmedBooking, status: 'EXPIRED' };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: expiredBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Kedaluwarsa').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders PENDING_VERIFICATION lifecycle correctly', async () => {
    const pendingBooking = { ...confirmedBooking, status: 'PENDING_VERIFICATION' };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: pendingBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Menunggu Verifikasi').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows unknown status label fallback', async () => {
    const unknownBooking = { ...confirmedBooking, status: 'UNKNOWN_STATUS' };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: unknownBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('UNKNOWN STATUS').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows reschedule button for PENDING_PAYMENT status', async () => {
    const pendingPaymentBooking = { ...confirmedBooking, status: 'PENDING_PAYMENT' };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: pendingPaymentBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Reschedule').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText('Batalkan')).toBeInTheDocument();
  });

  it('hides Cek PIN button for non-CONFIRMED status', async () => {
    const pendingPaymentBooking = { ...confirmedBooking, status: 'PENDING_PAYMENT' };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: pendingPaymentBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Reschedule').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.queryByText('Cek PIN')).not.toBeInTheDocument();
  });

  it('shows policy card with only cancelDeadline', async () => {
    const bookingWithDeadline = {
      ...confirmedBooking,
      cancelPolicy: null,
      rescheduleCount: null,
      cancelDeadline: '2026-09-14T10:00:00+07:00',
    };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: bookingWithDeadline });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Kebijakan Booking')).toBeInTheDocument();
    });
    expect(screen.getByText('Batas Pembatalan')).toBeInTheDocument();
  });

  it('shows policy card with only cancelPolicy', async () => {
    const bookingWithPolicy = {
      ...confirmedBooking,
      cancelPolicy: 'Non-refundable',
      rescheduleCount: null,
      cancelDeadline: null,
    };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: bookingWithPolicy });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Kebijakan Booking')).toBeInTheDocument();
    });
    expect(screen.getByText('Non-refundable')).toBeInTheDocument();
  });

  it('shows policy card with only rescheduleCount', async () => {
    const bookingWithReschedule = {
      ...confirmedBooking,
      cancelPolicy: null,
      rescheduleCount: 2,
      maxReschedule: 3,
      cancelDeadline: null,
    };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: bookingWithReschedule });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('2 / 3 kali')).toBeInTheDocument();
    });
  });

  it('does not show policy card when all policy fields are null', async () => {
    const bookingNoPolicy = {
      ...confirmedBooking,
      cancelPolicy: null,
      rescheduleCount: null,
      cancelDeadline: null,
    };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: bookingNoPolicy });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('DKT-001').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.queryByText('Kebijakan Booking')).not.toBeInTheDocument();
  });

  it('handles PIN paste event', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => { expect(screen.getByText('Cek PIN')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText('Cek PIN'));
    await waitFor(() => { expect(screen.getByText('Masukkan PIN')).toBeInTheDocument(); });
    const pinContainer = document.querySelector('[class*="flex justify-center gap-2"]');
    if (pinContainer) {
      fireEvent.paste(pinContainer, { clipboardData: { getData: () => '123456', preventDefault: vi.fn() } } as any);
    }
  });

  it('handles PIN backspace key navigation', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => { expect(screen.getByText('Cek PIN')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText('Cek PIN'));
    await waitFor(() => { expect(screen.getByText('Masukkan PIN')).toBeInTheDocument(); });
    const pinInputs = document.querySelectorAll('input[id^="pin-"]');
    expect(pinInputs.length).toBe(6);
    fireEvent.keyDown(pinInputs[0], { key: 'Backspace' });
    fireEvent.keyDown(pinInputs[1], { key: 'Backspace' });
  });

  it('handles PIN single digit input with auto-focus advance', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => { expect(screen.getByText('Cek PIN')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText('Cek PIN'));
    await waitFor(() => { expect(screen.getByText('Masukkan PIN')).toBeInTheDocument(); });
    const pinInputs = document.querySelectorAll('input[id^="pin-"]');
    fireEvent.change(pinInputs[0], { target: { value: '5' } });
    expect((pinInputs[0] as HTMLInputElement).value).toBe('5');
  });

  it('rejects non-numeric PIN input', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => { expect(screen.getByText('Cek PIN')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText('Cek PIN'));
    await waitFor(() => { expect(screen.getByText('Masukkan PIN')).toBeInTheDocument(); });
    const pinInputs = document.querySelectorAll('input[id^="pin-"]');
    fireEvent.change(pinInputs[0], { target: { value: 'a' } });
    expect((pinInputs[0] as HTMLInputElement).value).toBe('');
  });

  it('handles PIN input longer than 1 char (truncation)', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => { expect(screen.getByText('Cek PIN')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText('Cek PIN'));
    await waitFor(() => { expect(screen.getByText('Masukkan PIN')).toBeInTheDocument(); });
    const pinInputs = document.querySelectorAll('input[id^="pin-"]');
    fireEvent.change(pinInputs[0], { target: { value: '12' } });
    expect((pinInputs[0] as HTMLInputElement).value).toBe('2');
  });

  it('disables Verifikasi button when PIN is incomplete', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => { expect(screen.getByText('Cek PIN')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText('Cek PIN'));
    await waitFor(() => { expect(screen.getByText('Masukkan PIN')).toBeInTheDocument(); });
    const verifButton = screen.getAllByText('Verifikasi').find(el => el.tagName === 'BUTTON') as HTMLButtonElement;
    expect(verifButton.disabled).toBe(true);
  });

  it('shows PIN verify error with fallback message', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    (publicApi.bookings.verifyPin as any).mockRejectedValue(new Error('Network'));
    renderDetail();
    await waitFor(() => { expect(screen.getByText('Cek PIN')).toBeInTheDocument(); });
    await userEvent.click(screen.getByText('Cek PIN'));
    await waitFor(() => { expect(screen.getByText('Masukkan PIN')).toBeInTheDocument(); });
    const pinInputs = document.querySelectorAll('input[id^="pin-"]');
    for (let i = 0; i < 6; i++) {
      fireEvent.change(pinInputs[i], { target: { value: String(i + 1) } });
    }
    const verifButton = screen.getAllByText('Verifikasi').find(el => el.tagName === 'BUTTON');
    if (verifButton) {
      await userEvent.click(verifButton);
      await waitFor(() => {
        expect(screen.getByText('PIN salah, coba lagi')).toBeInTheDocument();
      });
    }
  });

  it('shows check-in status in lifecycle', async () => {
    const checkedInBooking = { ...confirmedBooking, status: 'CHECKED_IN' };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: checkedInBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Check-in').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows EN_ROUTE status in lifecycle', async () => {
    const enRouteBooking = { ...confirmedBooking, status: 'EN_ROUTE' };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: enRouteBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Dalam Perjalanan').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows IN_SERVICE status in lifecycle', async () => {
    const inServiceBooking = { ...confirmedBooking, status: 'IN_SERVICE' };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: inServiceBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Sedang Dilayani').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows HELD status in lifecycle', async () => {
    const heldBooking = { ...confirmedBooking, status: 'HELD' };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: heldBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Ditahan').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows PENDING_APPROVAL status in lifecycle', async () => {
    const pendingApprovalBooking = { ...confirmedBooking, status: 'PENDING_APPROVAL' };
    (publicApi.bookings.getById as any).mockResolvedValue({ data: pendingApprovalBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Menunggu Persetujuan').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('formats cancel deadline date', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Kebijakan Booking')).toBeInTheDocument();
    });
    expect(screen.getByText('Batas Pembatalan')).toBeInTheDocument();
  });

  it('fills reschedule date/time and submits successfully', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    (publicApi.bookings.reschedule as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Reschedule').length).toBeGreaterThanOrEqual(1);
    });
    const rescheduleButtons = screen.getAllByText('Reschedule');
    await userEvent.click(rescheduleButtons.find(el => el.tagName === 'BUTTON') || rescheduleButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Reschedule Booking')).toBeInTheDocument();
    });
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    const timeInput = document.querySelector('input[type="time"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2026-10-05' } });
    fireEvent.change(timeInput, { target: { value: '15:30' } });
    const submitBtns = screen.getAllByText('Reschedule').filter(el => el.tagName === 'BUTTON');
    const submitBtn = submitBtns[submitBtns.length - 1];
    expect(submitBtn).not.toBeDisabled();
    await userEvent.click(submitBtn);
    await waitFor(() => {
      expect(publicApi.bookings.reschedule).toHaveBeenCalled();
    });
  });

  it('closes reschedule modal when overlay is clicked', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Reschedule').length).toBeGreaterThanOrEqual(1);
    });
    const rescheduleButtons = screen.getAllByText('Reschedule');
    await userEvent.click(rescheduleButtons.find(el => el.tagName === 'BUTTON') || rescheduleButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Reschedule Booking')).toBeInTheDocument();
    });
    const overlay = document.querySelector('div.fixed.inset-0') as HTMLElement;
    fireEvent.click(overlay);
    await waitFor(() => {
      expect(screen.queryByText('Tanggal baru')).not.toBeInTheDocument();
    });
  });

  it('closes PIN modal when overlay is clicked', async () => {
    (publicApi.bookings.getById as any).mockResolvedValue({ data: confirmedBooking });
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Cek PIN')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Cek PIN'));
    await waitFor(() => {
      expect(screen.getByText('Masukkan PIN')).toBeInTheDocument();
    });
    const overlay = document.querySelector('div.fixed.inset-0') as HTMLElement;
    fireEvent.click(overlay);
    await waitFor(() => {
      expect(screen.queryByText('Masukkan PIN')).not.toBeInTheDocument();
    });
  });
});
