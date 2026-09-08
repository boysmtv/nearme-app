import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicApi } from '../../lib/api';

interface NotificationPreference {
  type: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

const DEFAULT_PREFS: NotificationPreference[] = [
  { type: 'BOOKING_CONFIRMED', label: 'Booking Dikonfirmasi', description: 'Notifikasi saat booking Anda dikonfirmasi provider', email: true, push: true, inApp: true },
  { type: 'BOOKING_REMINDER', label: 'Pengingat Booking', description: 'Pengingat H-24 dan H-2 sebelum jadwal', email: true, push: true, inApp: true },
  { type: 'BOOKING_CANCELLED', label: 'Booking Dibatalkan', description: 'Notifikasi saat booking dibatalkan', email: true, push: true, inApp: true },
  { type: 'PAYMENT_SUCCESS', label: 'Pembayaran Berhasil', description: 'Konfirmasi pembayaran telah diterima', email: true, push: true, inApp: true },
  { type: 'PROMO', label: 'Promo & Diskon', description: 'Info promo spesial dari provider favorit', email: false, push: true, inApp: true },
  { type: 'REVIEW_REMINDER', label: 'Pengingat Ulasan', description: 'Minta ulasan setelah booking selesai', email: false, push: true, inApp: true },
  { type: 'LOYALTY_POINTS', label: 'Poin Loyalty', description: 'Update poin dan reward', email: false, push: true, inApp: true },
  { type: 'NEWSLETTER', label: 'Newsletter', description: 'Tips kecantikan dan artikel', email: true, push: false, inApp: false },
];

export default function NotificationPreferencesPage() {
  const qc = useQueryClient();
  const [prefs, setPrefs] = useState<NotificationPreference[]>(DEFAULT_PREFS);

  const { data, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => publicApi.get('/notifications/preferences'),
  });

  const saveMutation = useMutation({
    mutationFn: (preferences: NotificationPreference[]) =>
      publicApi.put('/notifications/preferences', { preferences }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notification-preferences'] }),
  });

  const togglePref = (type: string, channel: 'email' | 'push' | 'inApp') => {
    setPrefs((prev) =>
      prev.map((p) =>
        p.type === type ? { ...p, [channel]: !p[channel] } : p
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Preferensi Notifikasi</h1>
      <p className="text-gray-500">Atur notifikasi mana yang ingin Anda terima</p>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
          <div className="col-span-2">Jenis Notifikasi</div>
          <div className="text-center">Email</div>
          <div className="text-center">Push</div>
          <div className="text-center">In-App</div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {prefs.map((pref) => (
              <div key={pref.type} className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-gray-50">
                <div className="col-span-2">
                  <p className="font-medium text-gray-900">{pref.label}</p>
                  <p className="text-sm text-gray-500">{pref.description}</p>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => togglePref(pref.type, 'email')}
                    className={`w-10 h-6 rounded-full transition-colors ${pref.email ? 'bg-primary-600' : 'bg-gray-300'}`}
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform ${pref.email ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => togglePref(pref.type, 'push')}
                    className={`w-10 h-6 rounded-full transition-colors ${pref.push ? 'bg-primary-600' : 'bg-gray-300'}`}
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform ${pref.push ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => togglePref(pref.type, 'inApp')}
                    className={`w-10 h-6 rounded-full transition-colors ${pref.inApp ? 'bg-primary-600' : 'bg-gray-300'}`}
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform ${pref.inApp ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => saveMutation.mutate(prefs)}
          disabled={saveMutation.isPending}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Preferensi'}
        </button>
      </div>
    </div>
  );
}
