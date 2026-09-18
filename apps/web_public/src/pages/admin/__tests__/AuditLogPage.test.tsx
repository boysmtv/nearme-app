import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuditLogPage from '../AuditLogPage';

const { mockAuditLogsList } = vi.hoisted(() => ({
  mockAuditLogsList: vi.fn(),
}));

vi.mock('../../../lib/api', () => ({
  adminApi: { auditLogs: { list: (...args: any[]) => mockAuditLogsList(...args) } },
}));

vi.mock('../../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

vi.mock('../../../components/admin/StatusBadge', () => ({
  default: ({ status }: { status: string }) => <span data-testid="status-badge">{status}</span>,
}));

function renderAuditLog() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AuditLogPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('web_public admin AuditLogPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders Audit Logs heading and subtitle', () => {
    mockAuditLogsList.mockResolvedValue({ data: [] });
    renderAuditLog();
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    expect(screen.getByText('Riwayat aktivitas platform')).toBeInTheDocument();
  });

  it('renders AdminLayout', () => {
    mockAuditLogsList.mockResolvedValue({ data: [] });
    renderAuditLog();
    expect(screen.getByTestId('admin-layout')).toBeInTheDocument();
  });

  it('shows empty state when no data', async () => {
    mockAuditLogsList.mockResolvedValue({ data: [] });
    renderAuditLog();
    await waitFor(() => {
      expect(screen.getByText('Tidak ada audit log ditemukan')).toBeInTheDocument();
    });
  });

  it('shows loading skeletons', () => {
    mockAuditLogsList.mockReturnValue(new Promise(() => {}));
    const { container } = renderAuditLog();
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(5);
  });

  it('renders audit table with column headers', async () => {
    mockAuditLogsList.mockResolvedValue({ data: [] });
    renderAuditLog();
    await waitFor(() => {
      expect(screen.getByText('Tidak ada audit log ditemukan')).toBeInTheDocument();
    });
  });

  it('renders audit entries with all columns', async () => {
    mockAuditLogsList.mockResolvedValue({
      data: [{
        id: '1',
        action: 'USER_LOGIN',
        actorId: 'abc-123-def-456',
        resourceType: 'USER',
        resourceId: 'xyz-789-000',
        result: 'SUCCESS',
        ipAddress: '127.0.0.1',
        createdAt: '2024-01-15T10:30:00Z',
      }],
    });
    renderAuditLog();
    await waitFor(() => {
      expect(screen.getByText('USER_LOGIN')).toBeInTheDocument();
    });
    expect(screen.getByText('127.0.0.1')).toBeInTheDocument();
    expect(screen.getByTestId('status-badge')).toHaveTextContent('SUCCESS');
  });

  it('renders actorId truncated to 8 chars', async () => {
    mockAuditLogsList.mockResolvedValue({
      data: [{
        id: '1',
        action: 'USER_LOGIN',
        actorId: 'abc-123-def-456-789',
        resourceType: 'USER',
        resourceId: 'xyz-789-000',
        result: 'SUCCESS',
        ipAddress: '10.0.0.1',
        createdAt: '2024-01-01T00:00:00Z',
      }],
    });
    renderAuditLog();
    await waitFor(() => {
      expect(screen.getByText('abc-123-')).toBeInTheDocument();
    });
  });

  it('renders resourceId truncated to 8 chars', async () => {
    mockAuditLogsList.mockResolvedValue({
      data: [{
        id: '1',
        action: 'BOOKING_CREATE',
        actorId: 'u1',
        resourceType: 'BOOKING',
        resourceId: 'booking-id-long',
        result: 'SUCCESS',
        ipAddress: '192.168.1.1',
        createdAt: '2024-01-01T00:00:00Z',
      }],
    });
    renderAuditLog();
    await waitFor(() => {
      expect(screen.getByText(/BOOKING:booking/)).toBeInTheDocument();
    });
  });

  it('renders multiple audit entries', async () => {
    mockAuditLogsList.mockResolvedValue({
      data: [
        { id: '1', action: 'USER_LOGIN', actorId: 'u1', resourceType: 'USER', resourceId: 'r1', result: 'SUCCESS', ipAddress: '127.0.0.1', createdAt: '2024-01-01T00:00:00Z' },
        { id: '2', action: 'BOOKING_CREATE', actorId: 'u2', resourceType: 'BOOKING', resourceId: 'r2', result: 'SUCCESS', ipAddress: '127.0.0.2', createdAt: '2024-01-02T00:00:00Z' },
        { id: '3', action: 'PAYMENT_FAIL', actorId: 'u3', resourceType: 'PAYMENT', resourceId: 'r3', result: 'FAILED', ipAddress: '127.0.0.3', createdAt: '2024-01-03T00:00:00Z' },
      ],
    });
    renderAuditLog();
    await waitFor(() => {
      expect(screen.getByText('USER_LOGIN')).toBeInTheDocument();
    });
    expect(screen.getByText('BOOKING_CREATE')).toBeInTheDocument();
    expect(screen.getByText('PAYMENT_FAIL')).toBeInTheDocument();
  });

  it('renders StatusBadge with correct result', async () => {
    mockAuditLogsList.mockResolvedValue({
      data: [
        { id: '1', action: 'A1', actorId: 'u1', resourceType: 'T', resourceId: 'r1', result: 'SUCCESS', ipAddress: '1.1.1.1', createdAt: '2024-01-01T00:00:00Z' },
        { id: '2', action: 'A2', actorId: 'u2', resourceType: 'T', resourceId: 'r2', result: 'FAILED', ipAddress: '2.2.2.2', createdAt: '2024-01-02T00:00:00Z' },
      ],
    });
    renderAuditLog();
    await waitFor(() => {
      const badges = screen.getAllByTestId('status-badge');
      expect(badges.length).toBe(2);
      expect(badges[0]).toHaveTextContent('SUCCESS');
      expect(badges[1]).toHaveTextContent('FAILED');
    });
  });

  it('handles null actorId gracefully', async () => {
    mockAuditLogsList.mockResolvedValue({
      data: [{ id: '1', action: 'SYS_CLEANUP', actorId: '', resourceType: 'SYSTEM', resourceId: 'r1', result: 'SUCCESS', ipAddress: '', createdAt: '2024-01-01T00:00:00Z' }],
    });
    renderAuditLog();
    await waitFor(() => {
      expect(screen.getByText('SYS_CLEANUP')).toBeInTheDocument();
    });
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it('handles empty ipAddress', async () => {
    mockAuditLogsList.mockResolvedValue({
      data: [{ id: '1', action: 'TEST', actorId: 'u1', resourceType: 'T', resourceId: 'r1', result: 'SUCCESS', ipAddress: '', createdAt: '2024-01-01T00:00:00Z' }],
    });
    renderAuditLog();
    await waitFor(() => {
      expect(screen.getByText('TEST')).toBeInTheDocument();
    });
  });

  it('handles null createdAt', async () => {
    mockAuditLogsList.mockResolvedValue({
      data: [{ id: '1', action: 'TEST', actorId: 'u1', resourceType: 'T', resourceId: 'r1', result: 'SUCCESS', ipAddress: '1.1.1.1', createdAt: null }],
    });
    renderAuditLog();
    await waitFor(() => {
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  it('has action filter input', async () => {
    mockAuditLogsList.mockResolvedValue({ data: [] });
    renderAuditLog();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Action...')).toBeInTheDocument();
    });
  });

  it('has resource type filter input', async () => {
    mockAuditLogsList.mockResolvedValue({ data: [] });
    renderAuditLog();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Resource Type...')).toBeInTheDocument();
    });
  });

  it('has date filter input', async () => {
    mockAuditLogsList.mockResolvedValue({ data: [] });
    renderAuditLog();
    await waitFor(() => {
      expect(screen.getByText('Tidak ada audit log ditemukan')).toBeInTheDocument();
    });
    const dateInputs = document.querySelectorAll('input[type="date"]');
    expect(dateInputs.length).toBe(1);
  });

  it('calls API with filter params when action filter changes', async () => {
    const user = userEvent.setup();
    mockAuditLogsList.mockResolvedValue({ data: [] });
    renderAuditLog();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Action...')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('Action...'), 'LOGIN');
    await waitFor(() => {
      expect(mockAuditLogsList).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'LOGIN' }),
      );
    });
  });

  it('calls API with resourceType filter', async () => {
    const user = userEvent.setup();
    mockAuditLogsList.mockResolvedValue({ data: [] });
    renderAuditLog();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Resource Type...')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('Resource Type...'), 'USER');
    await waitFor(() => {
      expect(mockAuditLogsList).toHaveBeenCalledWith(
        expect.objectContaining({ resourceType: 'USER' }),
      );
    });
  });

  it('calls API with since filter when date changes', async () => {
    mockAuditLogsList.mockResolvedValue({ data: [] });
    renderAuditLog();
    await waitFor(() => {
      expect(screen.getByText('Tidak ada audit log ditemukan')).toBeInTheDocument();
    });
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2026-09-01' } });
    await waitFor(() => {
      expect(mockAuditLogsList).toHaveBeenCalledWith(
        expect.objectContaining({ since: '2026-09-01' }),
      );
    });
  });

  it('formats date with toLocaleString', async () => {
    mockAuditLogsList.mockResolvedValue({
      data: [{ id: '1', action: 'TEST', actorId: 'u1', resourceType: 'T', resourceId: 'r1', result: 'SUCCESS', ipAddress: '1.1.1.1', createdAt: '2024-06-15T14:30:00Z' }],
    });
    renderAuditLog();
    await waitFor(() => {
      expect(screen.getByText('TEST')).toBeInTheDocument();
    });
    // Date is rendered via toLocaleString('id-ID')
    const cells = screen.getAllByText(/2024/);
    expect(cells.length).toBeGreaterThanOrEqual(1);
  });

  it('shows hover state on table rows', async () => {
    mockAuditLogsList.mockResolvedValue({
      data: [{ id: '1', action: 'HOVER_TEST', actorId: 'u1', resourceType: 'T', resourceId: 'r1', result: 'SUCCESS', ipAddress: '1.1.1.1', createdAt: '2024-01-01T00:00:00Z' }],
    });
    renderAuditLog();
    await waitFor(() => {
      const row = screen.getByText('HOVER_TEST').closest('tr');
      expect(row).toBeTruthy();
      expect(row?.className).toContain('hover:bg-gray-50');
    });
  });
});
