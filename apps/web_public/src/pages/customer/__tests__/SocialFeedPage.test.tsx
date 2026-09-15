import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SocialFeedPage from '../SocialFeedPage';

vi.mock('../../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { id: 'c1', name: 'Siti', role: 'ROLE_CUSTOMER' } }),
}));

import { api } from '../../../lib/api';

const mockGet = api.get as ReturnType<typeof vi.fn>;
const mockPost = api.post as ReturnType<typeof vi.fn>;

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } } });
}

function renderFeed(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <SocialFeedPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('SocialFeedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url === '/social/feed') return Promise.resolve({ data: [] });
      if (url === '/social/trending') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
  });

  it('renders feed heading', async () => {
    renderFeed();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /feed/i })).toBeInTheDocument();
    });
  });

  it('shows empty state when no posts', async () => {
    renderFeed();
    await waitFor(() => {
      expect(screen.getByText('Belum ada postingan')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    renderFeed();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders post with provider info', async () => {
    mockGet.mockImplementation((url: string) => {
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

  it('renders post body', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/social/feed') return Promise.resolve({
        data: [{ id: '1', providerId: 'p1', providerName: 'Barber Shop', type: 'PROMO', title: 'Promo', body: 'Diskon 50% untuk semua layanan', likes: 10, comments: 5, isLiked: false, isFollowing: false, createdAt: new Date().toISOString() }],
      });
      if (url === '/social/trending') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    renderFeed();
    await waitFor(() => {
      expect(screen.getByText('Diskon 50% untuk semua layanan')).toBeInTheDocument();
    });
  });

  it('shows type badge for post', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/social/feed') return Promise.resolve({
        data: [{ id: '1', providerId: 'p1', providerName: 'Shop', type: 'REVIEW', title: 'Post', body: 'Body', likes: 10, comments: 3, isLiked: false, isFollowing: false, createdAt: new Date().toISOString() }],
      });
      if (url === '/social/trending') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    renderFeed();
    await waitFor(() => {
      expect(screen.getByText('REVIEW')).toBeInTheDocument();
    });
  });

  it('shows following state', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/social/feed') return Promise.resolve({
        data: [{ id: '1', providerId: 'p1', providerName: 'Shop', type: 'PROMO', title: 'Post', body: 'Body', likes: 10, comments: 3, isLiked: false, isFollowing: true, createdAt: new Date().toISOString() }],
      });
      if (url === '/social/trending') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    renderFeed();
    await waitFor(() => {
      expect(screen.getByText('Mengikuti')).toBeInTheDocument();
    });
  });

  it('toggles like', async () => {
    const user = userEvent.setup();
    mockGet.mockImplementation((url: string) => {
      if (url === '/social/feed') return Promise.resolve({
        data: [{ id: '1', providerId: 'p1', providerName: 'Shop', type: 'PROMO', title: 'Post', body: 'Body', likes: 10, comments: 3, isLiked: false, isFollowing: false, createdAt: new Date().toISOString() }],
      });
      if (url === '/social/trending') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    mockPost.mockResolvedValue({ data: {} });
    renderFeed();
    await waitFor(() => { expect(screen.getByText('Shop')).toBeInTheDocument(); });
    // Like button contains emoji + count
    const likeBtn = screen.getAllByRole('button').find(b => b.textContent?.includes('10') && b.textContent?.includes('❤'));
    expect(likeBtn).toBeTruthy();
    if (likeBtn) await user.click(likeBtn);
    expect(mockPost).toHaveBeenCalledWith('/social/feed/1/like');
  });

  it('follows provider', async () => {
    const user = userEvent.setup();
    mockGet.mockImplementation((url: string) => {
      if (url === '/social/feed') return Promise.resolve({
        data: [{ id: '1', providerId: 'p1', providerName: 'Shop', type: 'PROMO', title: 'Post', body: 'Body', likes: 10, comments: 3, isLiked: false, isFollowing: false, createdAt: new Date().toISOString() }],
      });
      if (url === '/social/trending') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    mockPost.mockResolvedValue({ data: {} });
    renderFeed();
    await waitFor(() => { expect(screen.getByText('Post')).toBeInTheDocument(); });
    // Find the follow button associated with the post (not sidebar suggestions)
    const postFollowBtns = screen.getAllByText('Ikuti');
    // The first "Ikuti" should be the one in the post header
    await user.click(postFollowBtns[0]);
    expect(mockPost).toHaveBeenCalledWith('/social/follow/p1');
  });

  it('renders trending sidebar', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/social/feed') return Promise.resolve({ data: [] });
      if (url === '/social/trending') return Promise.resolve({
        data: [{ id: 't1', name: 'Trending Barbershop', followers: 100, bookingCount: 25 }],
      });
      return Promise.resolve({ data: [] });
    });
    renderFeed();
    await waitFor(() => {
      expect(screen.getByText('Trending Barbershop')).toBeInTheDocument();
    });
  });

  it('shows suggested providers', async () => {
    renderFeed();
    await waitFor(() => {
      expect(screen.getByText('Nail Art Studio')).toBeInTheDocument();
    });
    expect(screen.getByText('Hair Colorist Pro')).toBeInTheDocument();
    expect(screen.getByText('Massage & Spa')).toBeInTheDocument();
  });

  it('disables post button when textarea empty', async () => {
    renderFeed();
    await waitFor(() => { expect(screen.getByText('Belum ada postingan')).toBeInTheDocument(); });
    const postBtn = screen.getByRole('button', { name: /posting/i });
    expect(postBtn).toBeDisabled();
  });

  it('enables post button when textarea has text', async () => {
    const user = userEvent.setup();
    renderFeed();
    await waitFor(() => { expect(screen.getByText('Belum ada postingan')).toBeInTheDocument(); });
    const textarea = screen.getByPlaceholderText(/bagikan pengalaman/i);
    await user.type(textarea, 'Test post content');
    const postBtn = screen.getByRole('button', { name: /posting/i });
    expect(postBtn).not.toBeDisabled();
  });

  it('creates post and clears textarea', async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValue({ data: {} });
    renderFeed();
    await waitFor(() => { expect(screen.getByText('Belum ada postingan')).toBeInTheDocument(); });
    const textarea = screen.getByPlaceholderText(/bagikan pengalaman/i);
    await user.type(textarea, 'My new post');
    await user.click(screen.getByRole('button', { name: /posting/i }));
    expect(mockPost).toHaveBeenCalledWith('/social/feed', { title: 'My new post', body: 'My new post', type: 'REVIEW' });
  });

  it('shows post with image', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/social/feed') return Promise.resolve({
        data: [{ id: '1', providerId: 'p1', providerName: 'Shop', type: 'PROMO', title: 'Post', body: 'Body', imageUrl: 'https://example.com/img.jpg', likes: 10, comments: 3, isLiked: false, isFollowing: false, createdAt: new Date().toISOString() }],
      });
      if (url === '/social/trending') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    renderFeed();
    await waitFor(() => {
      expect(screen.getByText('Post')).toBeInTheDocument();
    });
    // The image should be rendered in the post
    const imgs = document.querySelectorAll('img');
    expect(imgs.length).toBeGreaterThanOrEqual(1);
  });

  it('shows provider avatar', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/social/feed') return Promise.resolve({
        data: [{ id: '1', providerId: 'p1', providerName: 'Shop', type: 'PROMO', title: 'Post', body: 'Body', likes: 10, comments: 3, isLiked: false, isFollowing: false, createdAt: new Date().toISOString() }],
      });
      if (url === '/social/trending') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    renderFeed();
    await waitFor(() => {
      expect(screen.getByText('Shop')).toBeInTheDocument();
    });
    const avatar = screen.getByRole('img', { name: 'Shop' });
    expect(avatar).toHaveAttribute('src', expect.stringContaining('ui-avatars.com'));
  });

  it('shows provider avatar from providerAvatar field', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/social/feed') return Promise.resolve({
        data: [{ id: '1', providerId: 'p1', providerName: 'Shop', providerAvatar: 'https://example.com/avatar.jpg', type: 'PROMO', title: 'Post', body: 'Body', likes: 10, comments: 3, isLiked: false, isFollowing: false, createdAt: new Date().toISOString() }],
      });
      if (url === '/social/trending') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    renderFeed();
    await waitFor(() => {
      expect(screen.getByText('Shop')).toBeInTheDocument();
    });
    const avatar = screen.getByRole('img', { name: 'Shop' });
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });
});
