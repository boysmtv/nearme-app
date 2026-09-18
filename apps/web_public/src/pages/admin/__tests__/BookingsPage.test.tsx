import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BookingsPage from '../BookingsPage';

vi.mock('../../../lib/api', () => ({
  adminApi: { bookings: { list: vi.fn() }, export: { bookings: vi.fn() } },
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
        {onPageChange && <button onClick={() => onPageChange(2)}>Next Page</button>}
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

function renderBookingsPage(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <BookingsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const mockBookings = [
  { id: 'b1', code: 'DKT-001', customerName: 'Budi Santoso', providerName: 'Barber Central', serviceName: 'Haircut', startTime: '2026-09-10T10:00:00Z', status: 'CONFIRMED', totalAmount: 50000 },
  { id: 'b2', code: 'DKT-002', customerName: 'Siti Aminah', providerName: 'Salon Dewi', serviceName: 'Facial', startTime: '2026-09-10T14:00:00Z', status: 'COMPLETED', totalAmount: 120000 },
  { id: 'b3', code: 'DKT-003', customerName: 'Andi Wijaya', providerName: 'Spa Relax', serviceName: 'Massage', startTime: '2026-09-11T09:00:00Z', status: 'CANCELLED', totalAmount: 80000 },
];

describe('web_public admin BookingsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders heading and description', async () => {
    (adminApi.bookings.list as any).mockResolvedValue({ data: { data: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 20 } } });
    renderBookingsPage();
    await waitFor(() => {
      expect(screen.getByText('Bookings')).toBeInTheDocument();
    });
    expect(screen.getByText('Semua booking di platform')).toBeInTheDocument();
  });

  it('renders empty table when no bookings', async () => {
    (adminApi.bookings.list as any).mockResolvedValue({ data: { data: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 20 } } });
    renderBookingsPage();
    await waitFor(() => {
      expect(screen.getByTestId('empty')).toBeInTheDocument();
    });
    expect(screen.getByText('Tidak ada booking')).toBeInTheDocument();
  });

  it('renders booking data in table', async () => {
    (adminApi.bookings.list as any).mockResolvedValue({
      data: { data: mockBookings, pagination: { page: 1, totalPages: 1, total: 3, limit: 20 } },
    });
    renderBookingsPage();
    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });
    expect(screen.getByText('DKT-001')).toBeInTheDocument();
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByText('Barber Central')).toBeInTheDocument();
    expect(screen.getByText('Haircut')).toBeInTheDocument();
    expect(screen.getByText('DKT-002')).toBeInTheDocument();
    expect(screen.getByText('Siti Aminah')).toBeInTheDocument();
    // Status badges
    const badges = screen.getAllByTestId('status-badge');
    expect(badges.length).toBe(3);
  });

  it('renders status filter dropdown with all statuses', async () => {
    (adminApi.bookings.list as any).mockResolvedValue({ data: { data: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 20 } } });
    renderBookingsPage();
    await waitFor(() => {
      expect(screen.getByText('Bookings')).toBeInTheDocument();
    });
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Semua Status')).toBeInTheDocument();
    expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
    expect(screen.getByText('CANCELLED')).toBeInTheDocument();
  });

  it('calls API with status filter when changed', async () => {
    (adminApi.bookings.list as any).mockResolvedValue({ data: { data: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 20 } } });
    const user = userEvent.setup();
    renderBookingsPage();
    await waitFor(() => {
      expect(screen.getByText('Bookings')).toBeInTheDocument();
    });
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'CONFIRMED');
    await waitFor(() => {
      expect(adminApi.bookings.list).toHaveBeenCalledWith(expect.objectContaining({ status: 'CONFIRMED' }));
    });
  });

  it('renders Export CSV button', async () => {
    (adminApi.bookings.list as any).mockResolvedValue({ data: { data: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 20 } } });
    renderBookingsPage();
    await waitFor(() => {
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });
  });

  it('exports CSV via downloadBlob', async () => {
    (adminApi.bookings.list as any).mockResolvedValue({ data: { data: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 20 } } });
    (adminApi.export.bookings as any).mockResolvedValue(new Blob(['a,b'], { type: 'text/csv' }));
    const createSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:bookings');
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {});
    const user = userEvent.setup();
    renderBookingsPage();
    await waitFor(() => {
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Export CSV'));
    await waitFor(() => {
      expect(adminApi.export.bookings).toHaveBeenCalledWith('csv');
    });
    expect(createSpy).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalledWith('blob:bookings');
    createSpy.mockRestore();
    revokeSpy.mockRestore();
    clickSpy.mockRestore();
  });

  it('export failure logs error and resets button', async () => {
    (adminApi.bookings.list as any).mockResolvedValue({ data: { data: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 20 } } });
    (adminApi.export.bookings as any).mockRejectedValue(new Error('gagal'));
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    renderBookingsPage();
    await waitFor(() => {
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Export CSV'));
    await waitFor(() => {
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });
    errSpy.mockRestore();
  });
});
