import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SubscriptionsPage from '../SubscriptionsPage';

vi.mock('../../lib/api', () => ({
  adminApi: {
    subscriptions: { list: vi.fn(), listPlans: vi.fn() },
  },
}));

vi.mock('../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

import { adminApi } from '../../lib/api';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderSubscriptions() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <SubscriptionsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('SubscriptionsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders Subscriptions heading', () => {
    (adminApi.subscriptions.list as any).mockResolvedValue({ data: { data: [], total: 0 } });
    (adminApi.subscriptions.listPlans as any).mockResolvedValue({ data: [] });
    renderSubscriptions();
    expect(screen.getByText(/subscriptions/i)).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    (adminApi.subscriptions.list as any).mockReturnValue(new Promise(() => {}));
    (adminApi.subscriptions.listPlans as any).mockReturnValue(new Promise(() => {}));
    renderSubscriptions();
    expect(screen.getByText(/subscriptions/i)).toBeInTheDocument();
  });
});
