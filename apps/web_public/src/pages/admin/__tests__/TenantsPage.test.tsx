import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TenantsPage from '../TenantsPage';

vi.mock('../../../lib/api', () => ({
  adminApi: { tenants: { list: vi.fn(), approve: vi.fn(), reject: vi.fn() } },
}));

vi.mock('../../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

vi.mock('../../../components/admin/DataTable', () => ({
  default: ({ columns, data, pagination, onPageChange, isLoading, emptyMessage }: any) => {
    if (isLoading) return <div data-testid="loading">Loading...</div>;
    if (data.length === 0) return <div data-testid="empty">{emptyMessage}</div>;
    return (
      <div data-testid="data-table">
        <table>
          <thead>
            <tr>{columns.map((c: any) => <th key={c.key}>{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((item: any) => (
              <tr key={item.id} data-testid={`row-${item.id}`}>
                {columns.map((c: any) => <td key={c.key}>{c.render ? c.render(item) : item[c.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {pagination && pagination.totalPages > 1 && (
          <div data-testid="pagination">Page {pagination.page} of {pagination.totalPages}</div>
        )}
      </div>
    );
  },
}));

vi.mock('../../../components/admin/StatusBadge', () => ({
  default: ({ status }: { status: string }) => <span data-testid="status-badge">{status}</span>,
}));

import { adminApi } from '../../../lib/api';

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
}

function renderTenantsPage(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <TenantsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const mockTenants = [
  { id: 't1', name: 'Barber Central', category: 'Barbershop', ownerName: 'Budi', status: 'APPROVED', totalBookings: 120, totalRevenue: 15000000 },
  { id: 't2', name: 'Salon Dewi', category: 'Salon', ownerName: 'Dewi', status: 'SUBMITTED', totalBookings: 0, totalRevenue: 0 },
  { id: 't3', name: 'Spa Relax', category: 'Spa', ownerName: 'Rina', status: 'SUSPENDED', totalBookings: 50, totalRevenue: 5000000 },
];

describe('web_public admin TenantsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders heading and description', async () => {
    (adminApi.tenants.list as any).mockResolvedValue({ data: { data: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 20 } } });
    renderTenantsPage();
    await waitFor(() => {
      expect(screen.getByText('Tenants')).toBeInTheDocument();
    });
    expect(screen.getByText('Kelola provider dan verifikasi')).toBeInTheDocument();
  });

  it('renders empty table when no tenants', async () => {
    (adminApi.tenants.list as any).mockResolvedValue({ data: { data: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 20 } } });
    renderTenantsPage();
    await waitFor(() => {
      expect(screen.getByTestId('empty')).toBeInTheDocument();
    });
    expect(screen.getByText('Tidak ada tenant')).toBeInTheDocument();
  });

  it('renders tenant data in table', async () => {
    (adminApi.tenants.list as any).mockResolvedValue({
      data: { data: mockTenants, pagination: { page: 1, totalPages: 1, total: 3, limit: 20 } },
    });
    renderTenantsPage();
    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });
    expect(screen.getByText('Barber Central')).toBeInTheDocument();
    expect(screen.getByText('Barbershop')).toBeInTheDocument();
    expect(screen.getByText('Budi')).toBeInTheDocument();
    expect(screen.getByText('Salon Dewi')).toBeInTheDocument();
    expect(screen.getByText('Dewi')).toBeInTheDocument();
    expect(screen.getByText('Spa Relax')).toBeInTheDocument();
    // Status badges
    const badges = screen.getAllByTestId('status-badge');
    expect(badges.length).toBe(3);
    // Approve/Reject buttons for SUBMITTED tenant
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('renders search input and status filter', async () => {
    (adminApi.tenants.list as any).mockResolvedValue({ data: { data: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 20 } } });
    renderTenantsPage();
    await waitFor(() => {
      expect(screen.getByText('Tenants')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Cari tenant...')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Semua Status')).toBeInTheDocument();
  });

  it('calls API with search term', async () => {
    (adminApi.tenants.list as any).mockResolvedValue({ data: { data: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 20 } } });
    const user = userEvent.setup();
    renderTenantsPage();
    await waitFor(() => {
      expect(screen.getByText('Tenants')).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText('Cari tenant...');
    await user.type(input, 'barber');
    await waitFor(() => {
      expect(adminApi.tenants.list).toHaveBeenCalledWith(expect.objectContaining({ search: 'barber' }));
    });
  });

  it('opens reject modal when Reject clicked', async () => {
    (adminApi.tenants.list as any).mockResolvedValue({
      data: { data: mockTenants, pagination: { page: 1, totalPages: 1, total: 3, limit: 20 } },
    });
    const user = userEvent.setup();
    renderTenantsPage();
    await waitFor(() => {
      expect(screen.getByText('Reject')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Reject'));
    expect(screen.getByText('Tolak Tenant')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Alasan penolakan...')).toBeInTheDocument();
    expect(screen.getByText('Batal')).toBeInTheDocument();
    expect(screen.getByText('Tolak')).toBeInTheDocument();
  });

  it('closes reject modal when Batal clicked', async () => {
    (adminApi.tenants.list as any).mockResolvedValue({
      data: { data: mockTenants, pagination: { page: 1, totalPages: 1, total: 3, limit: 20 } },
    });
    const user = userEvent.setup();
    renderTenantsPage();
    await waitFor(() => {
      expect(screen.getByText('Reject')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Reject'));
    await user.click(screen.getByText('Batal'));
    expect(screen.queryByText('Tolak Tenant')).not.toBeInTheDocument();
  });

  it('calls approveMut when Approve clicked', async () => {
    (adminApi.tenants.list as any).mockResolvedValue({
      data: { data: mockTenants, pagination: { page: 1, totalPages: 1, total: 3, limit: 20 } },
    });
    (adminApi.tenants.approve as any).mockResolvedValue({});
    const user = userEvent.setup();
    renderTenantsPage();
    await waitFor(() => {
      expect(screen.getByText('Approve')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Approve'));
    expect(adminApi.tenants.approve).toHaveBeenCalledWith('t2');
  });
});
