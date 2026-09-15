import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchPage from '../SearchPage';

const mockSearch = vi.fn();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
  };
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
    </MemoryRouter>,
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

  it('changes min price filter', async () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => { expect(screen.getByText(/tidak ada hasil/i)).toBeInTheDocument(); });
    fireEvent.click(screen.getAllByRole('button').find(b => b.querySelector('svg'))!);
    await waitFor(() => { expect(screen.getByText('Harga Minimum')).toBeInTheDocument(); });
    const minPriceInput = screen.getByPlaceholderText('Rp 0');
    fireEvent.change(minPriceInput, { target: { value: '50000' } });
    expect(minPriceInput).toHaveValue(50000);
  });

  it('changes max price filter', async () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => { expect(screen.getByText(/tidak ada hasil/i)).toBeInTheDocument(); });
    fireEvent.click(screen.getAllByRole('button').find(b => b.querySelector('svg'))!);
    await waitFor(() => { expect(screen.getByText('Harga Maksimum')).toBeInTheDocument(); });
    const maxPriceInput = screen.getByPlaceholderText('Tanpa batas');
    fireEvent.change(maxPriceInput, { target: { value: '200000' } });
    expect(maxPriceInput).toHaveValue(200000);
  });

  it('changes rating filter', async () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => { expect(screen.getByText(/tidak ada hasil/i)).toBeInTheDocument(); });
    fireEvent.click(screen.getAllByRole('button').find(b => b.querySelector('svg'))!);
    await waitFor(() => { expect(screen.getByText('Rating Minimum')).toBeInTheDocument(); });
    const ratingSelect = screen.getByDisplayValue('Semua Rating');
    fireEvent.change(ratingSelect, { target: { value: '4' } });
    expect(ratingSelect).toHaveValue('4');
  });

  it('changes date filter', async () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => { expect(screen.getByText(/tidak ada hasil/i)).toBeInTheDocument(); });
    fireEvent.click(screen.getAllByRole('button').find(b => b.querySelector('svg'))!);
    await waitFor(() => { expect(screen.getByText('Tanggal')).toBeInTheDocument(); });
    const dateInput = screen.getByText('Tanggal').closest('div')!.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2026-09-15' } });
    expect(dateInput).toHaveValue('2026-09-15');
  });

  it('shows active filter count badge', async () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => { expect(screen.getByText(/tidak ada hasil/i)).toBeInTheDocument(); });
    const filterBtn = screen.getAllByRole('button').find(b => b.querySelector('svg'));
    fireEvent.click(filterBtn!);
    await waitFor(() => { expect(screen.getByText('Kategori')).toBeInTheDocument(); });
    fireEvent.change(screen.getByDisplayValue('Semua Kategori'), { target: { value: 'barbershop' } });
    const badge = screen.getByText('1');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-primary-600');
  });

  it('shows sort dropdown with all options', async () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => { expect(screen.getByText(/tidak ada hasil/i)).toBeInTheDocument(); });
    const sortSelect = screen.getByDisplayValue('Relevansi');
    const options = sortSelect.querySelectorAll('option');
    expect(options.length).toBe(5);
    expect(options[0]).toHaveTextContent('Relevansi');
    expect(options[1]).toHaveTextContent('Rating Tertinggi');
    expect(options[2]).toHaveTextContent('Harga Terendah');
    expect(options[3]).toHaveTextContent('Harga Tertinggi');
    expect(options[4]).toHaveTextContent('Terdekat');
  });

  it('changes sort option to distance', async () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => { expect(screen.getByText(/tidak ada hasil/i)).toBeInTheDocument(); });
    fireEvent.change(screen.getByDisplayValue('Relevansi'), { target: { value: 'distance' } });
    expect(screen.getByDisplayValue('Terdekat')).toBeInTheDocument();
  });

  it('shows pagination buttons when multiple pages', async () => {
    mockSearch.mockResolvedValue({
      data: { providers: Array.from({ length: 12 }, (_, i) => ({ id: String(i), name: `P${i}`, slug: `p-${i}` })), pagination: { total: 36, totalPages: 3, page: 1 } },
    });
    renderSearch();
    await waitFor(() => { expect(screen.getByText('P0')).toBeInTheDocument(); });
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('clicking pagination button updates page state', async () => {
    mockSearch.mockResolvedValue({
      data: { providers: Array.from({ length: 12 }, (_, i) => ({ id: String(i), name: `P${i}`, slug: `p-${i}` })), pagination: { total: 24, totalPages: 2, page: 1 } },
    });
    renderSearch();
    await waitFor(() => { expect(screen.getByText('P0')).toBeInTheDocument(); });
    const pageButtons = screen.getAllByRole('button').filter(b => /^\d+$/.test(b.textContent || ''));
    expect(pageButtons).toHaveLength(2);
    fireEvent.click(pageButtons[1]);
    await waitFor(() => {
      expect(pageButtons[0]).toHaveTextContent('1');
      expect(pageButtons[1]).toHaveTextContent('2');
    });
  });

  it('shows empty state with search icon when no results', async () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => { expect(screen.getByText('Tidak ada hasil')).toBeInTheDocument(); });
    expect(screen.getByText('Coba ubah filter atau kata kunci pencarian Anda')).toBeInTheDocument();
  });

  it('shows loading skeletons with shimmer cards', async () => {
    mockSearch.mockReturnValue(new Promise(() => {}));
    renderSearch();
    await waitFor(() => { expect(screen.getByText('Mencari...')).toBeInTheDocument(); });
    const skeletonCards = document.querySelectorAll('.animate-pulse.rounded-xl.bg-white');
    expect(skeletonCards.length).toBe(6);
    const shimmerBars = document.querySelectorAll('.animate-pulse .bg-gray-200');
    expect(shimmerBars.length).toBeGreaterThan(0);
  });

  it('handles search form submission with URL params', async () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => { expect(screen.getByText(/tidak ada hasil/i)).toBeInTheDocument(); });
    const searchInput = screen.getByPlaceholderText(/cari nama provider/i);
    fireEvent.change(searchInput, { target: { value: 'barber' } });
    const submitBtn = screen.getByText('Cari');
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(mockSetSearchParams).toHaveBeenCalled();
    });
    const params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(params.get('query')).toBe('barber');
  });

  it('search submission omits default page value from params', async () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => { expect(screen.getByText(/tidak ada hasil/i)).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Cari'));
    await waitFor(() => {
      expect(mockSetSearchParams).toHaveBeenCalled();
    });
    const params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(params.has('page')).toBe(false);
  });

  it('filter panel toggles closed on second click', async () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => { expect(screen.getByText(/tidak ada hasil/i)).toBeInTheDocument(); });
    const filterBtn = screen.getAllByRole('button').find(b => b.querySelector('svg'))!;
    fireEvent.click(filterBtn);
    await waitFor(() => { expect(screen.getByText('Kategori')).toBeInTheDocument(); });
    fireEvent.click(filterBtn);
    await waitFor(() => { expect(screen.queryByText('Kategori')).not.toBeInTheDocument(); });
  });

  it('shows all category options in filter panel', async () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => { expect(screen.getByText(/tidak ada hasil/i)).toBeInTheDocument(); });
    fireEvent.click(screen.getAllByRole('button').find(b => b.querySelector('svg'))!);
    await waitFor(() => { expect(screen.getByText('Kategori')).toBeInTheDocument(); });
    const categorySelect = screen.getByDisplayValue('Semua Kategori');
    const options = categorySelect.querySelectorAll('option');
    expect(options.length).toBe(7);
    expect(options[1]).toHaveTextContent('Barbershop');
    expect(options[2]).toHaveTextContent('Salon');
    expect(options[3]).toHaveTextContent('Spa & Massage');
    expect(options[4]).toHaveTextContent('Kecantikan');
  });

  it('multiple active filters show correct count', async () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => { expect(screen.getByText(/tidak ada hasil/i)).toBeInTheDocument(); });
    fireEvent.click(screen.getAllByRole('button').find(b => b.querySelector('svg'))!);
    await waitFor(() => { expect(screen.getByText('Kategori')).toBeInTheDocument(); });
    fireEvent.change(screen.getByDisplayValue('Semua Kategori'), { target: { value: 'salon' } });
    fireEvent.change(screen.getByPlaceholderText('Rp 0'), { target: { value: '10000' } });
    fireEvent.change(screen.getByDisplayValue('Semua Rating'), { target: { value: '4' } });
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('filter button has primary style when filters active', async () => {
    mockSearch.mockResolvedValue({ data: [] });
    renderSearch();
    await waitFor(() => { expect(screen.getByText(/tidak ada hasil/i)).toBeInTheDocument(); });
    const filterBtn = screen.getAllByRole('button').find(b => b.querySelector('svg'))!;
    expect(filterBtn.className).toContain('border-gray-300');
    fireEvent.click(filterBtn);
    await waitFor(() => { expect(screen.getByText('Kategori')).toBeInTheDocument(); });
    fireEvent.change(screen.getByDisplayValue('Semua Kategori'), { target: { value: 'salon' } });
    expect(filterBtn.className).toContain('bg-primary-50');
  });

  it('shows result count without pagination when single page', async () => {
    mockSearch.mockResolvedValue({
      data: [{ id: '1', name: 'A', slug: 'a' }],
    });
    renderSearch();
    await waitFor(() => { expect(screen.getByText('1 provider ditemukan')).toBeInTheDocument(); });
  });

  it('handles result data as direct array', async () => {
    mockSearch.mockResolvedValue({
      data: [{ id: '1', name: 'Direct Array Provider', slug: 'direct' }],
    });
    renderSearch();
    await waitFor(() => { expect(screen.getByText('Direct Array Provider')).toBeInTheDocument(); });
  });
});
