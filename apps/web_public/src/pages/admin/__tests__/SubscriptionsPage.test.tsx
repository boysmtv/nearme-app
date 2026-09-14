import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SubscriptionsPage from '../SubscriptionsPage';

vi.mock('../../../lib/api', () => ({
  adminApi: {
    subscriptions: { list: vi.fn(), listPlans: vi.fn(), cancel: vi.fn(), reactivate: vi.fn(), updatePlan: vi.fn() },
  },
}));

vi.mock('../../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

vi.mock('../../../components/admin/StatusBadge', () => ({
  default: ({ status }: { status: string }) => <span data-testid="status-badge">{status}</span>,
}));

import { adminApi } from '../../../lib/api';

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
}

function renderSubs(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <SubscriptionsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const mockPlans = [
  { id: 'p1', name: 'Basic', priceAmount: 99000, billingCycle: 'MONTHLY', maxStaff: 3, maxBookingsPerMonth: 100, status: 'ACTIVE' },
  { id: 'p2', name: 'Premium', priceAmount: 299000, billingCycle: 'MONTHLY', maxStaff: 10, maxBookingsPerMonth: 500, status: 'ACTIVE' },
];

const mockSubscriptions = [
  { id: 's1', tenantId: 't1-aaaa-bbbb-cccc-dddddddddddd', planId: 'p1', status: 'ACTIVE', currentPeriodStart: '2026-09-01T00:00:00Z', currentPeriodEnd: '2026-09-30T23:59:59Z' },
  { id: 's2', tenantId: 't2-1111-2222-3333-444444444444', planId: 'p2', status: 'CANCELLED', currentPeriodStart: '2026-08-01T00:00:00Z', currentPeriodEnd: '2026-08-31T23:59:59Z' },
];

describe('web_public admin SubscriptionsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders heading and tabs', async () => {
    (adminApi.subscriptions.listPlans as any).mockResolvedValue({ data: [] });
    (adminApi.subscriptions.list as any).mockResolvedValue({ data: [] });
    renderSubs();
    await waitFor(() => {
      expect(screen.getByText('Subscription Management')).toBeInTheDocument();
    });
    expect(screen.getByText('Kelola paket langganan dan langganan aktif')).toBeInTheDocument();
    expect(screen.getByText('Plans')).toBeInTheDocument();
    expect(screen.getByText('Subscriptions')).toBeInTheDocument();
  });

  it('renders plans table with data', async () => {
    (adminApi.subscriptions.listPlans as any).mockResolvedValue({ data: mockPlans });
    (adminApi.subscriptions.list as any).mockResolvedValue({ data: [] });
    renderSubs();
    await waitFor(() => {
      expect(screen.getByText('Basic')).toBeInTheDocument();
    });
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Rp 99.000')).toBeInTheDocument();
    expect(screen.getByText('Rp 299.000')).toBeInTheDocument();
    expect(screen.getAllByText('MONTHLY').length).toBe(2);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getAllByText('Deactivate').length).toBe(2);
  });

  it('shows loading skeleton while fetching', () => {
    (adminApi.subscriptions.listPlans as any).mockReturnValue(new Promise(() => {}));
    (adminApi.subscriptions.list as any).mockReturnValue(new Promise(() => {}));
    renderSubs();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('switches to Subscriptions tab and renders data', async () => {
    (adminApi.subscriptions.listPlans as any).mockResolvedValue({ data: mockPlans });
    (adminApi.subscriptions.list as any).mockResolvedValue({ data: mockSubscriptions });
    const user = userEvent.setup();
    renderSubs();
    await waitFor(() => {
      expect(screen.getByText('Basic')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Subscriptions'));
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
    // Tenant ID truncated to 8 chars - look for it in the table
    expect(screen.getByText(/t1-aaaa/)).toBeInTheDocument();
    // Plan name resolved from planId
    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Reactivate')).toBeInTheDocument();
  });

  it('calls cancel when Cancel button clicked', async () => {
    (adminApi.subscriptions.listPlans as any).mockResolvedValue({ data: mockPlans });
    (adminApi.subscriptions.list as any).mockResolvedValue({ data: mockSubscriptions });
    (adminApi.subscriptions.cancel as any).mockResolvedValue({});
    const user = userEvent.setup();
    renderSubs();
    await waitFor(() => {
      expect(screen.getByText('Basic')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Subscriptions'));
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Cancel'));
    expect(adminApi.subscriptions.cancel).toHaveBeenCalledWith('s1');
  });

  it('calls reactivate when Reactivate button clicked', async () => {
    (adminApi.subscriptions.listPlans as any).mockResolvedValue({ data: mockPlans });
    (adminApi.subscriptions.list as any).mockResolvedValue({ data: mockSubscriptions });
    (adminApi.subscriptions.reactivate as any).mockResolvedValue({});
    const user = userEvent.setup();
    renderSubs();
    await waitFor(() => {
      expect(screen.getByText('Basic')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Subscriptions'));
    await waitFor(() => {
      expect(screen.getByText('Reactivate')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Reactivate'));
    expect(adminApi.subscriptions.reactivate).toHaveBeenCalledWith('s2');
  });

  it('calls updatePlan when Deactivate clicked', async () => {
    (adminApi.subscriptions.listPlans as any).mockResolvedValue({ data: mockPlans });
    (adminApi.subscriptions.list as any).mockResolvedValue({ data: [] });
    (adminApi.subscriptions.updatePlan as any).mockResolvedValue({});
    const user = userEvent.setup();
    renderSubs();
    await waitFor(() => {
      expect(screen.getByText('Basic')).toBeInTheDocument();
    });
    const deactivateButtons = screen.getAllByText('Deactivate');
    await user.click(deactivateButtons[0]);
    expect(adminApi.subscriptions.updatePlan).toHaveBeenCalledWith('p1', { status: 'INACTIVE' });
  });
});
