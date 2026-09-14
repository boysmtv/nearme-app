import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchPage from '../SearchPage';

const mockSearch = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn(), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

vi.mock('../../lib/api', () => ({
  publicApi: {
    providers: { search: (...args: unknown[]) => mockSearch(...args) },
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
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    expect(screen.getByPlaceholderText(/cari nama provider/i)).toBeInTheDocument();
  });

  it('renders sort options', () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    expect(screen.getByDisplayValue('Relevansi')).toBeInTheDocument();
  });

  it('renders provider results when data loads', async () => {
    mockSearch.mockResolvedValue({
      data: [{ id: '1', name: 'Barber Shop', slug: 'barber-shop' }],
    });
    renderSearch();
    await waitFor(() => { expect(screen.getByText('Barber Shop')).toBeInTheDocument(); });
  });

  it('shows empty state when no results', async () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => { expect(screen.getByText(/tidak ada hasil/i)).toBeInTheDocument(); });
  });

  it('shows loading state', async () => {
    mockSearch.mockReturnValue(new Promise(() => {}));
    renderSearch();
    await waitFor(() => { expect(screen.getByText('Mencari...')).toBeInTheDocument(); });
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('filter toggle button shows/hides filter panel', async () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => { expect(screen.getByText(/tidak ada hasil/i)).toBeInTheDocument(); });
    const filterBtn = screen.getAllByRole('button').find(b => b.querySelector('svg'));
    fireEvent.click(filterBtn!);
    await waitFor(() => { expect(screen.getByText('Kategori')).toBeInTheDocument(); });
    expect(screen.getByText('Harga Minimum')).toBeInTheDocument();
    expect(screen.getByText('Harga Maksimum')).toBeInTheDocument();
    expect(screen.getByText('Rating Minimum')).toBeInTheDocument();
    expect(screen.getByText('Tanggal')).toBeInTheDocument();
  });

  it('category filter changes value', async () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => { expect(screen.getByText(/tidak ada hasil/i)).toBeInTheDocument(); });
    fireEvent.click(screen.getAllByRole('button').find(b => b.querySelector('svg'))!);
    await waitFor(() => { expect(screen.getByText('Kategori')).toBeInTheDocument(); });
    const select = screen.getByDisplayValue('Semua Kategori');
    fireEvent.change(select, { target: { value: 'barbershop' } });
    expect(select).toHaveValue('barbershop');
  });

  it('sort select changes value', async () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => { expect(screen.getByText(/tidak ada hasil/i)).toBeInTheDocument(); });
    fireEvent.change(screen.getByDisplayValue('Relevansi'), { target: { value: 'rating' } });
    expect(screen.getByDisplayValue('Rating Tertinggi')).toBeInTheDocument();
  });

  it('location input changes value', async () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => { expect(screen.getByText(/tidak ada hasil/i)).toBeInTheDocument(); });
    fireEvent.change(screen.getByPlaceholderText('Lokasi'), { target: { value: 'Jakarta' } });
    expect(screen.getByPlaceholderText('Lokasi')).toHaveValue('Jakarta');
  });

  it('pagination renders when multiple pages', async () => {
    mockSearch.mockResolvedValue({
      data: { providers: Array.from({ length: 12 }, (_, i) => ({ id: String(i), name: `Provider ${i}`, slug: `p-${i}` })), pagination: { total: 24, totalPages: 2, page: 1 } },
    });
    renderSearch();
    await waitFor(() => { expect(screen.getByText('Provider 0')).toBeInTheDocument(); });
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('result count shows total', async () => {
    mockSearch.mockResolvedValue({
      data: { providers: [{ id: '1', name: 'A', slug: 'a' }], pagination: { total: 5, totalPages: 1, page: 1 } },
    });
    renderSearch();
    await waitFor(() => { expect(screen.getByText('5 provider ditemukan')).toBeInTheDocument(); });
  });
});
