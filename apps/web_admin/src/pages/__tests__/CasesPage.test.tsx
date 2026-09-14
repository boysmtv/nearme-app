import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CasesPage from '../CasesPage';

vi.mock('../../lib/api', () => ({
  adminApi: {
    cases: { list: vi.fn() },
  },
}));

vi.mock('../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

import { adminApi } from '../../lib/api';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderCases() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <CasesPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('CasesPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders Cases heading', () => {
    (adminApi.cases.list as any).mockResolvedValue({ data: { data: [], total: 0 } });
    renderCases();
    expect(screen.getByText(/cases/i)).toBeInTheDocument();
  });

  it('renders case list when data loads', async () => {
    (adminApi.cases.list as any).mockResolvedValue({
      data: { data: [{ id: '1', caseNumber: 'CS-001', subject: 'Payment Issue', status: 'OPEN', severity: 'HIGH', createdAt: '2024-01-01' }], total: 1 },
    });
    renderCases();
    await waitFor(() => {
      expect(screen.getByText(/CS-001/)).toBeInTheDocument();
      expect(screen.getByText('Payment Issue')).toBeInTheDocument();
    });
  });
});
