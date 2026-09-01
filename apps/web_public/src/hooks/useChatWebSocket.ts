import { useEffect, useRef, useState, useCallback } from 'react';
import { chatApi, mediaApi } from '../lib/api';
import type { ChatMessage } from '../lib/types';
import { config } from '@dekat/web-config';

export function useChatWebSocket(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const pollRef = useRef<number | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await chatApi.getMessages(conversationId);
      const data = (res as unknown as { data: ChatMessage[] })?.data ?? (res as unknown as ChatMessage[]);
      if (Array.isArray(data)) {
        setMessages(data as ChatMessage[]);
      } else if (Array.isArray((res as unknown as { data: ChatMessage[] }).data)) {
        setMessages((res as unknown as { data: ChatMessage[] }).data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    fetchMessages().finally(() => setLoading(false));

    // polling fallback every 3s
    pollRef.current = window.setInterval(fetchMessages, 3000);

    // SSE via fetch streaming with Authorization (EventSource can't send headers)
    // Try EventSource with token query param if ws allowed
    let stopped = false;
    const trySSE = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const base = (config as unknown as { apiUrl?: string })?.apiUrl || 'http://localhost:8080/api/v1';
        const url = `${base}/chats/${conversationId}/events${token ? `?token=${encodeURIComponent(token)}` : ''}`;
        const es = new EventSource(url);
        esRef.current = es;
        es.onopen = () => { if (!stopped) setConnected(true); };
        es.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data);
            if (data.body) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === data.id)) return prev;
                return [...prev, data as ChatMessage];
              });
            }
          } catch {}
        };
        es.addEventListener('message', (ev: MessageEvent) => {
          try {
            const data = JSON.parse((ev as MessageEvent).data);
            setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data as ChatMessage]));
          } catch {}
        });
        es.onerror = () => {
          setConnected(false);
        };
      } catch {
        setConnected(false);
      }
    };
    trySSE();

    return () => {
      stopped = true;
      if (pollRef.current) window.clearInterval(pollRef.current);
      if (esRef.current) { esRef.current.close(); esRef.current = null; }
      setConnected(false);
    };
  }, [conversationId, fetchMessages]);

  const sendMessage = useCallback(async (body: string, opts?: { attachmentFile?: File }) => {
    if (!conversationId || !body.trim()) return;
    let attachmentUrl: string | undefined;
    if (opts?.attachmentFile) {
      try {
        const uploadRes = await mediaApi.upload(opts.attachmentFile, 'provider', conversationId) as unknown as { data: { url: string } };
        attachmentUrl = (uploadRes as unknown as { data: { url: string } })?.data?.url ?? (uploadRes as unknown as { url: string })?.url;
      } catch (e) {
        // fallback: still send message without attachment
      }
    }
    const res = await chatApi.sendMessage(conversationId, { body, messageType: attachmentUrl ? 'IMAGE' : 'TEXT', attachmentUrl });
    const msg = (res as unknown as { data: ChatMessage })?.data ?? (res as unknown as ChatMessage);
    if (msg && (msg as ChatMessage).id) {
      setMessages((prev) => [...prev, msg as ChatMessage]);
    } else {
      await fetchMessages();
    }
    return msg;
  }, [conversationId, fetchMessages]);

  return { messages, connected, loading, error, sendMessage, refresh: fetchMessages };
}

export default useChatWebSocket;
