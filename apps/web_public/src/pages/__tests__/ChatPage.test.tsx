import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatPage from '../ChatPage';

vi.mock('../../lib/api', () => ({
  chatApi: {
    list: vi.fn(),
    create: vi.fn(),
    getMessages: vi.fn(),
    sendMessage: vi.fn(),
  },
}));

vi.mock('../../hooks/useChatWebSocket', () => ({
  default: () => ({
    messages: [],
    sendMessage: vi.fn(),
    connected: false,
    loading: false,
    error: null,
  }),
}));

vi.mock('../../components/Header', () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Siti', role: 'ROLE_CUSTOMER' } }),
}));

import { chatApi } from '../../lib/api';

const mockList = chatApi.list as ReturnType<typeof vi.fn>;

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <ChatPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('ChatPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockList.mockResolvedValue({ data: [] });
  });

  it('renders chat page with header', async () => {
    renderPage();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('shows empty conversations state', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/belum ada percakapan/i)).toBeInTheDocument();
    });
  });

  it('renders conversations list when data exists', async () => {
    mockList.mockResolvedValue({
      data: [{ id: 'c1', subject: 'Test Chat', status: 'OPEN', updatedAt: '2026-09-14T10:00:00', lastMessage: { body: 'Hello' } }],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Test Chat')).toBeInTheDocument();
    });
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('shows no conversation selected state', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/pilih percakapan atau buat baru/i)).toBeInTheDocument();
    });
  });
});
