import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicApi } from '../../lib/api';
import CustomerLayout from '../../components/CustomerLayout';

type FilterTab = 'ALL' | 'UNREAD' | 'BOOKING' | 'PAYMENT' | 'PROMO';

interface Notification {
  id: string;
  title?: string;
  message?: string;
  body?: string;
  type?: string;
  read?: boolean;
  createdAt?: string;
}

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'ALL', label: 'Semua' },
  { value: 'UNREAD', label: 'Belum Dibaca' },
  { value: 'BOOKING', label: 'Booking' },
  { value: 'PAYMENT', label: 'Pembayaran' },
  { value: 'PROMO', label: 'Promo' },
];

const TYPE_CONFIG: Record<string, { color: string; bgColor: string; borderColor: string; iconPath: string }> = {
  BOOKING: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-l-blue-500',
    iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  PAYMENT: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-l-green-500',
    iconPath: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  },
  PROMO: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-l-purple-500',
    iconPath: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  },
  REVIEW: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-l-amber-500',
    iconPath: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  },
  DEFAULT: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-l-gray-400',
    iconPath: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  },
};

type TypeConfig = { color: string; bgColor: string; borderColor: string; iconPath: string };

function getTypeConfig(type?: string): TypeConfig {
  const t = type || '';
  if (t in TYPE_CONFIG) return TYPE_CONFIG[t]!;
  return TYPE_CONFIG.DEFAULT!;
}

function getDateGroup(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1 && now.getDate() === date.getDate()) return 'Hari Ini';
  if (diffDays < 2 || (diffDays < 3 && now.getDate() - date.getDate() === 1)) return 'Kemarin';
  if (diffDays < 7) return 'Minggu Lalu';
  return 'Lebih Lama';
}

function matchesType(n: Notification, tab: FilterTab): boolean {
  if (tab === 'ALL') return true;
  if (tab === 'UNREAD') return !n.read;
  if (tab === 'BOOKING') return n.type === 'BOOKING' || n.type === 'BOOKING_CONFIRMED' || n.type === 'BOOKING_CANCELLED';
  if (tab === 'PAYMENT') return n.type === 'PAYMENT' || n.type === 'PAYMENT_RECEIVED' || n.type === 'REFUND';
  if (tab === 'PROMO') return n.type === 'PROMO' || n.type === 'CAMPAIGN' || n.type === 'COUPON';
  return true;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-lg bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-gray-200" />
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-1/3 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export default function CustomerNotificationsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
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

  const allNotifications: Notification[] = data?.data ?? [];
  const unreadCount = allNotifications.filter((n) => !n.read).length;

  const filteredNotifications = useMemo(() => {
    return allNotifications.filter((n) => matchesType(n, activeTab));
  }, [allNotifications, activeTab]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    for (const n of filteredNotifications) {
      const group = n.createdAt ? getDateGroup(n.createdAt) : 'Lebih Lama';
      if (!groups[group]) groups[group] = [];
      groups[group].push(n);
    }
    const order = ['Hari Ini', 'Kemarin', 'Minggu Lalu', 'Lebih Lama'] as const;
    return order.filter((g) => groups[g]?.length).map((g) => ({ label: g, items: groups[g] as Notification[] }));
  }, [filteredNotifications]);

  return (
    <CustomerLayout>
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Tandai semua sudah dibaca
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                activeTab === tab.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.value === 'UNREAD' && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-primary-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow-sm ring-1 ring-gray-100">
            <svg className="mb-4 h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <p className="text-base font-medium text-gray-900">Tidak ada notifikasi</p>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'ALL'
                ? 'Anda sudah membaca semua notifikasi'
                : 'Tidak ada notifikasi untuk filter ini'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedNotifications.map((group) => (
              <div key={group.label}>
                <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  {group.label}
                </h2>
                <div className="space-y-2">
                  {(group.items ?? []).map((n) => {
                    const { borderColor, bgColor, color, iconPath } = getTypeConfig(n.type);
                    return (
                      <div
                        key={n.id}
                        onClick={() => !n.read && markRead.mutate(n.id)}
                        className={`group cursor-pointer rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md border-l-4 ${
                          n.read ? 'border-l-transparent opacity-75' : borderColor
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${bgColor}`}>
                            <svg className={`h-5 w-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
                            </svg>
                          </div>
                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm ${n.read ? 'font-medium text-gray-600' : 'font-semibold text-gray-900'}`}>
                                {n.title || 'Notifikasi'}
                              </p>
                              {!n.read && (
                                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />
                              )}
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">
                              {n.message || n.body}
                            </p>
                            <p className="mt-1.5 text-xs text-gray-400">
                              {n.createdAt
                                ? new Date(n.createdAt).toLocaleString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
