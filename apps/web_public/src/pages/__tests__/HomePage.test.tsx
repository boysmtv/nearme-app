import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HomePage from '../HomePage';

vi.mock('../../lib/api', () => ({
  publicApi: {
    categories: { list: vi.fn() },
    providers: { getFeatured: vi.fn() },
  },
}));

vi.mock('../../components/Header', () => ({
  default: () => <header data-testid="header">Header</header>,
}));

vi.mock('../../components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('../../components/ProviderCard', () => ({
  default: ({ provider }: any) => <div data-testid="provider-card">{provider.name}</div>,
}));

vi.mock('../../components/ThemeToggle', () => ({
  default: () => <button data-testid="theme-toggle">Toggle</button>,
}));

import { publicApi } from '../../lib/api';

function renderHome() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <HomePage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('HomePage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders hero section with main heading', () => {
    (publicApi.categories.list as any).mockResolvedValue({ data: [] });
    (publicApi.providers.getFeatured as any).mockResolvedValue({ data: [] });
    renderHome();
    expect(screen.getByText(/lihat harga\. pilih jadwal/i)).toBeInTheDocument();
  });

  it('renders Header and Footer components', () => {
    (publicApi.categories.list as any).mockResolvedValue({ data: [] });
    (publicApi.providers.getFeatured as any).mockResolvedValue({ data: [] });
    renderHome();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders hero CTA buttons', () => {
    (publicApi.categories.list as any).mockResolvedValue({ data: [] });
    (publicApi.providers.getFeatured as any).mockResolvedValue({ data: [] });
    renderHome();
    expect(screen.getAllByText('Cari Layanan').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Jadi Provider')).toBeInTheDocument();
  });

  it('renders How it Works section', () => {
    (publicApi.categories.list as any).mockResolvedValue({ data: [] });
    (publicApi.providers.getFeatured as any).mockResolvedValue({ data: [] });
    renderHome();
    expect(screen.getByText('Cara Kerja')).toBeInTheDocument();
  });

  it('renders categories section heading', () => {
    (publicApi.categories.list as any).mockResolvedValue({ data: [] });
    (publicApi.providers.getFeatured as any).mockResolvedValue({ data: [] });
    renderHome();
    expect(screen.getByText('Kategori Populer')).toBeInTheDocument();
  });

  it('renders CTA section for providers', () => {
    (publicApi.categories.list as any).mockResolvedValue({ data: [] });
    (publicApi.providers.getFeatured as any).mockResolvedValue({ data: [] });
    renderHome();
    expect(screen.getByText(/punya usaha jasa/i)).toBeInTheDocument();
  });

  it('renders featured providers when data available', async () => {
    (publicApi.categories.list as any).mockResolvedValue({ data: [] });
    (publicApi.providers.getFeatured as any).mockResolvedValue({
      data: [{ id: '1', name: 'Barber Shop', slug: 'barber-shop' }],
    });
    renderHome();
    await waitFor(() => {
      expect(screen.getAllByText('Barber Shop').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows empty state for featured providers when no data', async () => {
    (publicApi.categories.list as any).mockResolvedValue({ data: [] });
    (publicApi.providers.getFeatured as any).mockResolvedValue({ data: [] });
    renderHome();
    await waitFor(() => {
      expect(screen.getByText(/belum ada provider unggulan/i)).toBeInTheDocument();
    });
  });

  it('shows categories error with retry button', async () => {
    (publicApi.categories.list as any).mockRejectedValue(new Error('gagal'));
    (publicApi.providers.getFeatured as any).mockResolvedValue({ data: [] });
    renderHome();
    await waitFor(() => {
      expect(screen.getByText('Gagal memuat kategori')).toBeInTheDocument();
    });
    (publicApi.categories.list as any).mockResolvedValue({ data: [] });
    fireEvent.click(screen.getByText('Coba Lagi'));
    await waitFor(() => {
      expect(publicApi.categories.list).toHaveBeenCalled();
    });
  });
});
