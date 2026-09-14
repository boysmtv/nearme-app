import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StaffManagementSuitePage from '../StaffManagementSuitePage';

vi.mock('../../../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

import { api } from '../../../lib/api';

const mockGet = api.get as ReturnType<typeof vi.fn>;

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <StaffManagementSuitePage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('StaffManagementSuitePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url.includes('performance')) return Promise.resolve({ data: { monthlyBookings: 45, avgRating: '4.8' } });
      return Promise.resolve({ data: [] });
    });
  });

  it('renders heading', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /manajemen staf/i })).toBeInTheDocument();
  });

  it('shows summary stats', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/total staf/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/hadir hari ini/i)).toBeInTheDocument();
  });

  it('shows empty state when no staff', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/belum ada staf/i)).toBeInTheDocument();
    });
  });

  it('renders staff cards when data exists', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('performance')) return Promise.resolve({ data: { monthlyBookings: 45, avgRating: '4.8' } });
      return Promise.resolve({
        data: [{ id: 's1', name: 'Andi', title: 'Barber', checkInStatus: 'CHECKED_IN', rating: 4.8, reviewCount: 20, monthlyBookings: 30, totalBookings: 100, specialties: ['Haircut'], lastCheckIn: '2026-09-14T08:00:00' }],
      });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
  });
});
