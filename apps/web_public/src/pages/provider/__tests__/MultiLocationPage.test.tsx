import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MultiLocationPage from '../MultiLocationPage';

vi.mock('../../../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

import { api } from '../../../lib/api';

const mockGet = api.get as ReturnType<typeof vi.fn>;
const mockPost = api.post as ReturnType<typeof vi.fn>;

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <MultiLocationPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('MultiLocationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: [] });
  });

  it('renders heading', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /multi-lokasi/i })).toBeInTheDocument();
  });

  it('shows empty state when no locations', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/belum ada lokasi tambahan/i)).toBeInTheDocument();
    });
  });

  it('renders location cards when data exists', async () => {
    mockGet.mockResolvedValue({
      data: [{ id: 'l1', name: 'Cabang Utama', address: 'Jl. Sudirman 10', phone: '08123456', isMain: true, staffCount: 5, bookingCount: 120 }],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Cabang Utama')).toBeInTheDocument();
    });
    expect(screen.getByText('Jl. Sudirman 10')).toBeInTheDocument();
  });

  it('shows Tambah Lokasi button', async () => {
    renderPage();
    expect(screen.getByRole('button', { name: /tambah lokasi/i })).toBeInTheDocument();
  });
});
