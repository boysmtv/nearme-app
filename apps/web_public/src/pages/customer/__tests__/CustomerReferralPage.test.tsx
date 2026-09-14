import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerReferralPage from '../CustomerReferralPage';

vi.mock('../../../lib/api', () => ({
  publicApi: {
    customer: { getProfile: vi.fn() },
  },
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Siti', role: 'ROLE_CUSTOMER' }, logout: vi.fn() }),
}));

vi.mock('../../../components/CustomerLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="customer-layout">{children}</div>,
}));

import { publicApi } from '../../../lib/api';

function renderReferral() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <CustomerReferralPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('CustomerReferralPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders referral code heading', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: { id: 'cust-1', referralCode: 'DEKAT-ABC123' } });
    renderReferral();
    await waitFor(() => {
      expect(screen.getByText('Kode Referral Anda')).toBeInTheDocument();
    });
  });

  it('renders CustomerLayout', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: { id: 'cust-1', referralCode: 'DEKAT-ABC123' } });
    renderReferral();
    await waitFor(() => {
      expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
    });
  });

  it('shows referral stats', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: { id: 'cust-1', referralCode: 'DEKAT-ABC123', referralCount: 5 } });
    renderReferral();
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Teman Diundang')).toBeInTheDocument();
    });
  });

  it('shows empty referral history', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: { id: 'cust-1', referralCode: 'DEKAT-ABC123' } });
    renderReferral();
    await waitFor(() => {
      expect(screen.getByText('Belum Ada Referral')).toBeInTheDocument();
    });
  });

  it('renders share buttons', async () => {
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: { id: 'cust-1', referralCode: 'DEKAT-ABC123' } });
    renderReferral();
    await waitFor(() => {
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.getByText('Twitter / X')).toBeInTheDocument();
    });
  });
});
