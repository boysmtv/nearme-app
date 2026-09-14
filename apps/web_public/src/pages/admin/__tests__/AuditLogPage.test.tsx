import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuditLogPage from '../AuditLogPage';

vi.mock('../../../lib/api', () => ({
  adminApi: { auditLogs: { list: vi.fn() } },
}));

vi.mock('../../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

vi.mock('../../../components/admin/StatusBadge', () => ({
  default: ({ status }: { status: string }) => <span data-testid="status-badge">{status}</span>,
}));

import { adminApi } from '../../../lib/api';
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderAuditLog() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AuditLogPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('web_public admin AuditLogPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders Audit Logs heading', () => {
    (adminApi.auditLogs.list as any).mockResolvedValue({ data: [] });
    renderAuditLog();
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
  });

  it('shows empty state when no data', async () => {
    (adminApi.auditLogs.list as any).mockResolvedValue({ data: [] });
    renderAuditLog();
    await waitFor(() => {
      expect(screen.getByText('Tidak ada audit log ditemukan')).toBeInTheDocument();
    });
  });

  it('renders audit entries when data loads', async () => {
    (adminApi.auditLogs.list as any).mockResolvedValue({
      data: [{ id: '1', action: 'USER_LOGIN', actorId: 'abc-123-def-456', resourceType: 'USER', resourceId: 'xyz-789', result: 'SUCCESS', ipAddress: '127.0.0.1', createdAt: '2024-01-01T00:00:00Z' }],
    });
    renderAuditLog();
    await waitFor(() => {
      expect(screen.getByText('USER_LOGIN')).toBeInTheDocument();
    });
  });
});
