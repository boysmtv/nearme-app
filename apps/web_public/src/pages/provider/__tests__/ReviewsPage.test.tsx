import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReviewsPage from '../ReviewsPage';

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

vi.mock('../../../lib/api', () => ({
  providerApi: {
    reviews: { list: vi.fn(), respond: vi.fn() },
  },
}));

vi.mock('../../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="provider-layout">{children}</div>,
}));

import { providerApi } from '../../../lib/api';

const mockReviewsList = providerApi.reviews.list as ReturnType<typeof vi.fn>;
const mockReviewsRespond = providerApi.reviews.respond as ReturnType<typeof vi.fn>;

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
}

function renderPage(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <ReviewsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const reviews = [
  {
    id: 'r1',
    customerName: 'Siti',
    rating: 5,
    title: 'Great service!',
    body: 'Really enjoyed the haircut',
    createdAt: '2026-09-10T10:00:00',
    verifiedBooking: true,
    response: null,
  },
  {
    id: 'r2',
    customerName: 'Rina',
    rating: 4,
    title: 'Good experience',
    body: 'Very professional staff',
    createdAt: '2026-09-08T14:00:00',
    verifiedBooking: false,
    response: 'Thank you for your feedback!',
  },
  {
    id: 'r3',
    customerName: 'Dian',
    rating: 3,
    title: null,
    body: 'Average experience',
    createdAt: '2026-09-05T09:00:00',
    verifiedBooking: true,
    response: null,
  },
];

describe('ReviewsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReviewsList.mockResolvedValue({ data: { data: reviews } });
  });

  it('renders heading and ProviderLayout', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /ulasan/i })).toBeInTheDocument();
    expect(screen.getByText(/kelola ulasan pelanggan dan respons/i)).toBeInTheDocument();
    expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    mockReviewsList.mockReturnValue(new Promise(() => {}));
    renderPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders review cards with customer names', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Siti')).toBeInTheDocument();
    });
    expect(screen.getByText('Rina')).toBeInTheDocument();
    expect(screen.getByText('Dian')).toBeInTheDocument();
  });

  it('displays review titles and bodies', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Great service!')).toBeInTheDocument();
    });
    expect(screen.getByText('Really enjoyed the haircut')).toBeInTheDocument();
    expect(screen.getByText('Good experience')).toBeInTheDocument();
    expect(screen.getByText('Very professional staff')).toBeInTheDocument();
    expect(screen.getByText('Average experience')).toBeInTheDocument();
  });

  it('displays star ratings', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Siti')).toBeInTheDocument();
    });
    const starElements = screen.getAllByText(/★/);
    expect(starElements.length).toBeGreaterThanOrEqual(3);
  });

  it('displays verified booking badge', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Siti')).toBeInTheDocument();
    });
    const verifiedBadges = screen.getAllByText('Terverifikasi');
    expect(verifiedBadges.length).toBe(2);
  });

  it('displays formatted dates', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Siti')).toBeInTheDocument();
    });
    expect(screen.getByText(/10 September 2026/)).toBeInTheDocument();
    expect(screen.getByText(/8 September 2026/)).toBeInTheDocument();
  });

  it('displays provider response for review with response', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Rina')).toBeInTheDocument();
    });
    expect(screen.getByText('Respons Provider:')).toBeInTheDocument();
    expect(screen.getByText('Thank you for your feedback!')).toBeInTheDocument();
  });

  it('shows Balas ulasan button for reviews without response', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Siti')).toBeInTheDocument();
    });
    const replyButtons = screen.getAllByText('Balas ulasan');
    expect(replyButtons.length).toBe(2);
  });

  it('opens response form when clicking Balas ulasan', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Siti')).toBeInTheDocument();
    });
    const replyButtons = screen.getAllByText('Balas ulasan');
    await user.click(replyButtons[0]);
    expect(screen.getByPlaceholderText(/tulis respons/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kirim respons/i })).toBeInTheDocument();
  });

  it('submits response form', async () => {
    const user = userEvent.setup();
    mockReviewsRespond.mockResolvedValue({ data: {} });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Siti')).toBeInTheDocument();
    });
    const replyButtons = screen.getAllByText('Balas ulasan');
    await user.click(replyButtons[0]);
    await user.type(screen.getByPlaceholderText(/tulis respons/i), 'Terima kasih atas ulasannya!');
    await user.click(screen.getByRole('button', { name: /kirim respons/i }));
    await waitFor(() => {
      expect(mockReviewsRespond).toHaveBeenCalledWith('r1', 'Terima kasih atas ulasannya!');
    });
  });

  it('cancels response form when clicking Batal', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Siti')).toBeInTheDocument();
    });
    const replyButtons = screen.getAllByText('Balas ulasan');
    await user.click(replyButtons[0]);
    expect(screen.getByPlaceholderText(/tulis respons/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /batal/i }));
    expect(screen.queryByPlaceholderText(/tulis respons/i)).not.toBeInTheDocument();
  });

  it('disables send button when response text is empty', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Siti')).toBeInTheDocument();
    });
    const replyButtons = screen.getAllByText('Balas ulasan');
    await user.click(replyButtons[0]);
    const sendButton = screen.getByRole('button', { name: /kirim respons/i });
    expect(sendButton).toBeDisabled();
  });

  it('shows empty state when no reviews', async () => {
    mockReviewsList.mockResolvedValue({ data: { data: [] } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Belum ada ulasan')).toBeInTheDocument();
    });
  });
});
