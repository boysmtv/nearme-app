import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SubscriptionUpgradePage from '../SubscriptionUpgradePage';

const mockGet = vi.fn();
vi.mock('../../../lib/api', () => ({
  api: {
    get: (...args: any[]) => mockGet(...args),
    post: vi.fn(),
  },
}));

import { api } from '../../../lib/api';

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <SubscriptionUpgradePage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('SubscriptionUpgradePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: { data: { planId: 'FREE' } } });
  });

  it('renders heading', async () => {
    renderPage();
    expect(screen.getByText('Upgrade Plan')).toBeInTheDocument();
  });

  it('shows Free plan', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Free')).toBeInTheDocument();
    });
    expect(screen.getByText('Gratis')).toBeInTheDocument();
  });

  it('shows Pro plan', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Pro')).toBeInTheDocument();
    });
    expect(screen.getByText(/199.000/)).toBeInTheDocument();
  });

  it('shows Enterprise plan', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });
    expect(screen.getByText(/499.000/)).toBeInTheDocument();
  });

  it('shows current plan badge for FREE', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Plan Aktif').length).toBeGreaterThanOrEqual(1);
    });
  });
});
