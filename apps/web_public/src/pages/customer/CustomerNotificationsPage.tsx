import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicApi } from '../../lib/api';

export default function CustomerNotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['customer-notifications'],
    queryFn: () => publicApi.notifications.list(),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => publicApi.notifications.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer-notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => publicApi.notifications.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer-notifications'] }),
  });

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="text-sm text-primary-600 hover:underline font-medium disabled:opacity-50"
          >
            Tandai semua sudah dibaca
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">Belum ada notifikasi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <div
              key={n.id}
              onClick={() => !n.read && markRead.mutate(n.id)}
              className={`bg-white p-4 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors ring-1 ring-gray-100 ${
                !n.read ? 'border-l-4 border-primary-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{n.title || 'Notifikasi'}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{n.message || n.body}</p>
                </div>
                {!n.read && (
                  <span className="h-2 w-2 rounded-full bg-primary-500 mt-2 ml-2 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {n.createdAt ? new Date(n.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
