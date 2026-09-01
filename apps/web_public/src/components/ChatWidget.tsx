import { useState } from 'react';
import useChatWebSocket from '../hooks/useChatWebSocket';

interface ChatWidgetProps {
  conversationId: string;
  currentUserId?: string;
  title?: string;
}

export default function ChatWidget({ conversationId, currentUserId, title = 'Chat' }: ChatWidgetProps) {
  const { messages, sendMessage, connected } = useChatWebSocket(conversationId);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!input.trim() && !file) return;
    setSending(true);
    try {
      await sendMessage(input, file ? { attachmentFile: file } : undefined);
      setInput('');
      setFile(null);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[420px] w-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} title={connected ? 'Connected' : 'Polling'} />
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">Belum ada pesan — mulai percakapan</p>
        ) : (
          messages.map((m) => {
            const isMe = currentUserId ? m.senderId === currentUserId : m.senderRole === 'CUSTOMER';
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${isMe ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  <p>{m.body}</p>
                  {m.attachmentUrl && (
                    <a href={m.attachmentUrl} target="_blank" rel="noreferrer" className="mt-1 block text-xs underline">
                      Lampiran
                    </a>
                  )}
                  <p className={`mt-1 text-[10px] ${isMe ? 'text-primary-100' : 'text-gray-500'}`}>{new Date(m.createdAt).toLocaleString('id-ID')}</p>
                </div>
              </div>
            );
          })
        )}
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
          <label className="flex cursor-pointer items-center rounded-full border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
            📎
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} accept="image/*,application/pdf" />
          </label>
          <button
            onClick={handleSend}
            disabled={sending || (!input.trim() && !file)}
            className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {sending ? '...' : 'Kirim'}
          </button>
        </div>
        {file && <p className="mt-2 text-xs text-gray-500">Lampiran: {file.name}</p>}
      </div>
    </div>
  );
}
