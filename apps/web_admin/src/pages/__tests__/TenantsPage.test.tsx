import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TenantsPage from '../TenantsPage';

vi.mock('../../lib/api', () => ({
  adminApi: {
    tenants: { list: vi.fn(), approve: vi.fn() },
  },
}));

vi.mock('../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

import { adminApi } from '../../lib/api';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderTenants() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <TenantsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('TenantsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders Tenants heading', () => {
    (adminApi.tenants.list as any).mockResolvedValue({ data: { data: [], total: 0 } });
    renderTenants();
    expect(screen.getByText(/tenants/i)).toBeInTheDocument();
  });

  it('renders tenant list when data loads', async () => {
    (adminApi.tenants.list as any).mockResolvedValue({
      data: {
        data: [
          { id: '1', name: 'Barber Shop Central', slug: 'barber-shop-central', status: 'APPROVED', createdAt: '2024-01-01' },
        ],
        total: 1,
      },
    });
    renderTenants();
    await waitFor(() => {
      expect(screen.getByText('Barber Shop Central')).toBeInTheDocument();
    });
  });

  it('shows empty state when no tenants', async () => {
    (adminApi.tenants.list as any).mockResolvedValue({ data: { data: [], total: 0 } });
    renderTenants();
    await waitFor(() => {
      expect(screen.getByText(/tidak ada/i)).toBeInTheDocument();
    });
  });
});
