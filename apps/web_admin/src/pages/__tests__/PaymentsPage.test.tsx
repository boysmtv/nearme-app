import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PaymentsPage from '../PaymentsPage';

vi.mock('../../lib/api', () => ({
  adminApi: {
    payments: { list: vi.fn() },
  },
}));

vi.mock('../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

import { adminApi } from '../../lib/api';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderPayments() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <PaymentsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('PaymentsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders Payments heading', () => {
    (adminApi.payments.list as any).mockResolvedValue({ data: { data: [], total: 0 } });
    renderPayments();
    expect(screen.getByText(/payments/i)).toBeInTheDocument();
  });

  it('renders payment list when data loads', async () => {
    (adminApi.payments.list as any).mockResolvedValue({
      data: { data: [{ id: '1', bookingCode: 'DKT-001', amount: 50000, status: 'PAID', method: 'bank_transfer', createdAt: '2024-01-01' }], total: 1 },
    });
    renderPayments();
    await waitFor(() => {
      expect(screen.getByText(/DKT-001/)).toBeInTheDocument();
    });
  });

  it('shows empty state when no payments', async () => {
    (adminApi.payments.list as any).mockResolvedValue({ data: { data: [], total: 0 } });
    renderPayments();
    await waitFor(() => {
      expect(screen.getByText(/tidak ada/i)).toBeInTheDocument();
    });
  });
});
