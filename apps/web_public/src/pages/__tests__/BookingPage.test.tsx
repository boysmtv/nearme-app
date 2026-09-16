import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BookingPage from '../BookingPage';

const mockServices = [
  {
    id: 's1',
    name: 'Potong Rambut',
    price: 50000,
    duration: 30,
    depositAmount: 0,
    category: 'Barbershop',
    description: 'Potong rambut pria',
    addons: [{ id: 'a1', name: 'Pijat', price: 20000, duration: 15 }],
  },
  {
    id: 's2',
    name: 'Hair Color',
    price: 150000,
    duration: 60,
    depositAmount: 50000,
    category: 'Salon',
    description: 'Pewarnaan rambut',
    addons: [],
  },
];

const mockStaff = [
  {
    id: 'st1',
    name: 'Andi',
    rating: 4.5,
    reviewCount: 20,
    bio: 'Barber',
    specialties: [],
    avatarUrl: '',
    providerId: 'p1',
  },
];

const mockSlots = [
  {
    id: 'sl1',
    startTime: '2026-09-20T10:00:00',
    endTime: '2026-09-20T10:30:00',
    available: true,
  },
];

const mockBooking = {
  id: 'bk1',
  bookingCode: 'DKT-TEST01',
  status: 'CONFIRMED',
  totalAmount: 50000,
  depositAmount: 0,
  depositRequired: false,
  cancelDeadline: '2026-09-19T10:00:00Z',
  rescheduleCount: 0,
  maxReschedule: 1,
  cancelPolicy: 'Pembatalan sebelum 24 jam',
  confirmationPin: '123456',
  version: 1,
};

const mockDepositBooking = {
  ...mockBooking,
  id: 'bk2',
  bookingCode: 'DKT-DEP01',
  depositAmount: 50000,
  depositRequired: true,
};

const mockListServices = vi.fn();
const mockListStaff = vi.fn();
const mockGetSlots = vi.fn();
const mockListPolicies = vi.fn();
const mockGetProfile = vi.fn();
const mockCreateBooking = vi.fn();
const mockVerifyPin = vi.fn();
const mockReschedule = vi.fn();
const mockCalendarLink = vi.fn();
const mockIcs = vi.fn();
const mockValidateCoupon = vi.fn();
const mockCreatePaymentIntent = vi.fn();

vi.mock('../../lib/api', () => ({
  publicApi: {
    services: { listByProvider: (...args: any[]) => mockListServices(...args) },
    staff: { listByProvider: (...args: any[]) => mockListStaff(...args) },
    availability: { getSlots: (...args: any[]) => mockGetSlots(...args) },
    bookings: {
      create: (...args: any[]) => mockCreateBooking(...args),
      createPaymentIntent: (...args: any[]) => mockCreatePaymentIntent(...args),
      verifyPin: (...args: any[]) => mockVerifyPin(...args),
      reschedule: (...args: any[]) => mockReschedule(...args),
      calendarLink: (...args: any[]) => mockCalendarLink(...args),
      ics: (...args: any[]) => mockIcs(...args),
      validateCoupon: (...args: any[]) => mockValidateCoupon(...args),
    },
    customer: { getProfile: (...args: any[]) => mockGetProfile(...args) },
    policies: { listPublic: (...args: any[]) => mockListPolicies(...args) },
  },
}));

vi.mock('../../lib/auth', () => ({
  useAuth: vi.fn(() => ({ user: null, isAuthenticated: false })),
}));

vi.mock('../../components/Header', () => ({
  default: () => <header data-testid="header">Header</header>,
}));

