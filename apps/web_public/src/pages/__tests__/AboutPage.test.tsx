import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AboutPage from '../AboutPage';

vi.mock('../../lib/api', () => ({
  publicApi: {
    faqs: { listPublic: vi.fn() },
    policies: { listPublic: vi.fn() },
  },
}));

vi.mock('../../components/Header', () => ({
  default: () => <header data-testid="header">Header</header>,
}));

vi.mock('../../components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

import { publicApi } from '../../lib/api';

function renderAbout() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AboutPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('AboutPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders heading', () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: [] });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: [] });
    renderAbout();
    expect(screen.getByRole('heading', { name: /tentang dekat/i })).toBeInTheDocument();
  });

  it('renders Header and Footer', () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: [] });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: [] });
    renderAbout();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders FAQ items when data is available', async () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({
      data: [{ id: '1', question: 'Bagaimana cara booking?', answer: 'Pilih layanan lalu jadwal.', category: 'Booking' }],
    });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: [] });
    renderAbout();
    await waitFor(() => {
      expect(screen.getByText('Bagaimana cara booking?')).toBeInTheDocument();
    });
  });

  it('shows empty FAQ when no data', async () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: [] });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: [] });
    renderAbout();
    await waitFor(() => {
      expect(screen.getByText('Belum ada FAQ.')).toBeInTheDocument();
    });
  });

  it('renders feature cards', () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: [] });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: [] });
    renderAbout();
    expect(screen.getByText('Transparan')).toBeInTheDocument();
    expect(screen.getByText('Real-time')).toBeInTheDocument();
    expect(screen.getByText('Provider-First')).toBeInTheDocument();
  });
});
