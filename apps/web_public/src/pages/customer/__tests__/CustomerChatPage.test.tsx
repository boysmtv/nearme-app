import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatPage from '../../ChatPage';

vi.mock('../../../lib/api', () => ({
  chatApi: {
    list: vi.fn(),
    getMessages: vi.fn(),
    sendMessage: vi.fn(),
    create: vi.fn(),
  },
  mediaApi: {
    upload: vi.fn(),
  },
}));

vi.mock('../../../hooks/useChatWebSocket', () => ({
  default: (id: string | null) => ({
    messages: [],
    connected: false,
    loading: false,
    error: null,
    sendMessage: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('../../../components/Header', () => ({
  default: () => <header data-testid="header">Header</header>,
}));

import { chatApi } from '../../../lib/api';

function renderChat() {
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
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders chat page', async () => {
    (chatApi.list as any).mockResolvedValue({ data: [] });
    renderChat();
    await waitFor(() => {
      expect(screen.getByText('Pesan')).toBeInTheDocument();
    });
  });

  it('renders header component', async () => {
    (chatApi.list as any).mockResolvedValue({ data: [] });
    renderChat();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('shows empty state when no conversations', async () => {
    (chatApi.list as any).mockResolvedValue({ data: [] });
    renderChat();
    await waitFor(() => {
      expect(screen.getByText(/belum ada percakapan/i)).toBeInTheDocument();
    });
  });

  it('shows conversation list when data is available', async () => {
    (chatApi.list as any).mockResolvedValue({
      data: [{ id: 'c1', subject: 'Booking Question', lastMessage: 'Thanks!', updatedAt: new Date().toISOString() }],
    });
    renderChat();
    await waitFor(() => {
      expect(screen.getByText('Booking Question')).toBeInTheDocument();
    });
  });
});