vi.mock('../../components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('../../components/SlotPicker', () => ({
  default: ({ slots, onSelect }: any) => (
    <div data-testid="slot-picker">
      {slots?.map((s: any) => (
        <button key={s.id} onClick={() => onSelect(s)}>
          {s.startTime}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../../components/BookingSummary', () => ({
  default: ({ service, staff, onConfirm }: any) => (
    <div data-testid="booking-summary">
      <span>{service?.name}</span>
      {staff && <span>{staff.name}</span>}
      <button onClick={onConfirm}>Confirm from Summary</button>
    </div>
  ),
}));

import { useAuth } from '../../lib/auth';

function renderBooking(entry = '/booking/p1') {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <QueryClientProvider client={qc}>
        <Routes>
          <Route path="/booking/:providerId" element={<BookingPage />} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

function setupDefaultMocks() {
  mockListServices.mockResolvedValue({ data: mockServices });
  mockListStaff.mockResolvedValue({ data: mockStaff });
  mockGetSlots.mockResolvedValue({ data: mockSlots });
  mockListPolicies.mockResolvedValue({ data: [] });
  mockGetProfile.mockResolvedValue({
    data: { nickname: 'Siti', email: 'siti@gmail.com', phone: '081234567890' },
  });
  mockCreateBooking.mockResolvedValue({ data: mockBooking });
  mockVerifyPin.mockResolvedValue({ data: { success: true } });
  mockReschedule.mockResolvedValue({ data: mockBooking });
  mockCalendarLink.mockResolvedValue({ data: { googleCalendarUrl: 'https://calendar.google.com' } });
  mockIcs.mockResolvedValue('BEGIN:VCALENDAR\nEND:VCALENDAR');
  mockValidateCoupon.mockResolvedValue({
    data: { valid: true, discountType: 'PERCENTAGE', discountValue: 10, discountAmount: 5000, finalPrice: 45000, message: 'Diskon diterapkan' },
  });
  mockCreatePaymentIntent.mockResolvedValue({ data: { paymentUrl: 'https://pay.midtrans.com', redirectUrl: 'https://pay.midtrans.com/redirect' } });
}

async function goToConfirmStep(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => {
    expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
  });
  await user.click(screen.getByText('Potong Rambut'));
  await waitFor(() => {
    expect(screen.getByText('Pilih Staf')).toBeInTheDocument();
  });
  await user.click(screen.getByText('Andi'));
  await waitFor(() => {
    expect(screen.getByText('Pilih Jadwal')).toBeInTheDocument();
  });
  await user.click(screen.getByText('2026-09-20T10:00:00'));
  await waitFor(() => {
    expect(screen.getByText('Informasi Kontak')).toBeInTheDocument();
  });
  await user.clear(screen.getByPlaceholderText('Masukkan nama Anda'));
  await user.type(screen.getByPlaceholderText('Masukkan nama Anda'), 'Budi');
  await user.clear(screen.getByPlaceholderText('email@contoh.com'));
  await user.type(screen.getByPlaceholderText('email@contoh.com'), 'budi@test.com');
  await user.clear(screen.getByPlaceholderText('08xxxxxxxxxx'));
  await user.type(screen.getByPlaceholderText('08xxxxxxxxxx'), '0812345678901');
  await user.click(screen.getByText('Lanjutkan'));
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Konfirmasi Booking' })).toBeInTheDocument();
  });
}

async function goToSuccessPage(user: ReturnType<typeof userEvent.setup>) {
  await goToConfirmStep(user);
  await user.click(screen.getByRole('button', { name: 'Konfirmasi Booking' }));
  await waitFor(() => {
    expect(screen.getByText('Booking Berhasil Dibuat')).toBeInTheDocument();
  });
}

async function goToSuccessPageDeposit(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => {
    expect(screen.getByText('Hair Color')).toBeInTheDocument();
  });
  await user.click(screen.getByText('Hair Color'));
  await waitFor(() => {
    expect(screen.getByText('Andi')).toBeInTheDocument();
  });
  await user.click(screen.getByText('Andi'));
  await waitFor(() => {
    expect(screen.getByTestId('slot-picker')).toBeInTheDocument();
  });
  await user.click(screen.getByText('2026-09-20T10:00:00'));
  await waitFor(() => {
    expect(screen.getByText('Informasi Kontak')).toBeInTheDocument();
  });
  await user.clear(screen.getByPlaceholderText('Masukkan nama Anda'));
  await user.type(screen.getByPlaceholderText('Masukkan nama Anda'), 'Budi');
  await user.clear(screen.getByPlaceholderText('email@contoh.com'));
  await user.type(screen.getByPlaceholderText('email@contoh.com'), 'budi@test.com');
  await user.clear(screen.getByPlaceholderText('08xxxxxxxxxx'));
  await user.type(screen.getByPlaceholderText('08xxxxxxxxxx'), '0812345678901');
  await user.click(screen.getByText('Lanjutkan'));
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Konfirmasi Booking' })).toBeInTheDocument();
  });
  mockCreateBooking.mockResolvedValue({ data: mockDepositBooking });
  await user.click(screen.getByRole('button', { name: 'Konfirmasi Booking' }));
  await waitFor(() => {
    expect(screen.getByText('Booking Berhasil Dibuat')).toBeInTheDocument();
  });
}

