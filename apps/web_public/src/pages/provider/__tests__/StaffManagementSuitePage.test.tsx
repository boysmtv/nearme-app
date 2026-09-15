import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StaffManagementSuitePage from '../StaffManagementSuitePage';

const { mockGet, mockPost, mockInvalidateQueries } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockInvalidateQueries: vi.fn(),
}));

vi.mock('../../../lib/api', () => ({
  api: {
    get: (...a: unknown[]) => mockGet(...a),
    post: (...a: unknown[]) => mockPost(...a),
  },
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

const staffList = [
  { id: 's1', name: 'Andi', title: 'Barber', checkInStatus: 'CHECKED_IN', rating: 4.8, reviewCount: 20, monthlyBookings: 30, totalBookings: 100, specialties: ['Haircut', 'Shave'], lastCheckIn: '2026-09-14T08:00:00', avatarUrl: 'https://example.com/andi.jpg' },
  { id: 's2', name: 'Budi', title: 'Stylist', checkInStatus: 'CHECKED_OUT', rating: 4.5, reviewCount: 15, monthlyBookings: 20, totalBookings: 80, specialties: ['Coloring'], lastCheckIn: '2026-09-13T09:00:00', avatarUrl: '' },
  { id: 's3', name: 'Citra', title: '', checkInStatus: null, rating: 0, reviewCount: 0, monthlyBookings: 0, totalBookings: 0, specialties: [], lastCheckIn: '', avatarUrl: '' },
];

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <StaffManagementSuitePage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('StaffManagementSuitePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url.includes('performance')) return Promise.resolve({ data: { monthlyBookings: 50, avgRating: '4.6' } });
      return Promise.resolve({ data: staffList });
    });
    mockPost.mockResolvedValue({ data: {} });
  });

  it('renders heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /manajemen staf/i })).toBeInTheDocument();
  });

  it('shows summary stats cards', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    expect(screen.getByText('Total Staf')).toBeInTheDocument();
    expect(screen.getByText('Hadir Hari Ini')).toBeInTheDocument();
    expect(screen.getByText('Booking Bulan Ini')).toBeInTheDocument();
    expect(screen.getByText('Rata-rata Rating')).toBeInTheDocument();
  });

  it('shows total staff count', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows checked-in staff count', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows monthly bookings from stats', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('50')).toBeInTheDocument(); });
  });

  it('shows average rating from stats', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('4.6')).toBeInTheDocument(); });
  });

  it('shows empty state when no staff', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('performance')) return Promise.resolve({ data: {} });
      return Promise.resolve({ data: [] });
    });
    renderPage();
    await waitFor(() => { expect(screen.getByText(/belum ada staf/i)).toBeInTheDocument(); });
  });

  it('shows loading skeletons', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    renderPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders all staff names', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    expect(screen.getByText('Budi')).toBeInTheDocument();
    expect(screen.getByText('Citra')).toBeInTheDocument();
  });

  it('shows staff titles with fallback', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Barber')).toBeInTheDocument(); });
    expect(screen.getByText('Stylist')).toBeInTheDocument();
    expect(screen.getByText('Staf')).toBeInTheDocument();
  });

  it('shows CHECKED_IN badge', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('● Hadir')).toBeInTheDocument(); });
  });

  it('shows CHECKED_OUT badge', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('○ Pulang')).toBeInTheDocument(); });
  });

  it('shows null check-in status as Belum Absen', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Belum Absen')).toBeInTheDocument(); });
  });

  it('shows rating and monthly bookings per staff', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText(/4\.8/)).toBeInTheDocument(); });
    expect(screen.getByText('30 booking bulan ini')).toBeInTheDocument();
  });

  it('shows avatar with provided URL', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    const img = screen.getByRole('img', { name: 'Andi' });
    expect(img).toHaveAttribute('src', 'https://example.com/andi.jpg');
  });

  it('shows fallback avatar when no URL', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Budi')).toBeInTheDocument(); });
    const img = screen.getByRole('img', { name: 'Budi' });
    expect(img.src).toContain('ui-avatars.com');
  });

  it('shows fallback avatar for Citra with empty URL', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Citra')).toBeInTheDocument(); });
    const img = screen.getByRole('img', { name: 'Citra' });
    expect(img.src).toContain('ui-avatars.com');
  });

  it('detail button expands and shows stats', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    fireEvent.click(screen.getAllByText('Detail')[0]);
    expect(screen.getByText('Total Booking')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Bulan Ini')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Terakhir Check-in')).toBeInTheDocument();
  });

  it('detail button collapses on second click', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    const detailBtn = screen.getAllByText('Detail')[0];
    fireEvent.click(detailBtn);
    expect(screen.getByText('Total Booking')).toBeInTheDocument();
    fireEvent.click(detailBtn);
    expect(screen.queryByText('Total Booking')).not.toBeInTheDocument();
  });

  it('shows specialties when available', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    fireEvent.click(screen.getAllByText('Detail')[0]);
    expect(screen.getByText('Spesialisasi')).toBeInTheDocument();
    expect(screen.getByText('Haircut')).toBeInTheDocument();
    expect(screen.getByText('Shave')).toBeInTheDocument();
  });

  it('hides specialties section when empty', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Citra')).toBeInTheDocument(); });
    fireEvent.click(screen.getAllByText('Detail')[2]);
    expect(screen.queryByText('Spesialisasi')).not.toBeInTheDocument();
  });

  it('check-in button calls mutation for CHECKED_OUT staff', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Budi')).toBeInTheDocument(); });
    const checkInBtn = screen.getAllByText('Check In')[0];
    fireEvent.click(checkInBtn);
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/provider/staff/s2/check-in');
    });
  });

  it('check-out button calls mutation for CHECKED_IN staff', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    const checkOutBtn = screen.getByText('Check Out');
    fireEvent.click(checkOutBtn);
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/provider/staff/s1/check-out');
    });
  });

  it('check-in does not show for CHECKED_IN staff', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    const checkInButtons = screen.getAllByText('Check In');
    expect(checkInButtons.length).toBe(2);
  });

  it('shows Check Out for CHECKED_IN staff', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    expect(screen.getByText('Check Out')).toBeInTheDocument();
  });

  it('shows Check In for null status staff', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Citra')).toBeInTheDocument(); });
    const checkInButtons = screen.getAllByText('Check In');
    expect(checkInButtons.length).toBe(2);
  });

  it('shows last check-in time for staff with check-in', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    fireEvent.click(screen.getAllByText('Detail')[0]);
    expect(screen.getByText('Terakhir Check-in')).toBeInTheDocument();
  });

  it('shows dash for staff without last check-in', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Citra')).toBeInTheDocument(); });
    fireEvent.click(screen.getAllByText('Detail')[2]);
    expect(screen.getByText('Terakhir Check-in')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('shows monthly bookings per staff member', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    expect(screen.getByText('30 booking bulan ini')).toBeInTheDocument();
    expect(screen.getByText('20 booking bulan ini')).toBeInTheDocument();
  });

  it('shows rating with 0.0 fallback for null rating', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Citra')).toBeInTheDocument(); });
    fireEvent.click(screen.getAllByText('Detail')[2]);
    expect(screen.getByText('★ 0.0')).toBeInTheDocument();
  });

  it('shows monthly bookings detail when expanded', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    fireEvent.click(screen.getAllByText('Detail')[0]);
    expect(screen.getByText('Bulan Ini')).toBeInTheDocument();
  });

  it('shows zero total bookings for staff with none', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Citra')).toBeInTheDocument(); });
    fireEvent.click(screen.getAllByText('Detail')[2]);
    expect(screen.getByText('Total Booking')).toBeInTheDocument();
  });

  it('uses fallback values when stats has no data', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('performance')) return Promise.resolve({ data: {} });
      return Promise.resolve({ data: staffList });
    });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0.0')).toBeInTheDocument();
  });

  it('userEvent click on detail expands', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    const user = userEvent.setup();
    await user.click(screen.getAllByText('Detail')[0]);
    expect(screen.getByText('Total Booking')).toBeInTheDocument();
  });
});
