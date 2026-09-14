import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FaqPage from '../FaqPage';

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' }, logout: vi.fn() }),
}));

vi.mock('../../../lib/api', () => ({
  publicApi: {
    faqs: {
      listProvider: vi.fn(),
      createProvider: vi.fn(),
      updateProvider: vi.fn(),
      deleteProvider: vi.fn(),
    },
    policies: {
      listProvider: vi.fn(),
      createProvider: vi.fn(),
      updateProvider: vi.fn(),
      deleteProvider: vi.fn(),
    },
  },
}));

vi.mock('../../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="provider-layout">{children}</div>,
}));

import { publicApi } from '../../../lib/api';

const mockFaqList = publicApi.faqs.listProvider as ReturnType<typeof vi.fn>;
const mockPolicyList = publicApi.policies.listProvider as ReturnType<typeof vi.fn>;

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <FaqPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('FaqPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFaqList.mockResolvedValue({ data: [] });
    mockPolicyList.mockResolvedValue({ data: [] });
  });

  it('renders FAQ heading', async () => {
    renderPage();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  it('renders Kebijakan heading', async () => {
    renderPage();
    expect(screen.getByText('Kebijakan')).toBeInTheDocument();
  });

  it('renders ProviderLayout', async () => {
    renderPage();
    expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
  });

  it('shows empty state when no FAQs', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Belum ada FAQ')).toBeInTheDocument();
    });
  });

  it('shows empty state when no policies', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Belum ada kebijakan')).toBeInTheDocument();
    });
  });

  it('renders FAQ list when data is available', async () => {
    mockFaqList.mockResolvedValue({
      data: [{ id: 'f1', question: 'Bagaimana cara booking?', answer: 'Klik booking pada layanan yang diinginkan', category: 'booking', sortOrder: 1, isActive: true }],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Bagaimana cara booking?')).toBeInTheDocument();
    });
    expect(screen.getByText('Klik booking pada layanan yang diinginkan')).toBeInTheDocument();
  });
});
