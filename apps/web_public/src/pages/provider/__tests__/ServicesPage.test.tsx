import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServicesPage from '../ServicesPage';

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

vi.mock('../../../lib/api', () => ({
  providerApi: {
    services: { list: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

vi.mock('../../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="provider-layout">{children}</div>,
}));

import { providerApi } from '../../../lib/api';

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderServices(qc?: ReturnType<typeof createQueryClient>) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <ServicesPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('ServicesPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders Services heading', async () => {
    (providerApi.services.list as any).mockResolvedValue({ data: [] });
    renderServices();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /layanan/i })).toBeInTheDocument();
    });
  });

  it('renders ProviderLayout', () => {
    (providerApi.services.list as any).mockResolvedValue({ data: [] });
    renderServices();
    expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
  });

  it('renders service list when data loads', async () => {
    (providerApi.services.list as any).mockResolvedValue({
      data: [{ id: '1', name: 'Haircut', price: 50000, duration: 30, active: true, description: 'Potong rapi' }],
    });
    renderServices();
    await waitFor(() => {
      expect(screen.getByText('Haircut')).toBeInTheDocument();
    });
  });

  it('shows empty state when no services', async () => {
    (providerApi.services.list as any).mockResolvedValue({ data: [] });
    renderServices();
    await waitFor(() => {
      expect(screen.getByText(/belum ada layanan/i)).toBeInTheDocument();
    });
  });
});
