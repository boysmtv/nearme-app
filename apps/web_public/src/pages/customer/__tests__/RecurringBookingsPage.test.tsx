import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecurringBookingsPage from '../RecurringBookingsPage';

vi.mock('../../../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
  publicApi: {
    bookings: { list: vi.fn() },
  },
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Siti', role: 'ROLE_CUSTOMER' } }),
}));

vi.mock('../../../components/CustomerLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="customer-layout">{children}</div>,
}));

import { api, publicApi } from '../../../lib/api';

const mockGet = api.get as ReturnType<typeof vi.fn>;
const mockBookingsList = publicApi.bookings.list as ReturnType<typeof vi.fn>;

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <RecurringBookingsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('RecurringBookingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: [] });
    mockBookingsList.mockResolvedValue({ data: [] });
  });

  it('renders heading', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /booking berulang/i })).toBeInTheDocument();
  });

  it('shows empty state when no recurring bookings', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/belum ada booking berulang/i)).toBeInTheDocument();
    });
  });

  it('renders recurring booking entries when data exists', async () => {
    mockGet.mockResolvedValue({
      data: [{ id: 'rb1', serviceName: 'Potong Rambut', providerName: 'Barbershop Central', frequency: 'WEEKLY', active: true, nextOccurrence: '2026-09-20T10:00:00' }],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    expect(screen.getByText('Barbershop Central')).toBeInTheDocument();
  });

  it('shows Buat Baru button', async () => {
    renderPage();
    expect(screen.getByRole('button', { name: /buat baru/i })).toBeInTheDocument();
  });
});
