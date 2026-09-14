import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerFavoritesPage from '../CustomerFavoritesPage';

vi.mock('../../../lib/api', () => ({
  publicApi: {
    favorites: { list: vi.fn() },
  },
}));

vi.mock('../../../components/CustomerLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="customer-layout">{children}</div>,
}));

import { publicApi } from '../../../lib/api';

let queryClient: QueryClient;

function renderFavorites() {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <CustomerFavoritesPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('CustomerFavoritesPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders Favorit heading', async () => {
    (publicApi.favorites.list as any).mockResolvedValue({ data: [] });
    renderFavorites();
    await waitFor(() => {
      expect(screen.getByText('Favorit')).toBeInTheDocument();
    });
  });

  it('shows empty state when no favorites', async () => {
    (publicApi.favorites.list as any).mockResolvedValue({ data: [] });
    renderFavorites();
    await waitFor(() => {
      expect(screen.getByText('Belum ada staf favorit')).toBeInTheDocument();
    });
  });

  it('renders favorite staff name when data loads', async () => {
    (publicApi.favorites.list as any).mockResolvedValue({
      data: [{ id: '1', staffName: 'Andi Barber', specialties: 'Haircut, Shave' }],
    });
    renderFavorites();
    await waitFor(() => {
      expect(screen.getByText('Andi Barber')).toBeInTheDocument();
    });
  });
});
