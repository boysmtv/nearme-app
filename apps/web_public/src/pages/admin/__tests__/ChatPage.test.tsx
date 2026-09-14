import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminChatPage from '../ChatPage';

vi.mock('../../../lib/api', () => ({
  chatApi: {
    list: vi.fn(),
    getMessages: vi.fn(),
    sendMessage: vi.fn(),
  },
}));

vi.mock('../../../hooks/useChatWebSocket', () => ({
  default: () => ({
    messages: [],
    sendMessage: vi.fn(),
    connected: false,
    loading: false,
    error: null,
  }),
}));

vi.mock('../../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Admin', role: 'ROLE_PLATFORM_ADMIN' } }),
}));

import { chatApi } from '../../../lib/api';

const mockList = chatApi.list as ReturnType<typeof vi.fn>;

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdminChatPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('AdminChatPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockList.mockResolvedValue({ data: [] });
  });

  it('renders heading', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /chat management/i })).toBeInTheDocument();
  });

  it('renders AdminLayout', async () => {
    renderPage();
    expect(screen.getByTestId('admin-layout')).toBeInTheDocument();
  });

  it('shows empty conversations state', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/tidak ada percakapan/i)).toBeInTheDocument();
    });
  });

  it('shows filter buttons', async () => {
    renderPage();
    expect(screen.getByRole('button', { name: /semua/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /terbuka/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tertutup/i })).toBeInTheDocument();
  });
});
