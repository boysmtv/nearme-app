import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchPage from '../SearchPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn(), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

vi.mock('../../lib/api', () => ({
  publicApi: {
    providers: { search: vi.fn() },
    categories: { list: vi.fn() },
  },
}));

vi.mock('../../components/Header', () => ({
  default: () => <header>Header</header>,
}));

vi.mock('../../components/Footer', () => ({
  default: () => <footer>Footer</footer>,
}));

vi.mock('../../components/ProviderCard', () => ({
  default: ({ provider }: any) => <div data-testid="provider-card">{provider.name}</div>,
}));

vi.mock('../../components/ThemeToggle', () => ({
  default: () => <button data-testid="theme-toggle">Toggle</button>,
}));

import { publicApi } from '../../lib/api';

function renderSearch() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <SearchPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('SearchPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders search input', () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: [] });
    renderSearch();
    expect(screen.getByPlaceholderText(/cari nama provider/i)).toBeInTheDocument();
  });

  it('renders sort options', () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: [] });
    renderSearch();
    expect(screen.getByDisplayValue('Relevansi')).toBeInTheDocument();
  });

  it('renders provider results when data loads', async () => {
    (publicApi.providers.search as any).mockResolvedValue({
      data: [{ id: '1', name: 'Barber Shop', slug: 'barber-shop' }],
    });
    renderSearch();
    await waitFor(() => {
      expect(screen.getByText('Barber Shop')).toBeInTheDocument();
    });
  });

  it('shows empty state when no results', async () => {
    (publicApi.providers.search as any).mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => {
      expect(screen.getByText(/tidak ada hasil/i)).toBeInTheDocument();
    });
  });
});
