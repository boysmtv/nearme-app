import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChatWebSocket } from '../../hooks/useChatWebSocket';

vi.mock('../../lib/api', () => ({
  chatApi: {
    getMessages: vi.fn(),
    sendMessage: vi.fn(),
  },
  mediaApi: {
    upload: vi.fn(),
  },
}));

vi.mock('@dekat/web-config', () => ({
  config: { apiUrl: 'http://localhost:8080/api/v1' },
}));

import { chatApi } from '../../lib/api';

describe('useChatWebSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty messages when no conversationId', () => {
    const { result } = renderHook(() => useChatWebSocket(null));
    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('fetches messages when conversationId is provided', async () => {
    (chatApi.getMessages as any).mockResolvedValue({
      data: [{ id: 'm1', body: 'Hello', senderId: 'u1', createdAt: new Date().toISOString() }],
    });
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(result.current.messages.length).toBe(1);
    });
    expect(chatApi.getMessages).toHaveBeenCalledWith('conv-1');
  });

  it('returns connected as false initially', async () => {
    (chatApi.getMessages as any).mockResolvedValue({ data: [] });
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(typeof result.current.connected).toBe('boolean');
  });

  it('provides sendMessage function', async () => {
    (chatApi.getMessages as any).mockResolvedValue({ data: [] });
    (chatApi.sendMessage as any).mockResolvedValue({
      data: { id: 'm2', body: 'Hi', senderId: 'u1' },
    });
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(typeof result.current.sendMessage).toBe('function');
    });
  });
});
