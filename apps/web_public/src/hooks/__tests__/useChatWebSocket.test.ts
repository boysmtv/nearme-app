import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useChatWebSocket } from '../../hooks/useChatWebSocket';

const { mockGetMessages, mockSendMessage, mockUpload } = vi.hoisted(() => ({
  mockGetMessages: vi.fn(),
  mockSendMessage: vi.fn(),
  mockUpload: vi.fn(),
}));

vi.mock('../../lib/api', () => ({
  chatApi: {
    getMessages: (...args: any[]) => mockGetMessages(...args),
    sendMessage: (...args: any[]) => mockSendMessage(...args),
  },
  mediaApi: {
    upload: (...args: any[]) => mockUpload(...args),
  },
}));

vi.mock('@dekat/web-config', () => ({
  config: { apiUrl: 'http://localhost:8080/api/v1' },
}));

class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  onopen: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  readyState = 0;
  private listeners: Record<string, ((ev: MessageEvent) => void)[]> = {};
  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }
  addEventListener(type: string, fn: (ev: MessageEvent) => void) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }
  removeEventListener() {}
  close() {}
  simulateOpen() {
    this.readyState = 1;
    this.onopen?.(new Event('open'));
  }
  simulateMessage(data: string) {
    const ev = new MessageEvent('message', { data });
    this.onmessage?.(ev);
    this.listeners['message']?.forEach(fn => fn(ev));
  }
  simulateError() {
    this.onerror?.(new Event('error'));
  }
}

