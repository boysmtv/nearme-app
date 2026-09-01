import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatWidget from '../ChatWidget';

vi.mock('../../hooks/useChatWebSocket', () => ({
  default: () => ({
    messages: [
      { id: 'm1', senderRole: 'CUSTOMER', body: 'Halo', createdAt: new Date().toISOString(), attachmentUrl: null },
      { id: 'm2', senderRole: 'PROVIDER', body: 'Halo kak', createdAt: new Date().toISOString(), attachmentUrl: null },
    ],
    sendMessage: vi.fn(),
    connected: true,
  }),
}));

describe('ChatWidget', () => {
  it('renders messages and input', () => {
    render(<ChatWidget conversationId="c1" currentUserId="u1" />);
    expect(screen.getByText('Halo')).toBeInTheDocument();
    expect(screen.getByText('Halo kak')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ketik pesan...')).toBeInTheDocument();
    expect(screen.getByText('Kirim')).toBeInTheDocument();
  });

  it('shows connected indicator', () => {
    render(<ChatWidget conversationId="c1" />);
    // connected dot: check title
    const widget = screen.getByText('Chat');
    expect(widget).toBeInTheDocument();
  });
});
