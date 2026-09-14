import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatWidget from '../ChatWidget';

const mockSendMessage = vi.fn().mockResolvedValue(undefined);

vi.mock('../../hooks/useChatWebSocket', () => ({
  default: (id: string | null) => ({
    messages: id === 'c1'
      ? [
          { id: 'm1', senderId: 'u1', senderRole: 'CUSTOMER', body: 'Halo', createdAt: '2026-09-14T10:00:00Z', attachmentUrl: null },
          { id: 'm2', senderId: 'u2', senderRole: 'PROVIDER', body: 'Halo kak', createdAt: '2026-09-14T10:01:00Z', attachmentUrl: 'http://example.com/file.pdf' },
        ]
      : [],
    sendMessage: mockSendMessage,
    connected: !!id,
  }),
}));

describe('ChatWidget', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders messages and input', () => {
    render(<ChatWidget conversationId="c1" currentUserId="u1" />);
    expect(screen.getByText('Halo')).toBeInTheDocument();
    expect(screen.getByText('Halo kak')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ketik pesan...')).toBeInTheDocument();
    expect(screen.getByText('Kirim')).toBeInTheDocument();
  });

  it('shows connected indicator', () => {
    render(<ChatWidget conversationId="c1" />);
    expect(screen.getByText('Chat')).toBeInTheDocument();
  });

  it('shows empty state when no messages', () => {
    render(<ChatWidget conversationId="empty" />);
    expect(screen.getByText(/belum ada pesan/i)).toBeInTheDocument();
  });

  it('shows custom title', () => {
    render(<ChatWidget conversationId="c1" title="Customer Chat" />);
    expect(screen.getByText('Customer Chat')).toBeInTheDocument();
  });

  it('attachment link is rendered', () => {
    render(<ChatWidget conversationId="c1" currentUserId="u1" />);
    const link = screen.getByText('Lampiran');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'http://example.com/file.pdf');
  });

  it('sends message on button click', async () => {
    render(<ChatWidget conversationId="c1" currentUserId="u1" />);
    fireEvent.change(screen.getByPlaceholderText('Ketik pesan...'), { target: { value: 'Test message' } });
    fireEvent.click(screen.getByText('Kirim'));
    await waitFor(() => { expect(mockSendMessage).toHaveBeenCalledWith('Test message', undefined); });
  });

  it('sends message on Enter key', async () => {
    render(<ChatWidget conversationId="c1" currentUserId="u1" />);
    const input = screen.getByPlaceholderText('Ketik pesan...');
    fireEvent.change(input, { target: { value: 'Enter message' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => { expect(mockSendMessage).toHaveBeenCalledWith('Enter message', undefined); });
  });

  it('does not send empty message', async () => {
    render(<ChatWidget conversationId="c1" currentUserId="u1" />);
    fireEvent.click(screen.getByText('Kirim'));
    await waitFor(() => { expect(mockSendMessage).not.toHaveBeenCalled(); });
  });

  it('shows sending state', async () => {
    mockSendMessage.mockReturnValue(new Promise(() => {})); // never resolves
    render(<ChatWidget conversationId="c1" currentUserId="u1" />);
    fireEvent.change(screen.getByPlaceholderText('Ketik pesan...'), { target: { value: 'Slow msg' } });
    fireEvent.click(screen.getByText('Kirim'));
    await waitFor(() => { expect(screen.getByText('...')).toBeInTheDocument(); });
  });

  it('file input triggers file selection', () => {
    render(<ChatWidget conversationId="c1" currentUserId="u1" />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(screen.getByText(/lampiran: test\.pdf/i)).toBeInTheDocument();
  });

  it('styles messages based on sender role', () => {
    render(<ChatWidget conversationId="c1" currentUserId="u1" />);
    const customerMsg = screen.getByText('Halo').closest('div')?.parentElement;
    const providerMsg = screen.getByText('Halo kak').closest('div')?.parentElement;
    expect(customerMsg?.className).toContain('justify-end');
    expect(providerMsg?.className).toContain('justify-start');
  });
});