describe('useChatWebSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    MockEventSource.instances = [];
    (window as any).EventSource = MockEventSource;
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (window as any).EventSource;
  });

  it('returns empty messages when no conversationId', () => {
    const { result } = renderHook(() => useChatWebSocket(null));
    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('fetches messages on mount with conversationId', async () => {
    mockGetMessages.mockResolvedValue({
      data: [{ id: 'm1', body: 'Hello', senderId: 'u1', createdAt: new Date().toISOString() }],
    });
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(result.current.messages.length).toBe(1);
    });
    expect(mockGetMessages).toHaveBeenCalledWith('conv-1');
  });

  it('sets loading to true then false after fetch', async () => {
    mockGetMessages.mockResolvedValue({ data: [] });
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    expect(result.current.loading).toBe(true);
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles fetch error gracefully', async () => {
    mockGetMessages.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });
  });

  it('handles non-Error fetch failure', async () => {
    mockGetMessages.mockRejectedValue('string error');
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(result.current.error).toBe('string error');
    });
  });

  it('provides sendMessage function', async () => {
    mockGetMessages.mockResolvedValue({ data: [] });
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(typeof result.current.sendMessage).toBe('function');
    });
  });

  it('sendMessage sends text message and adds to list', async () => {
    mockGetMessages.mockResolvedValue({ data: [] });
    mockSendMessage.mockResolvedValue({
      data: { id: 'm2', body: 'Hi there', senderId: 'u1', messageType: 'TEXT' },
    });
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(result.current.messages).toEqual([]);
    });

    await act(async () => {
      await result.current.sendMessage('Hi there');
    });

    expect(mockSendMessage).toHaveBeenCalledWith('conv-1', {
      body: 'Hi there',
      messageType: 'TEXT',
      attachmentUrl: undefined,
    });
    expect(result.current.messages.length).toBe(1);
    expect(result.current.messages[0].body).toBe('Hi there');
  });

  it('sendMessage with attachment uploads file first', async () => {
    mockGetMessages.mockResolvedValue({ data: [] });
    mockUpload.mockResolvedValue({ data: { url: 'https://example.com/img.png' } });
    mockSendMessage.mockResolvedValue({
      data: { id: 'm3', body: 'Check this', senderId: 'u1', messageType: 'IMAGE' },
    });
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(typeof result.current.sendMessage).toBe('function');
    });

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    await act(async () => {
      await result.current.sendMessage('Check this', { attachmentFile: file });
    });

    expect(mockUpload).toHaveBeenCalledWith(file, 'provider', 'conv-1');
    expect(mockSendMessage).toHaveBeenCalledWith('conv-1', {
      body: 'Check this',
      messageType: 'IMAGE',
      attachmentUrl: 'https://example.com/img.png',
    });
  });

  it('sendMessage with upload failure still sends message without attachment', async () => {
    mockGetMessages.mockResolvedValue({ data: [] });
    mockUpload.mockRejectedValue(new Error('Upload failed'));
    mockSendMessage.mockResolvedValue({
      data: { id: 'm4', body: 'Test', senderId: 'u1', messageType: 'TEXT' },
    });
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(typeof result.current.sendMessage).toBe('function');
    });

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    await act(async () => {
      await result.current.sendMessage('Test', { attachmentFile: file });
    });

    expect(mockSendMessage).toHaveBeenCalledWith('conv-1', {
      body: 'Test',
      messageType: 'TEXT',
      attachmentUrl: undefined,
    });
  });

  it('sendMessage with empty body does nothing', async () => {
    mockGetMessages.mockResolvedValue({ data: [] });
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(typeof result.current.sendMessage).toBe('function');
    });

    await act(async () => {
      await result.current.sendMessage('');
    });

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('sendMessage with whitespace-only body does nothing', async () => {
    mockGetMessages.mockResolvedValue({ data: [] });
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(typeof result.current.sendMessage).toBe('function');
    });

    await act(async () => {
      await result.current.sendMessage('   ');
    });

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('sendMessage refetches messages when response has no id', async () => {
    mockGetMessages.mockResolvedValue({ data: [] });
    mockSendMessage.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(typeof result.current.sendMessage).toBe('function');
    });

    await act(async () => {
      await result.current.sendMessage('Test');
    });

    expect(mockGetMessages).toHaveBeenCalledTimes(2);
  });

  it('deduplicates messages by id', async () => {
    mockGetMessages.mockResolvedValue({
      data: [{ id: 'm1', body: 'Hello', senderId: 'u1' }],
    });
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(result.current.messages.length).toBe(1);
    });

    const es = MockEventSource.instances[0];
    act(() => {
      es.simulateMessage(JSON.stringify({ id: 'm1', body: 'Duplicate', body: 'Hello' }));
    });

    expect(result.current.messages.length).toBe(1);
  });

  it('adds new SSE message to list', async () => {
    mockGetMessages.mockResolvedValue({ data: [] });
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(result.current.messages).toEqual([]);
    });

    const es = MockEventSource.instances[0];
    act(() => {
      es.simulateOpen();
    });
    expect(result.current.connected).toBe(true);

    act(() => {
      es.simulateMessage(JSON.stringify({ id: 'sse-1', body: 'From SSE', senderId: 'u2' }));
    });

    expect(result.current.messages.length).toBe(1);
    expect(result.current.messages[0].body).toBe('From SSE');
  });

  it('SSE onerror sets connected to false', async () => {
    mockGetMessages.mockResolvedValue({ data: [] });
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const es = MockEventSource.instances[0];
    act(() => {
      es.simulateOpen();
    });
    expect(result.current.connected).toBe(true);

    act(() => {
      es.simulateError();
    });
    expect(result.current.connected).toBe(false);
  });

  it('SSE constructor failure sets connected to false', async () => {
    mockGetMessages.mockResolvedValue({ data: [] });
    (window as any).EventSource = class {
      constructor() {
        throw new Error('SSE not supported');
      }
    };
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.connected).toBe(false);
  });

  it('cleans up EventSource and polling on unmount', async () => {
    mockGetMessages.mockResolvedValue({ data: [] });
    const { unmount } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(MockEventSource.instances.length).toBe(1);
    });

    const closeSpy = vi.spyOn(MockEventSource.instances[0], 'close');
    unmount();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('refresh fetches messages again', async () => {
    mockGetMessages.mockResolvedValue({ data: [{ id: 'm1', body: 'First' }] });
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(result.current.messages.length).toBe(1);
    });

    mockGetMessages.mockResolvedValue({ data: [{ id: 'm1', body: 'First' }, { id: 'm2', body: 'Second' }] });
    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.messages.length).toBe(2);
  });

  it('handles messages response as flat array', async () => {
    mockGetMessages.mockResolvedValue([
      { id: 'm1', body: 'Flat array msg' },
    ]);
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(result.current.messages.length).toBe(1);
    });
  });

  it('handles messages response with non-array data gracefully', async () => {
    mockGetMessages.mockResolvedValue({ data: 'not-an-array' });
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.messages).toEqual([]);
  });

  it('does not create EventSource when conversationId is null', () => {
    MockEventSource.instances = [];
    renderHook(() => useChatWebSocket(null));
    expect(MockEventSource.instances.length).toBe(0);
  });

  it('fetches messages via polling interval', async () => {
    mockGetMessages.mockResolvedValue({ data: [] });
    renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(mockGetMessages).toHaveBeenCalledTimes(1);
    });

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    await waitFor(() => {
      expect(mockGetMessages).toHaveBeenCalledTimes(2);
    });
  });

  it('handles upload response with direct url property', async () => {
    mockGetMessages.mockResolvedValue({ data: [] });
    mockUpload.mockResolvedValue({ url: 'https://example.com/direct.png' });
    mockSendMessage.mockResolvedValue({
      data: { id: 'm5', body: 'With file', senderId: 'u1', messageType: 'IMAGE' },
    });
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(typeof result.current.sendMessage).toBe('function');
    });

    const file = new File(['data'], 'file.png', { type: 'image/png' });
    await act(async () => {
      await result.current.sendMessage('With file', { attachmentFile: file });
    });

    expect(mockSendMessage).toHaveBeenCalledWith('conv-1', {
      body: 'With file',
      messageType: 'IMAGE',
      attachmentUrl: 'https://example.com/direct.png',
    });
  });

  it('does not set duplicate SSE messages with same id', async () => {
    mockGetMessages.mockResolvedValue({ data: [{ id: 'existing', body: 'Already here' }] });
    const { result } = renderHook(() => useChatWebSocket('conv-1'));
    await waitFor(() => {
      expect(result.current.messages.length).toBe(1);
    });

    const es = MockEventSource.instances[0];
    act(() => {
      es.simulateMessage(JSON.stringify({ id: 'existing', body: 'Duplicate' }));
    });

    expect(result.current.messages.length).toBe(1);
  });
});
