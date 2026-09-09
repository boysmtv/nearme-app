import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/AdminLayout';
import { chatApi } from '../../lib/api';
import useChatWebSocket from '../../hooks/useChatWebSocket';
import type { Conversation } from '../../lib/types';

export default function AdminChatPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: convRes, isLoading: convLoading } = useQuery({
    queryKey: ['admin', 'chats'],
    queryFn: () => chatApi.list().then((r) => r as unknown as { data: Conversation[] }),
  });
  const conversations = (convRes as unknown as { data: Conversation[] })?.data ?? [];

  const { messages, sendMessage, connected } = useChatWebSocket(selectedId);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  const filtered = conversations.filter((c) => {
    if (filter === 'open') return c.status === 'OPEN';
    if (filter === 'closed') return c.status === 'CLOSED' || c.status === 'ARCHIVED';
    return true;
  });

  const handleSend = async () => {
    if (!selectedId || !input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat Management</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola percakapan antara customer dan provider</p>
        </div>

        <div className="flex gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <div className="flex gap-2">
            {(['all', 'open', 'closed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Semua' : f === 'open' ? 'Terbuka' : 'Tertutup'}
              </button>
            ))}
          </div>
          <span className="ml-auto text-sm text-gray-500">{filtered.length} percakapan</span>
        </div>

        <div className="flex gap-4" style={{ height: 'calc(100vh - 280px)' }}>
          {/* Conversation List */}
          <div className="w-80 flex-shrink-0 overflow-y-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
            {convLoading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-400">Tidak ada percakapan</p>
            ) : (
              <div className="space-y-1 p-2">
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      selectedId === c.id
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {c.subject || `Chat ${c.id.slice(0, 8)}`}
                      </p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        c.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 truncate">{c.lastMessage?.body ?? 'Belum ada pesan'}</p>
                    <p className="mt-1 text-[10px] text-gray-400">
                      {new Date(c.updatedAt).toLocaleDateString('id-ID')} · {c.customerId?.slice(0, 8)} → {c.providerId?.slice(0, 8)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message Area */}
          <div className="flex flex-1 flex-col rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
            {!selectedId ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <svg className="h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="mt-4 text-gray-500">Pilih percakapan untuk melihat pesan</p>
                <p className="mt-1 text-sm text-gray-400">Admin dapat memantau semua percakapan</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Percakapan {selectedId.slice(0, 8)}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Customer → Provider · Admin view
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {connected ? 'Live' : 'Polling'}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-400">Belum ada pesan</p>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className={`flex ${m.senderRole === 'ADMIN' ? 'justify-end' : m.senderRole === 'CUSTOMER' ? 'justify-start' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                          m.senderRole === 'ADMIN'
                            ? 'bg-blue-600 text-white'
                            : m.senderRole === 'CUSTOMER'
                            ? 'bg-primary-100 text-primary-900'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-[10px] font-medium opacity-70 mb-1">{m.senderRole}</p>
                          <p className="text-sm">{m.body}</p>
                          {m.attachmentUrl && (
                            <a href={m.attachmentUrl} target="_blank" rel="noreferrer" className="mt-1 block text-xs underline">
                              Lampiran
                            </a>
                          )}
                          <p className="mt-1 text-[10px] opacity-60">{new Date(m.createdAt).toLocaleTimeString('id-ID')}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t p-3">
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ketik sebagai Admin..."
                      className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      Kirim
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-gray-400">Pesan dikirim sebagai admin (warna biru)</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
