import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UsersPage from '../UsersPage';

vi.mock('../../../lib/api', () => ({
  adminApi: { users: { list: vi.fn(), updateStatus: vi.fn() }, export: { users: vi.fn() } },
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

function renderUsersPage(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <UsersPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const mockUsers = [
  { id: 'u1', name: 'Budi Santoso', email: 'budi@test.com', role: 'ROLE_CUSTOMER', status: 'ACTIVE', lastLoginAt: '2026-09-10T08:00:00Z' },
  { id: 'u2', name: 'Admin User', email: 'admin@test.com', role: 'ROLE_PLATFORM_ADMIN', status: 'ACTIVE', lastLoginAt: '2026-09-10T09:00:00Z' },
  { id: 'u3', name: 'Suspended User', email: 'suspended@test.com', role: 'ROLE_CUSTOMER', status: 'SUSPENDED', lastLoginAt: null },
];

describe('web_public admin UsersPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders heading and description', async () => {
    (adminApi.users.list as any).mockResolvedValue({ data: { data: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 20 } } });
    renderUsersPage();
    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
    expect(screen.getByText('Kelola pengguna platform')).toBeInTheDocument();
  });

  it('renders empty table when no users', async () => {
    (adminApi.users.list as any).mockResolvedValue({ data: { data: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 20 } } });
    renderUsersPage();
    await waitFor(() => {
      expect(screen.getByTestId('empty')).toBeInTheDocument();
    });
    expect(screen.getByText('Tidak ada pengguna')).toBeInTheDocument();
  });

  it('renders user data in table', async () => {
    (adminApi.users.list as any).mockResolvedValue({
      data: { data: mockUsers, pagination: { page: 1, totalPages: 1, total: 3, limit: 20 } },
    });
    renderUsersPage();
    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByText('budi@test.com')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    expect(screen.getByText('Suspended User')).toBeInTheDocument();
    expect(screen.getByText('suspended@test.com')).toBeInTheDocument();
    // Role display (uppercase in component)
    expect(screen.getAllByText('ROLE_CUSTOMER').length).toBe(2);
    expect(screen.getByText('ROLE_PLATFORM_ADMIN')).toBeInTheDocument();
    // Suspend buttons for ACTIVE users (u1 + u2), Reactivate for SUSPENDED (u3)
    expect(screen.getAllByText('Suspend').length).toBe(2);
    expect(screen.getByText('Reactivate')).toBeInTheDocument();
  });

  it('renders search input and Export button', async () => {
    (adminApi.users.list as any).mockResolvedValue({ data: { data: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 20 } } });
    renderUsersPage();
    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Cari nama atau email...')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('calls API with search term', async () => {
    (adminApi.users.list as any).mockResolvedValue({ data: { data: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 20 } } });
    const user = userEvent.setup();
    renderUsersPage();
    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText('Cari nama atau email...');
    await user.type(input, 'budi');
    await waitFor(() => {
      expect(adminApi.users.list).toHaveBeenCalledWith(expect.objectContaining({ search: 'budi' }));
    });
  });

  it('calls updateStatus when Suspend clicked', async () => {
    (adminApi.users.list as any).mockResolvedValue({
      data: { data: mockUsers, pagination: { page: 1, totalPages: 1, total: 3, limit: 20 } },
    });
    (adminApi.users.updateStatus as any).mockResolvedValue({});
    const user = userEvent.setup();
    renderUsersPage();
    await waitFor(() => {
      expect(screen.getAllByText('Suspend').length).toBe(2);
    });
    const suspendButtons = screen.getAllByText('Suspend');
    await user.click(suspendButtons[0]);
    expect(adminApi.users.updateStatus).toHaveBeenCalledWith('u1', 'SUSPENDED');
  });

  it('calls updateStatus when Reactivate clicked', async () => {
    (adminApi.users.list as any).mockResolvedValue({
      data: { data: mockUsers, pagination: { page: 1, totalPages: 1, total: 3, limit: 20 } },
    });
    (adminApi.users.updateStatus as any).mockResolvedValue({});
    const user = userEvent.setup();
    renderUsersPage();
    await waitFor(() => {
      expect(screen.getByText('Reactivate')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Reactivate'));
    expect(adminApi.users.updateStatus).toHaveBeenCalledWith('u3', 'ACTIVE');
  });
});
