import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UsersPage from '../UsersPage';

vi.mock('../../lib/api', () => ({
  adminApi: {
    users: { list: vi.fn(), updateStatus: vi.fn() },
  },
}));

vi.mock('../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

import { adminApi } from '../../lib/api';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderUsers() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <UsersPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('UsersPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders Users heading', () => {
    (adminApi.users.list as any).mockResolvedValue({ data: { data: [], total: 0 } });
    renderUsers();
    expect(screen.getByText(/users/i)).toBeInTheDocument();
  });

  it('renders user list when data loads', async () => {
    (adminApi.users.list as any).mockResolvedValue({
      data: {
        data: [
          { id: '1', name: 'Budi', email: 'budi@test.com', role: 'ROLE_CUSTOMER', status: 'ACTIVE', createdAt: '2024-01-01' },
        ],
        total: 1,
      },
    });
    renderUsers();
    await waitFor(() => {
      expect(screen.getByText('Budi')).toBeInTheDocument();
      expect(screen.getByText('budi@test.com')).toBeInTheDocument();
    });
  });

  it('shows empty state when no users', async () => {
    (adminApi.users.list as any).mockResolvedValue({ data: { data: [], total: 0 } });
    renderUsers();
    await waitFor(() => {
      expect(screen.getByText(/tidak ada/i)).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    (adminApi.users.list as any).mockReturnValue(new Promise(() => {}));
    renderUsers();
    expect(screen.getByText(/users/i)).toBeInTheDocument();
  });
});
