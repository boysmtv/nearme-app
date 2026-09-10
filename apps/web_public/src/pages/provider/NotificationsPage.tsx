import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providerApi } from '../../lib/api';
import ProviderLayout from '../../components/ProviderLayout';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: res, isLoading } = useQuery({
    queryKey: ['provider-notifications'],
    queryFn: () => providerApi.notifications.list(),
  });

  const notifications = (res as any)?.data?.data ?? [];

  const markRead = useMutation({
    mutationFn: (id: string) => providerApi.notifications.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['provider-notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => providerApi.notifications.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['provider-notifications'] }),
  });

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
            <p className="mt-1 text-sm text-gray-500">Pemberitahuan terbaru tentang bisnis Anda</p>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Tandai semua dibaca
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-white p-4 shadow-sm">
                <div className="h-4 w-1/4 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
            <p className="text-gray-500">Tidak ada notifikasi</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n: any) => (
              <div
                key={n.id}
                onClick={() => !n.read && markRead.mutate(n.id)}
                className={`cursor-pointer rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-colors hover:bg-gray-50 ${
                  !n.read ? 'border-l-4 border-primary-500' : ''
                }`}
              >
                <p className="font-medium text-gray-900">{n.title || 'Notifikasi'}</p>
                <p className="mt-1 text-sm text-gray-600">{n.message || n.body}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}
