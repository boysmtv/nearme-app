import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

const mockSendMessage = vi.fn().mockResolvedValue(undefined);
vi.mock('../../../hooks/useChatWebSocket', () => ({
  default: (id: string | null) => ({
    messages: id === 'conv-1'
      ? [{ id: 'm1', body: 'Halo admin', senderRole: 'CUSTOMER', createdAt: '2026-09-14T10:00:00Z', conversationId: 'conv-1' }]
      : [],
    sendMessage: mockSendMessage,
    connected: !!id,
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

  it('renders conversation list with data', async () => {
    mockList.mockResolvedValue({
      data: [
        { id: 'conv-1', subject: 'Booking bermasalah', status: 'OPEN', updatedAt: '2026-09-14T10:00:00Z', customerId: 'cust-12345678', providerId: 'prov-12345678', lastMessage: { body: 'Help' } },
        { id: 'conv-2', subject: 'Refund request', status: 'CLOSED', updatedAt: '2026-09-13T08:00:00Z', customerId: 'cust-abcdef12', providerId: 'prov-abcdef12', lastMessage: null },
      ],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Booking bermasalah')).toBeInTheDocument();
      expect(screen.getByText('Refund request')).toBeInTheDocument();
    });
  });

  it('clicking a conversation selects it and shows messages', async () => {
    mockList.mockResolvedValue({
      data: [
        { id: 'conv-1', subject: 'Booking bermasalah', status: 'OPEN', updatedAt: '2026-09-14T10:00:00Z', customerId: 'cust-12345678', providerId: 'prov-12345678', lastMessage: { body: 'Help' } },
      ],
    });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Booking bermasalah')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Booking bermasalah'));
    await waitFor(() => {
      expect(screen.getByText('Halo admin')).toBeInTheDocument();
      expect(screen.getByText('Live')).toBeInTheDocument();
    });
  });

  it('filter buttons filter conversations', async () => {
    mockList.mockResolvedValue({
      data: [
        { id: 'conv-1', subject: 'Open chat', status: 'OPEN', updatedAt: '2026-09-14T10:00:00Z', customerId: 'c1', providerId: 'p1', lastMessage: null },
        { id: 'conv-2', subject: 'Closed chat', status: 'CLOSED', updatedAt: '2026-09-13T10:00:00Z', customerId: 'c2', providerId: 'p2', lastMessage: null },
      ],
    });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Open chat')).toBeInTheDocument(); });
    fireEvent.click(screen.getByRole('button', { name: /terbuka/i }));
    await waitFor(() => {
      expect(screen.getByText('Open chat')).toBeInTheDocument();
      expect(screen.queryByText('Closed chat')).not.toBeInTheDocument();
    });
  });

  it('send message calls chatApi.sendMessage', async () => {
    mockList.mockResolvedValue({
      data: [
        { id: 'conv-1', subject: 'Test', status: 'OPEN', updatedAt: '2026-09-14T10:00:00Z', customerId: 'c1', providerId: 'p1', lastMessage: null },
      ],
    });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Test')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Test'));
    await waitFor(() => { expect(screen.queryByText(/pilih percakapan/i)).not.toBeInTheDocument(); });
    const input = screen.getByPlaceholderText(/ketik sebagai admin/i);
    fireEvent.change(input, { target: { value: 'Halo dari admin' } });
    fireEvent.click(screen.getByRole('button', { name: /kirim/i }));
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Halo dari admin');
    });
  });

  it('shows loading skeleton when fetching conversations', async () => {
    mockList.mockReturnValue(new Promise(() => {})); // never resolves
    renderPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows placeholder when no conversation selected', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/pilih percakapan untuk melihat pesan/i)).toBeInTheDocument();
    });
  });
});
