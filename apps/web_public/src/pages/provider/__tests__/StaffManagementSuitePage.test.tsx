import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StaffManagementSuitePage from '../StaffManagementSuitePage';

const mockGet = vi.fn();
const mockPost = vi.fn();

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
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
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

  it('shows summary stats', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('4.6')).toBeInTheDocument();
  });

  it('shows empty state when no staff', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('performance')) return Promise.resolve({ data: {} });
      return Promise.resolve({ data: [] });
    });
    renderPage();
    await waitFor(() => { expect(screen.getByText(/belum ada staf/i)).toBeInTheDocument(); });
  });

  it('shows loading state', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    renderPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders staff cards', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    expect(screen.getByText('Budi')).toBeInTheDocument();
    expect(screen.getByText('Citra')).toBeInTheDocument();
  });

  it('shows staff title or fallback', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Barber')).toBeInTheDocument(); });
    expect(screen.getByText('Stylist')).toBeInTheDocument();
    expect(screen.getByText('Staf')).toBeInTheDocument();
  });

  it('shows CHECKED_IN status', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('● Hadir')).toBeInTheDocument(); });
  });

  it('shows CHECKED_OUT status', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('○ Pulang')).toBeInTheDocument(); });
  });

  it('shows null check-in status', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Belum Absen')).toBeInTheDocument(); });
  });

  it('shows staff rating and monthly bookings', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText(/4\.8/)).toBeInTheDocument(); });
    expect(screen.getByText('30 booking bulan ini')).toBeInTheDocument();
  });

  it('shows avatar image when avatarUrl exists', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    const img = screen.getByRole('img', { name: 'Andi' });
    expect(img).toHaveAttribute('src', 'https://example.com/andi.jpg');
  });

  it('shows fallback avatar when no avatarUrl', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Budi')).toBeInTheDocument(); });
    const img = screen.getByRole('img', { name: 'Budi' });
    expect(img.src).toContain('ui-avatars.com');
  });

  it('detail button expands and collapses', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    const detailBtn = screen.getAllByText('Detail')[0];
    fireEvent.click(detailBtn);
    expect(screen.getByText('Total Booking')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Spesialisasi')).toBeInTheDocument();
    expect(screen.getByText('Haircut')).toBeInTheDocument();
    fireEvent.click(detailBtn);
    expect(screen.queryByText('Total Booking')).not.toBeInTheDocument();
  });

  it('shows last check-in time', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Andi')).toBeInTheDocument(); });
    fireEvent.click(screen.getAllByText('Detail')[0]);
    expect(screen.getByText('Terakhir Check-in')).toBeInTheDocument();
  });

  it('null specialties not shown', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Citra')).toBeInTheDocument(); });
    fireEvent.click(screen.getAllByText('Detail')[2]);
    expect(screen.queryByText('Spesialisasi')).not.toBeInTheDocument();
  });
});
