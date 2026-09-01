import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { chatApi } from '../lib/api';
import useChatWebSocket from '../hooks/useChatWebSocket';
import Header from '../components/Header';

export default function ChatPage() {
  const { id: routeId } = useParams<{ id: string }>();
  const [selectedId, setSelectedId] = useState<string | null>(routeId ?? null);
  const qc = useQueryClient();

  const { data: convRes, isLoading: convLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => chatApi.list().then((r) => r as unknown as { data: import('../lib/types').Conversation[] }),
  });
  const conversations = (convRes as unknown as { data: import('../lib/types').Conversation[] })?.data ?? [];

  const { messages, sendMessage, connected } = useChatWebSocket(selectedId);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const createMut = useMutation({
    mutationFn: (data: { subject?: string; bookingId?: string }) => chatApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chats'] }),
  });

  const handleSend = async () => {
    if (!selectedId || (!input.trim() && !file)) return;
    await sendMessage(input, file ? { attachmentFile: file } : undefined);
    setInput('');
    setFile(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-4 p-4">
        <div className="w-80 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Pesan</h2>
            <button
              onClick={() => createMut.mutate({ subject: 'Pertanyaan umum' })}
              className="rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white hover:bg-primary-700"
            >
              + Baru
            </button>
          </div>
          <Link to="/provider/dashboard" className="mb-3 block text-xs text-primary-600 hover:underline">← Dashboard</Link>
          {convLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">Belum ada percakapan</p>
          ) : (
            <div className="space-y-2">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full rounded-lg border p-3 text-left transition ${selectedId === c.id ? 'border-primary-300 bg-primary-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                >
                  <p className="text-sm font-medium text-gray-900">{c.subject || `Chat ${c.id.slice(0, 8)}`}</p>
                  <p className="mt-1 text-xs text-gray-500">{c.lastMessage?.body ?? 'Belum ada pesan'}</p>
                  <p className="mt-1 text-[10px] text-gray-400">{new Date(c.updatedAt).toLocaleDateString('id-ID')} • {c.status}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          {!selectedId ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <p className="text-sm text-gray-500">Pilih percakapan atau buat baru</p>
              <button
                onClick={() => createMut.mutate({ subject: 'Halo, ada yang bisa dibantu?' })}
                className="mt-3 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Buat Percakapan
              </button>
              <p className="mt-4 text-xs text-gray-400">Realtime via WebSocket /ws-chat + SSE /chats/{'{id}'}/events + polling fallback</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900">Percakapan {selectedId.slice(0, 8)}</h3>
                <span className={`rounded-full px-2 py-1 text-xs ${connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{connected ? 'Live' : 'Polling'}</span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.senderRole === 'CUSTOMER' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${m.senderRole === 'CUSTOMER' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                      <p>{m.body}</p>
                      {m.attachmentUrl && (
                        <a href={m.attachmentUrl} target="_blank" rel="noreferrer" className="mt-1 block text-xs underline">
                          📎 Lampiran
                        </a>
                      )}
                      <p className="mt-1 text-[10px] opacity-70">{new Date(m.createdAt).toLocaleTimeString('id-ID')}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t p-3">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ketik pesan..."
                    className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  />
                  <label className="flex cursor-pointer items-center rounded-full border px-3 py-2 text-sm hover:bg-gray-50">
                    📎 <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                  </label>
                  <button onClick={handleSend} className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                    Kirim
                  </button>
                </div>
                {file && <p className="mt-2 text-xs text-gray-500">File: {file.name}</p>}
                <p className="mt-2 text-[11px] text-gray-400">Media upload reuse /media/upload (ownerType=provider) → attachment_url</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
