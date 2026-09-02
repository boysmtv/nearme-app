import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { ApiResponse } from '../../lib/types';

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get<ApiResponse<any[]>>('/notifications');
      setNotifications(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const markAsRead = async (id: string) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button onClick={markAllRead} className="text-[#6C63FF] hover:underline text-sm">Mark all read</button>
      </div>

      {loading ? <p>Loading...</p> : notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} onClick={() => !n.read && markAsRead(n.id)}
              className={`bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50 ${!n.read ? 'border-l-4 border-[#6C63FF]' : ''}`}>
              <p className="font-medium">{n.title || 'Notification'}</p>
              <p className="text-sm text-gray-600">{n.message || n.body}</p>
              <p className="text-xs text-gray-400 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
