import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import SocialFeedPage from '../SocialFeedPage';

vi.mock('../../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from '../../../lib/api';

function renderFeed() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <SocialFeedPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('SocialFeedPage', () => {
  it('renders feed heading', async () => {
    const { waitFor } = await import('@testing-library/react');
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/social/feed') return Promise.resolve({ data: [] });
      if (url === '/social/trending') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    renderFeed();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /feed/i })).toBeInTheDocument();
    });
  });

  it('shows empty state when no posts', async () => {
    const { waitFor } = await import('@testing-library/react');
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/social/feed') return Promise.resolve({ data: [] });
      if (url === '/social/trending') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    renderFeed();
    await waitFor(() => {
      expect(screen.getByText('Belum ada postingan')).toBeInTheDocument();
    });
  });

  it('renders post when data is available', async () => {
    const { waitFor } = await import('@testing-library/react');
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/social/feed') return Promise.resolve({
        data: [{ id: '1', providerId: 'p1', providerName: 'Barber Shop', type: 'PROMO', title: 'Promo Spesial', body: 'Diskon 50%', likes: 10, comments: 5, isLiked: false, isFollowing: false, createdAt: new Date().toISOString() }],
      });
      if (url === '/social/trending') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    renderFeed();
    await waitFor(() => {
      expect(screen.getByText('Barber Shop')).toBeInTheDocument();
      expect(screen.getByText('Promo Spesial')).toBeInTheDocument();
    });
  });

  it('renders trending sidebar', async () => {
    const { waitFor } = await import('@testing-library/react');
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/social/feed') return Promise.resolve({ data: [] });
      if (url === '/social/trending') return Promise.resolve({
        data: [{ id: 't1', name: 'Trending Barbershop', followers: 100, bookingCount: 25 }],
      });
      return Promise.resolve({ data: [] });
    });
    renderFeed();
    await waitFor(() => {
      expect(screen.getByText(/trending/i)).toBeInTheDocument();
    });
  });
});
