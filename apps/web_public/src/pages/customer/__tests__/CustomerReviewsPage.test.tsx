import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerReviewsPage from '../CustomerReviewsPage';

vi.mock('../../../lib/api', () => ({
  publicApi: {
    bookings: { list: vi.fn() },
  },
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Test', email: 'test@test.com', role: 'ROLE_CUSTOMER', hasProfile: true },
    logout: vi.fn(),
  }),
}));

vi.mock('../../../components/CustomerLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="customer-layout">{children}</div>,
}));

import { publicApi } from '../../../lib/api';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderPage() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <CustomerReviewsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('CustomerReviewsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); queryClient.clear(); });

  it('renders CustomerLayout wrapper', () => {
    (publicApi.bookings.list as any).mockResolvedValue({ data: [] });
    renderPage();
    expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
  });

  it('renders heading Ulasan Saya', () => {
    (publicApi.bookings.list as any).mockResolvedValue({ data: [] });
    renderPage();
    expect(screen.getByText('Ulasan Saya')).toBeInTheDocument();
  });

  it('shows empty state when no bookings', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({ data: [] });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Belum ada booking selesai/i)).toBeInTheDocument();
    });
  });

  it('renders tabs for unreviewed and reviewed', () => {
    (publicApi.bookings.list as any).mockResolvedValue({ data: [] });
    renderPage();
    expect(screen.getByText('Belum Diulas')).toBeInTheDocument();
    expect(screen.getByText('Sudah Diulas')).toBeInTheDocument();
  });

  it('shows unreviewed bookings when data loads', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({
      data: [
        { id: 'b1', serviceName: 'Haircut', providerName: 'Barber Shop', status: 'COMPLETED' },
      ],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Haircut')).toBeInTheDocument();
    });
    expect(screen.getByText('Barber Shop')).toBeInTheDocument();
    expect(screen.getByText('Tulis Ulasan')).toBeInTheDocument();
  });

  it('shows reviewed bookings after clicking Reviewed tab', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({
      data: [
        { id: 'b1', serviceName: 'Haircut', providerName: 'Barber Shop', hasReview: true, reviewRating: 5, reviewText: 'Great!' },
      ],
    });
    renderPage();
    // Wait for data to load — on unreviewed tab it should show "all reviewed" message
    await waitFor(() => {
      expect(screen.getByText(/Semua booking sudah diulas/i)).toBeInTheDocument();
    });
    // Now click the Reviewed tab
    fireEvent.click(screen.getByText('Sudah Diulas'));
    await waitFor(() => {
      expect(screen.getByText('Haircut')).toBeInTheDocument();
    });
    expect(screen.getByText('Barber Shop')).toBeInTheDocument();
    expect(screen.getByText('Terulas')).toBeInTheDocument();
    expect(screen.getByText('Great!')).toBeInTheDocument();
  });

  it('shows average rating in stats', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({
      data: [
        { id: 'b1', hasReview: true, reviewRating: 4 },
        { id: 'b2', hasReview: true, reviewRating: 5 },
      ],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });
    expect(screen.getByText('Rata-rata rating')).toBeInTheDocument();
    // Total reviews stat shows "2"
    expect(screen.getByText('Total ulasan')).toBeInTheDocument();
    // Unreviewed count is 0
    expect(screen.getByText('Belum diulas')).toBeInTheDocument();
  });

  it('shows provider response in reviewed booking', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({
      data: [
        { id: 'b1', serviceName: 'Massage', providerName: 'Spa', hasReview: true, reviewRating: 5, providerResponse: 'Thank you!' },
      ],
    });
    renderPage();
    // Wait for data to load — unreviewed tab shows "all reviewed" message
    await waitFor(() => {
      expect(screen.getByText(/Semua booking sudah diulas/i)).toBeInTheDocument();
    });
    // Click Reviewed tab
    fireEvent.click(screen.getByText('Sudah Diulas'));
    await waitFor(() => {
      expect(screen.getByText('Massage')).toBeInTheDocument();
    });
    expect(screen.getByText('Thank you!')).toBeInTheDocument();
    expect(screen.getByText('Balasan Provider')).toBeInTheDocument();
  });
});
