import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  default: (...args: unknown[]) => mockUseChatHook(...args),
}));

const { mockUseChatHook } = vi.hoisted(() => ({
  mockUseChatHook: vi.fn(() => ({
    messages: [],
    sendMessage: vi.fn(),
    connected: false,
    loading: false,
    error: null,
  })),
}));

vi.mock('../../components/Header', () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Siti', role: 'ROLE_CUSTOMER' } }),
}));

import { chatApi } from '../../lib/api';

const mockList = chatApi.list as ReturnType<typeof vi.fn>;
const mockCreate = chatApi.create as ReturnType<typeof vi.fn>;
const mockGetMessages = chatApi.getMessages as ReturnType<typeof vi.fn>;

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
}

function renderPage(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <ChatPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('ChatPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockList.mockResolvedValue({ data: [] });
    mockGetMessages.mockResolvedValue({ data: [] });
    mockUseChatHook.mockReturnValue({
      messages: [],
      sendMessage: vi.fn(),
      connected: false,
      loading: false,
      error: null,
    });
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

  it('shows Buat Percakapan button', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/pilih percakapan atau buat baru/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /buat percakapan/i })).toBeInTheDocument();
  });

  it('creates conversation via Buat Percakapan', async () => {
    const user = userEvent.setup();
    mockCreate.mockResolvedValue({ data: { id: 'c2', subject: 'Halo, ada yang bisa dibantu?' } });
    renderPage();
    await waitFor(() => { expect(screen.getByText(/pilih percakapan atau buat baru/i)).toBeInTheDocument(); });
    await user.click(screen.getByRole('button', { name: /buat percakapan/i }));
    expect(mockCreate).toHaveBeenCalledWith({ subject: 'Halo, ada yang bisa dibantu?', providerId: undefined, tenantId: undefined });
  });

  it('creates conversation via + Baru button', async () => {
    const user = userEvent.setup();
    mockCreate.mockResolvedValue({ data: { id: 'c2', subject: 'Pertanyaan umum' } });
    renderPage();
    await waitFor(() => { expect(screen.getByText(/belum ada percakapan/i)).toBeInTheDocument(); });
    await user.click(screen.getByRole('button', { name: /baru/i }));
    expect(mockCreate).toHaveBeenCalledWith({ subject: 'Pertanyaan umum', providerId: undefined, tenantId: undefined });
  });

  it('selects conversation and shows messages', async () => {
    const user = userEvent.setup();
    mockList.mockResolvedValue({
      data: [{ id: 'c1', subject: 'Test Chat', status: 'OPEN', updatedAt: '2026-09-14T10:00:00' }],
    });
    mockGetMessages.mockResolvedValue({
      data: [{ id: 'm1', body: 'Hello', senderId: 'c1', createdAt: '2026-09-14T10:00:00' }],
    });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Test Chat')).toBeInTheDocument(); });
    await user.click(screen.getByText('Test Chat'));
    await waitFor(() => {
      expect(screen.getByText(/percakapan/i)).toBeInTheDocument();
    });
  });

  it('shows message input after selecting conversation', async () => {
    const user = userEvent.setup();
    mockList.mockResolvedValue({
      data: [{ id: 'c1', subject: 'Test Chat', status: 'OPEN', updatedAt: '2026-09-14T10:00:00' }],
    });
    mockGetMessages.mockResolvedValue({ data: [] });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Test Chat')).toBeInTheDocument(); });
    await user.click(screen.getByText('Test Chat'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ketik pesan/i)).toBeInTheDocument();
    });
  });

  it('sends message', async () => {
    const user = userEvent.setup();
    mockList.mockResolvedValue({
      data: [{ id: 'c1', subject: 'Test Chat', status: 'OPEN', updatedAt: '2026-09-14T10:00:00' }],
    });
    mockGetMessages.mockResolvedValue({ data: [] });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Test Chat')).toBeInTheDocument(); });
    await user.click(screen.getByText('Test Chat'));
    await waitFor(() => { expect(screen.getByPlaceholderText(/ketik pesan/i)).toBeInTheDocument(); });
    const input = screen.getByPlaceholderText(/ketik pesan/i);
    await user.type(input, 'Hello');
    const sendBtn = screen.getByRole('button', { name: /kirim/i });
    await user.click(sendBtn);
  });

  it('shows conversation status', async () => {
    mockList.mockResolvedValue({
      data: [{ id: 'c1', subject: 'Closed Chat', status: 'CLOSED', updatedAt: '2026-09-14T10:00:00' }],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Closed Chat')).toBeInTheDocument();
    });
    expect(screen.getByText(/CLOSED/)).toBeInTheDocument();
  });

  it('shows conversation list with multiple items', async () => {
    mockList.mockResolvedValue({
      data: [
        { id: 'c1', subject: 'Chat 1', status: 'OPEN', updatedAt: '2026-09-14T10:00:00' },
        { id: 'c2', subject: 'Chat 2', status: 'RESOLVED', updatedAt: '2026-09-14T09:00:00' },
      ],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Chat 1')).toBeInTheDocument();
    });
    expect(screen.getByText('Chat 2')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockList.mockReturnValue(new Promise(() => {}));
    renderPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows dashboard link', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });

  it('shows file upload area', async () => {
    const user = userEvent.setup();
    mockList.mockResolvedValue({
      data: [{ id: 'c1', subject: 'Test Chat', status: 'OPEN', updatedAt: '2026-09-14T10:00:00' }],
    });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Test Chat')).toBeInTheDocument(); });
    await user.click(screen.getByText('Test Chat'));
    await waitFor(() => {
      expect(screen.getByText(/lampiran foto atau file/i)).toBeInTheDocument();
    });
  });

  it('renders provider messages left-aligned with attachment', async () => {
    const user = userEvent.setup();
    mockList.mockResolvedValue({
      data: [{ id: 'c1', subject: 'Test Chat', status: 'OPEN', updatedAt: '2026-09-14T10:00:00' }],
    });
    mockUseChatHook.mockReturnValue({
      messages: [
        { id: 'm1', body: 'Halo kak', senderId: 'staff1', senderRole: 'PROVIDER', createdAt: '2026-09-14T10:00:00', attachmentUrl: 'https://x.test/f.png' },
      ],
      sendMessage: vi.fn(),
      connected: true,
      loading: false,
      error: null,
    });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Test Chat')).toBeInTheDocument(); });
    await user.click(screen.getByText('Test Chat'));
    await waitFor(() => {
      expect(screen.getByText('Halo kak')).toBeInTheDocument();
    });
    expect(screen.getByText('📎 Lampiran')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('selecting file shows file name', async () => {
    const user = userEvent.setup();
    mockList.mockResolvedValue({
      data: [{ id: 'c1', subject: 'Test Chat', status: 'OPEN', updatedAt: '2026-09-14T10:00:00' }],
    });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Test Chat')).toBeInTheDocument(); });
    await user.click(screen.getByText('Test Chat'));
    await waitFor(() => { expect(screen.getByPlaceholderText(/ketik pesan/i)).toBeInTheDocument(); });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['isi'], 'nota.png', { type: 'image/png' });
    await user.upload(fileInput, file);
    expect(screen.getByText(/File: nota.png/)).toBeInTheDocument();
  });

  it('typing indicator hides after clearing input', async () => {
    const user = userEvent.setup();
    mockList.mockResolvedValue({
      data: [{ id: 'c1', subject: 'Test Chat', status: 'OPEN', updatedAt: '2026-09-14T10:00:00' }],
    });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Test Chat')).toBeInTheDocument(); });
    await user.click(screen.getByText('Test Chat'));
    const input = await screen.findByPlaceholderText(/ketik pesan/i);
    await user.type(input, 'halo');
    expect(screen.getByText('Mengetik...')).toBeInTheDocument();
    await user.clear(input);
    await waitFor(() => {
      expect(screen.queryByText('Mengetik...')).not.toBeInTheDocument();
    });
  });
});