describe('BookingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultMocks();
  });

  it('renders step progress labels', async () => {
    renderBooking();
    expect(screen.getByText('Layanan')).toBeInTheDocument();
    expect(screen.getByText('Staf')).toBeInTheDocument();
    expect(screen.getByText('Jadwal')).toBeInTheDocument();
    expect(screen.getByText('Kontak')).toBeInTheDocument();
    expect(screen.getByText('Konfirmasi')).toBeInTheDocument();
  });

  it('renders services list with prices', async () => {
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    expect(screen.getByText('Hair Color')).toBeInTheDocument();
    expect(screen.getAllByText(/Rp\s*50\.000/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Rp\s*150\.000/)).toBeInTheDocument();
  });

  it('renders header and footer', () => {
    renderBooking();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('selects service and moves to staff step', async () => {
    const user = userEvent.setup();
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Potong Rambut'));
    await waitFor(() => {
      expect(screen.getByText('Pilih Staf')).toBeInTheDocument();
    });
    expect(screen.getByText('Andi')).toBeInTheDocument();
  });

  it('selects staff and moves to slot step', async () => {
    const user = userEvent.setup();
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Potong Rambut'));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Andi'));
    await waitFor(() => {
      expect(screen.getByText('Pilih Jadwal')).toBeInTheDocument();
    });
    expect(screen.getByTestId('slot-picker')).toBeInTheDocument();
  });

  it('selects slot and moves to contact step', async () => {
    const user = userEvent.setup();
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Potong Rambut'));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Andi'));
    await waitFor(() => {
      expect(screen.getByTestId('slot-picker')).toBeInTheDocument();
    });
    await user.click(screen.getByText('2026-09-20T10:00:00'));
    await waitFor(() => {
      expect(screen.getByText('Informasi Kontak')).toBeInTheDocument();
    });
  });

  it('goes back from staff to service', async () => {
    const user = userEvent.setup();
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Potong Rambut'));
    await waitFor(() => {
      expect(screen.getByText('Pilih Staf')).toBeInTheDocument();
    });
    await user.click(screen.getByText(/Kembali ke layanan/));
    await waitFor(() => {
      expect(screen.getByText('Pilih Layanan')).toBeInTheDocument();
    });
  });

  it('shows service addons', async () => {
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    expect(screen.getByText('Add-on tersedia:')).toBeInTheDocument();
    expect(screen.getByText(/Pijat/)).toBeInTheDocument();
  });

  it('shows staff with rating', async () => {
    const user = userEvent.setup();
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Potong Rambut'));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    expect(screen.getByText('4.5 (20)')).toBeInTheDocument();
    expect(screen.getByText('Barber')).toBeInTheDocument();
  });

  it('shows authenticated user profile message', async () => {
    (useAuth as any).mockReturnValue({
      user: { name: 'Siti', email: 'siti@gmail.com' },
      isAuthenticated: true,
    });
    const user = userEvent.setup();
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Potong Rambut'));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Andi'));
    await waitFor(() => {
      expect(screen.getByTestId('slot-picker')).toBeInTheDocument();
    });
    await user.click(screen.getByText('2026-09-20T10:00:00'));
    await waitFor(() => {
      expect(screen.getByText(/Data dari profil Anda/)).toBeInTheDocument();
    });
  });

  it('submits contact form and moves to confirm step', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToConfirmStep(user);
    expect(screen.getByText('Budi')).toBeInTheDocument();
  });

  it('shows BookingSummary sidebar after selecting staff', async () => {
    const user = userEvent.setup();
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Potong Rambut'));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Andi'));
    await waitFor(() => {
      expect(screen.getByTestId('booking-summary')).toBeInTheDocument();
    });
    expect(screen.getByTestId('booking-summary')).toHaveTextContent('Potong Rambut');
  });

  it('confirms booking and shows success page with booking code', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPage(user);
    expect(screen.getByText('DKT-TEST01')).toBeInTheDocument();
  });

  it('shows booking error on failure', async () => {
    const user = userEvent.setup();
    mockCreateBooking.mockRejectedValue(new Error('Slot sudah tidak tersedia'));
    renderBooking();
    await goToConfirmStep(user);
    await user.click(screen.getByRole('button', { name: 'Konfirmasi Booking' }));
    await waitFor(() => {
      expect(screen.getByText('Slot sudah tidak tersedia')).toBeInTheDocument();
    });
  });

  it('verifies PIN after booking', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPage(user);
    await user.type(screen.getByPlaceholderText('6-digit PIN'), '123456');
    await user.click(screen.getByText('Verifikasi'));
    await waitFor(() => {
      expect(screen.getByText('PIN terverifikasi, booking dikonfirmasi!')).toBeInTheDocument();
    });
  });

  it('validates coupon success', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToConfirmStep(user);
    await user.type(screen.getByPlaceholderText('Contoh: DISKON10'), 'DISKON10');
    await user.click(screen.getByText('Gunakan'));
    await waitFor(() => {
      expect(screen.getByText('Kupon berhasil diterapkan!')).toBeInTheDocument();
    });
  });

  it('validates coupon failure', async () => {
    const user = userEvent.setup();
    mockValidateCoupon.mockRejectedValue({
      response: { data: { message: 'Kupon kedaluwarsa' } },
    });
    renderBooking();
    await goToConfirmStep(user);
    await user.type(screen.getByPlaceholderText('Contoh: DISKON10'), 'EXPIRED');
    await user.click(screen.getByText('Gunakan'));
    await waitFor(() => {
      expect(screen.getByText('Kupon kedaluwarsa')).toBeInTheDocument();
    });
  });

  it('edits contact from confirm step', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToConfirmStep(user);
    await user.click(screen.getByText('Edit'));
    await waitFor(() => {
      expect(screen.getByText('Informasi Kontak')).toBeInTheDocument();
    });
  });

  it('shows deposit badge for deposit service', async () => {
    const user = userEvent.setup();
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText('Hair Color')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Hair Color'));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Andi'));
    await waitFor(() => {
      expect(screen.getByTestId('slot-picker')).toBeInTheDocument();
    });
    await user.click(screen.getByText('2026-09-20T10:00:00'));
    await waitFor(() => {
      expect(screen.getByText('Informasi Kontak')).toBeInTheDocument();
    });
    await user.clear(screen.getByPlaceholderText('Masukkan nama Anda'));
    await user.type(screen.getByPlaceholderText('Masukkan nama Anda'), 'Budi');
    await user.clear(screen.getByPlaceholderText('email@contoh.com'));
    await user.type(screen.getByPlaceholderText('email@contoh.com'), 'budi@test.com');
    await user.clear(screen.getByPlaceholderText('08xxxxxxxxxx'));
    await user.type(screen.getByPlaceholderText('08xxxxxxxxxx'), '0812345678901');
    await user.click(screen.getByText('Lanjutkan'));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Konfirmasi Booking' })).toBeInTheDocument();
    });
    expect(screen.getAllByText(/Deposit/).length).toBeGreaterThanOrEqual(1);
  });

  it('reschedule button disabled without date', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPage(user);
    const rescheduleBtn = screen.getByText('Reschedule Booking');
    expect(rescheduleBtn).toBeDisabled();
  });

  it('shows calendar sync buttons', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPage(user);
    expect(screen.getByText('Google Calendar')).toBeInTheDocument();
    expect(screen.getByText('Download .ics')).toBeInTheDocument();
  });

  it('shows chat realtime section', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPage(user);
    expect(screen.getByText('Chat Realtime')).toBeInTheDocument();
    expect(screen.getByText('Buka Chat List')).toBeInTheDocument();
    expect(screen.getByText('Chat Booking Ini')).toBeInTheDocument();
  });

  it('shows navigation links on success page', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPage(user);
    expect(screen.getByText('Beranda')).toBeInTheDocument();
    expect(screen.getByText('Cari Layanan Lain')).toBeInTheDocument();
  });

  it('shows booking policy text on confirm step', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToConfirmStep(user);
    expect(screen.getByText(/Pembatalan sebelum 24 jam/)).toBeInTheDocument();
  });

  it('shows confirm step with booking details', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToConfirmStep(user);
    expect(screen.getAllByText('Potong Rambut').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Andi').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Budi')).toBeInTheDocument();
    expect(screen.getByText('budi@test.com')).toBeInTheDocument();
  });

  // === NEW TESTS FOR UNCOVERED LINES ===

  it('toggles addon checkbox in slot step', async () => {
    const user = userEvent.setup();
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Potong Rambut'));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Andi'));
    await waitFor(() => {
      expect(screen.getByTestId('slot-picker')).toBeInTheDocument();
    });
    // Addon checkbox visible in slot step
    const addonCheckbox = screen.getByRole('checkbox');
    expect(addonCheckbox).not.toBeChecked();
    await user.click(addonCheckbox);
    expect(addonCheckbox).toBeChecked();
    // Toggle off
    await user.click(addonCheckbox);
    expect(addonCheckbox).not.toBeChecked();
  });

  it('goes back from slot step to staff step', async () => {
    const user = userEvent.setup();
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Potong Rambut'));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Andi'));
    await waitFor(() => {
      expect(screen.getByText('Pilih Jadwal')).toBeInTheDocument();
    });
    await user.click(screen.getByText(/Kembali ke pemilihan staf/));
    await waitFor(() => {
      expect(screen.getByText('Pilih Staf')).toBeInTheDocument();
    });
  });

  it('goes back from contact step to slot step', async () => {
    const user = userEvent.setup();
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Potong Rambut'));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Andi'));
    await waitFor(() => {
      expect(screen.getByTestId('slot-picker')).toBeInTheDocument();
    });
    await user.click(screen.getByText('2026-09-20T10:00:00'));
    await waitFor(() => {
      expect(screen.getByText('Informasi Kontak')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Kembali'));
    await waitFor(() => {
      expect(screen.getByText('Pilih Jadwal')).toBeInTheDocument();
    });
  });

  it('shows coupon discount details for valid percentage coupon', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToConfirmStep(user);
    await user.type(screen.getByPlaceholderText('Contoh: DISKON10'), 'DISKON10');
    await user.click(screen.getByText('Gunakan'));
    await waitFor(() => {
      expect(screen.getByText('Kupon berhasil diterapkan!')).toBeInTheDocument();
    });
    expect(screen.getByText(/Diskon 10%/)).toBeInTheDocument();
    expect(screen.getByText(/Harga akhir/)).toBeInTheDocument();
  });

  it('shows coupon discount details for valid flat coupon', async () => {
    mockValidateCoupon.mockResolvedValue({
      data: { valid: true, discountType: 'FLAT', discountValue: 10000, discountAmount: 10000, finalPrice: 40000, message: 'Diskon flat' },
    });
    const user = userEvent.setup();
    renderBooking();
    await goToConfirmStep(user);
    await user.type(screen.getByPlaceholderText('Contoh: DISKON10'), 'FLAT10');
    await user.click(screen.getByText('Gunakan'));
    await waitFor(() => {
      expect(screen.getByText('Kupon berhasil diterapkan!')).toBeInTheDocument();
    });
    expect(screen.getByText(/Diskon Rp/)).toBeInTheDocument();
  });

  it('shows default coupon error message when no response message', async () => {
    mockValidateCoupon.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    renderBooking();
    await goToConfirmStep(user);
    await user.type(screen.getByPlaceholderText('Contoh: DISKON10'), 'BAD');
    await user.click(screen.getByText('Gunakan'));
    await waitFor(() => {
      expect(screen.getByText('Kupon tidak valid')).toBeInTheDocument();
    });
  });

  it('does not validate coupon when code is empty', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToConfirmStep(user);
    // Gunakan button should be disabled when no coupon code
    const gunakanBtn = screen.getByText('Gunakan');
    expect(gunakanBtn).toBeDisabled();
  });

  it('uppercases coupon code on input', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToConfirmStep(user);
    const couponInput = screen.getByPlaceholderText('Contoh: DISKON10');
    await user.type(couponInput, 'lower');
    expect(couponInput).toHaveValue('LOWER');
  });

  it('shows bookingError from createBooking onError with non-Error object', async () => {
    mockCreateBooking.mockRejectedValue('string error');
    const user = userEvent.setup();
    renderBooking();
    await goToConfirmStep(user);
    await user.click(screen.getByRole('button', { name: 'Konfirmasi Booking' }));
    await waitFor(() => {
      expect(screen.getByText('Gagal membuat booking. Silakan coba lagi.')).toBeInTheDocument();
    });
  });

  it('shows createBooking.error when no bookingError set', async () => {
    mockCreateBooking.mockRejectedValue(new Error('Server timeout'));
    const user = userEvent.setup();
    renderBooking();
    await goToConfirmStep(user);
    await user.click(screen.getByRole('button', { name: 'Konfirmasi Booking' }));
    await waitFor(() => {
      expect(screen.getByText('Server timeout')).toBeInTheDocument();
    });
  });

  it('shows processing state during booking creation', async () => {
    mockCreateBooking.mockReturnValue(new Promise(() => {})); // never resolves
    const user = userEvent.setup();
    renderBooking();
    await goToConfirmStep(user);
    await user.click(screen.getByRole('button', { name: 'Konfirmasi Booking' }));
    await waitFor(() => {
      expect(screen.getByText('Memproses...')).toBeInTheDocument();
    });
  });

  it('goes back from confirm step to contact step', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToConfirmStep(user);
    await user.click(screen.getByText(/Kembali/));
    await waitFor(() => {
      expect(screen.getByText('Informasi Kontak')).toBeInTheDocument();
    });
  });

  it('reschedule with valid date succeeds', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPage(user);
    const dateInput = screen.getAllByDisplayValue('')[0]; // first empty date input
    // Find the reschedule date input specifically
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const timeInputs = document.querySelectorAll('input[type="time"]');
    expect(dateInputs.length).toBeGreaterThanOrEqual(1);
    await user.type(dateInputs[0], '2026-09-25');
    await user.type(timeInputs[0], '14:00');
    const rescheduleBtn = screen.getByText('Reschedule Booking');
    expect(rescheduleBtn).not.toBeDisabled();
    await user.click(rescheduleBtn);
    await waitFor(() => {
      expect(screen.getByText('Reschedule berhasil! Slot baru terkonfirmasi.')).toBeInTheDocument();
    });
  });

  it('reschedule failure shows error message', async () => {
    mockReschedule.mockRejectedValue(new Error('Reschedule failed: 409 Conflict limit'));
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPage(user);
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const timeInputs = document.querySelectorAll('input[type="time"]');
    await user.type(dateInputs[0], '2026-09-25');
    await user.type(timeInputs[0], '14:00');
    await user.click(screen.getByText('Reschedule Booking'));
    await waitFor(() => {
      expect(screen.getByText(/Batas reschedule gratis tercapai/)).toBeInTheDocument();
    });
  });

  it('reschedule failure with generic error', async () => {
    mockReschedule.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPage(user);
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const timeInputs = document.querySelectorAll('input[type="time"]');
    await user.type(dateInputs[0], '2026-09-25');
    await user.type(timeInputs[0], '14:00');
    await user.click(screen.getByText('Reschedule Booking'));
    await waitFor(() => {
      const msgs = screen.getAllByText('Network error');
      expect(msgs.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('reschedule failure with non-Error object', async () => {
    mockReschedule.mockRejectedValue('string error');
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPage(user);
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const timeInputs = document.querySelectorAll('input[type="time"]');
    await user.type(dateInputs[0], '2026-09-25');
    await user.type(timeInputs[0], '14:00');
    await user.click(screen.getByText('Reschedule Booking'));
    await waitFor(() => {
      expect(screen.getByText('Reschedule gagal')).toBeInTheDocument();
    });
  });

  it('shows processing state during reschedule', async () => {
    mockReschedule.mockReturnValue(new Promise(() => {})); // never resolves
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPage(user);
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const timeInputs = document.querySelectorAll('input[type="time"]');
    await user.type(dateInputs[0], '2026-09-25');
    await user.type(timeInputs[0], '14:00');
    await user.click(screen.getByText('Reschedule Booking'));
    await waitFor(() => {
      const btns = screen.getAllByText('Memproses...');
      expect(btns.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('deposit success page shows pay deposit button', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPageDeposit(user);
    expect(screen.getByText(/Bayar Deposit/)).toBeInTheDocument();
  });

  it('deposit success page shows deposit required badge', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPageDeposit(user);
    expect(screen.getByText(/Deposit Rp\s*50\.000 Wajib/)).toBeInTheDocument();
  });

  it('deposit success page shows cancel deadline', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPageDeposit(user);
    expect(screen.getByText(/Batas pembatalan/)).toBeInTheDocument();
  });

  it('deposit success page shows reschedule count', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPageDeposit(user);
    expect(screen.getByText(/Reschedule: 0\/1/)).toBeInTheDocument();
  });

  it('pay deposit button triggers createPaymentIntent', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPageDeposit(user);
    const payBtn = screen.getByText(/Bayar Deposit/);
    await user.click(payBtn);
    await waitFor(() => {
      expect(mockCreatePaymentIntent).toHaveBeenCalledWith('bk2', 'midtrans', { amount: 50000, currency: 'IDR' });
    });
  });

  it('shows pay deposit processing state', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPageDeposit(user);
    mockCreatePaymentIntent.mockReturnValue(new Promise(() => {}));
    const depositBtn = screen.getByText(/Bayar Deposit/);
    await user.click(depositBtn);
    await waitFor(() => {
      const memproses = screen.getAllByText('Memproses...');
      expect(memproses.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('deposit payment error shows error message', async () => {
    mockCreatePaymentIntent.mockRejectedValue(new Error('Payment gateway error'));
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPageDeposit(user);
    const payBtn = screen.getByText(/Bayar Deposit/);
    await user.click(payBtn);
    await waitFor(() => {
      expect(screen.getByText('Payment gateway error')).toBeInTheDocument();
    });
  });

  it('non-deposit service shows tanpa deposit badge on success page', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPage(user);
    expect(screen.getByText('Tanpa Deposit')).toBeInTheDocument();
  });

  it('confirmationPin displayed on success page', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPage(user);
    expect(screen.getByText('123456')).toBeInTheDocument();
    expect(screen.getByText('PIN Konfirmasi (tunjukkan ke staf)')).toBeInTheDocument();
  });

  it('shows booking status on success page', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPage(user);
    expect(screen.getByText(/Status: CONFIRMED/)).toBeInTheDocument();
  });

  it('contact form shows error for short name', async () => {
    const user = userEvent.setup();
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Potong Rambut'));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Andi'));
    await waitFor(() => {
      expect(screen.getByTestId('slot-picker')).toBeInTheDocument();
    });
    await user.click(screen.getByText('2026-09-20T10:00:00'));
    await waitFor(() => {
      expect(screen.getByText('Informasi Kontak')).toBeInTheDocument();
    });
    await user.clear(screen.getByPlaceholderText('Masukkan nama Anda'));
    await user.type(screen.getByPlaceholderText('Masukkan nama Anda'), 'A');
    await user.click(screen.getByText('Lanjutkan'));
    await waitFor(() => {
      expect(screen.getByText('Nama harus minimal 2 karakter')).toBeInTheDocument();
    });
  });

  it('contact form shows error for invalid email', async () => {
    const user = userEvent.setup();
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Potong Rambut'));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Andi'));
    await waitFor(() => {
      expect(screen.getByTestId('slot-picker')).toBeInTheDocument();
    });
    await user.click(screen.getByText('2026-09-20T10:00:00'));
    await waitFor(() => {
      expect(screen.getByText('Informasi Kontak')).toBeInTheDocument();
    });
    await user.clear(screen.getByPlaceholderText('email@contoh.com'));
    await user.type(screen.getByPlaceholderText('email@contoh.com'), 'notanemail');
    // Use fireEvent.submit to bypass browser-native email validation
    const form = screen.getByRole('button', { name: 'Lanjutkan' }).closest('form')!;
    fireEvent.submit(form);
    await waitFor(() => {
      const errors = screen.getAllByText('Email tidak valid');
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('contact form shows error for short phone', async () => {
    const user = userEvent.setup();
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Potong Rambut'));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Andi'));
    await waitFor(() => {
      expect(screen.getByTestId('slot-picker')).toBeInTheDocument();
    });
    await user.click(screen.getByText('2026-09-20T10:00:00'));
    await waitFor(() => {
      expect(screen.getByText('Informasi Kontak')).toBeInTheDocument();
    });
    await user.clear(screen.getByPlaceholderText('08xxxxxxxxxx'));
    await user.type(screen.getByPlaceholderText('08xxxxxxxxxx'), '0812');
    await user.click(screen.getByText('Lanjutkan'));
    await waitFor(() => {
      expect(screen.getByText('Nomor telepon harus minimal 10 digit')).toBeInTheDocument();
    });
  });

  it('contact form shows unauthenticated message', async () => {
    (useAuth as any).mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    const user = userEvent.setup();
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Potong Rambut'));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Andi'));
    await waitFor(() => {
      expect(screen.getByTestId('slot-picker')).toBeInTheDocument();
    });
    await user.click(screen.getByText('2026-09-20T10:00:00'));
    await waitFor(() => {
      expect(screen.getByText('Isi data diri Anda untuk menyelesaikan booking')).toBeInTheDocument();
    });
  });

  it('verifyPin shows error on failure', async () => {
    mockVerifyPin.mockRejectedValue(new Error('PIN salah'));
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPage(user);
    await user.type(screen.getByPlaceholderText('6-digit PIN'), '000000');
    await user.click(screen.getByText('Verifikasi'));
    await waitFor(() => {
      const msgs = screen.getAllByText('PIN salah');
      expect(msgs.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('verifyPin disabled when pin length is not 6', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPage(user);
    await user.type(screen.getByPlaceholderText('6-digit PIN'), '123');
    const verifBtn = screen.getByText('Verifikasi');
    expect(verifBtn).toBeDisabled();
  });

  it('verifyPin processing state', async () => {
    mockVerifyPin.mockReturnValue(new Promise(() => {})); // never resolves
    const user = userEvent.setup();
    renderBooking();
    await goToSuccessPage(user);
    await user.type(screen.getByPlaceholderText('6-digit PIN'), '123456');
    await user.click(screen.getByText('Verifikasi'));
    await waitFor(() => {
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });

  it('shows breadcrumb navigation', async () => {
    renderBooking();
    expect(screen.getByText('Cari Layanan')).toBeInTheDocument();
    expect(screen.getByText('Booking')).toBeInTheDocument();
  });

  it('preselects service from query param', async () => {
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
    });
    render(
      <MemoryRouter initialEntries={['/booking/p1?service=s1']}>
        <QueryClientProvider client={qc}>
          <Routes>
            <Route path="/booking/:providerId" element={<BookingPage />} />
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText('Pilih Staf')).toBeInTheDocument();
    });
  });

  it('policy text displayed on confirm step', async () => {
    mockListPolicies.mockResolvedValue({ data: [{ body: 'Custom policy text here' }] });
    const user = userEvent.setup();
    renderBooking();
    await goToConfirmStep(user);
    expect(screen.getByText('Custom policy text here')).toBeInTheDocument();
  });

  it('coupon clearing resets result', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToConfirmStep(user);
    await user.type(screen.getByPlaceholderText('Contoh: DISKON10'), 'DISKON10');
    await user.click(screen.getByText('Gunakan'));
    await waitFor(() => {
      expect(screen.getByText('Kupon berhasil diterapkan!')).toBeInTheDocument();
    });
    // Clear coupon input - should reset result
    await user.clear(screen.getByPlaceholderText('Contoh: DISKON10'));
    await waitFor(() => {
      expect(screen.queryByText('Kupon berhasil diterapkan!')).not.toBeInTheDocument();
    });
  });

  it('non-deposit confirm page shows tanpa deposit badge', async () => {
    const user = userEvent.setup();
    renderBooking();
    await goToConfirmStep(user);
    expect(screen.getByText('Tanpa Deposit')).toBeInTheDocument();
    expect(screen.getByText('Tanpa deposit required')).toBeInTheDocument();
  });

  it('confirm step shows notes field', async () => {
    const user = userEvent.setup();
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Potong Rambut'));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Andi'));
    await waitFor(() => {
      expect(screen.getByTestId('slot-picker')).toBeInTheDocument();
    });
    await user.click(screen.getByText('2026-09-20T10:00:00'));
    await waitFor(() => {
      expect(screen.getByText('Informasi Kontak')).toBeInTheDocument();
    });
    expect(screen.getByText('Catatan')).toBeInTheDocument();
    expect(screen.getByText('(opsional)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Permintaan khusus, alergi, dll.')).toBeInTheDocument();
  });

  it('contact form notes field is optional and works', async () => {
    const user = userEvent.setup();
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Potong Rambut'));
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Andi'));
    await waitFor(() => {
      expect(screen.getByTestId('slot-picker')).toBeInTheDocument();
    });
    await user.click(screen.getByText('2026-09-20T10:00:00'));
    await waitFor(() => {
      expect(screen.getByText('Informasi Kontak')).toBeInTheDocument();
    });
    await user.type(screen.getByPlaceholderText('Permintaan khusus, alergi, dll.'), 'Tatto kecil');
    await user.clear(screen.getByPlaceholderText('Masukkan nama Anda'));
    await user.type(screen.getByPlaceholderText('Masukkan nama Anda'), 'Budi');
    await user.clear(screen.getByPlaceholderText('email@contoh.com'));
    await user.type(screen.getByPlaceholderText('email@contoh.com'), 'budi@test.com');
    await user.clear(screen.getByPlaceholderText('08xxxxxxxxxx'));
    await user.type(screen.getByPlaceholderText('08xxxxxxxxxx'), '0812345678901');
    await user.click(screen.getByText('Lanjutkan'));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Konfirmasi Booking' })).toBeInTheDocument();
    });
  });
});
