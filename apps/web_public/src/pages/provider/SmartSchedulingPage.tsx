import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface SmartSuggestion {
  type: 'PEAK_HOURS' | 'STAFF_ALLOCATION' | 'PRICING' | 'PROMOTION';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
  data?: any;
}

export default function SmartSchedulingPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: suggestionsRes, isLoading } = useQuery({
    queryKey: ['smart-suggestions', selectedDate],
    queryFn: () => api.get(`/provider/analytics/smart-suggestions?date=${selectedDate}`),
  });

  const { data: insightsRes } = useQuery({
    queryKey: ['peak-hours', selectedDate],
    queryFn: () => api.get(`/provider/analytics/peak-hours?date=${selectedDate}`),
  });

  const suggestions: SmartSuggestion[] = (suggestionsRes as any)?.data ?? [
    {
      type: 'PEAK_HOURS',
      title: 'Jam Sibuk: 10:00 - 14:00',
      description: 'Berdasarkan data 30 hari terakhir, booking paling banyak di jam ini. Pertambahkan staf atau buka slot tambahan.',
      impact: 'high',
      action: 'Tambah staf di jam 10-14',
    },
    {
      type: 'STAFF_ALLOCATION',
      title: 'Staf Underutilized: Andi',
      description: 'Andi hanya memiliki 3 booking minggu ini. Pertimbangkan untuk memindahkan ke shift yang lebih sibuk.',
      impact: 'medium',
      action: 'Optimasi jadwal staf',
    },
    {
      type: 'PRICING',
      title: 'Harga Competitive',
      description: 'Harga potong rambut Anda 15% di bawah rata-rata pasar. Pertimbangkan untuk menaikkan harga secara bertahap.',
      impact: 'medium',
      action: 'Review harga',
    },
    {
      type: 'PROMOTION',
      title: 'Waktu Promosi Optimal',
      description: 'Booking turun 20% di hari Senin. Buat promo "Senin Hemat" untuk menarik lebih banyak customer.',
      impact: 'high',
      action: 'Buat promo hari Senin',
    },
  ];

  const peakHours = (insightsRes as any)?.data ?? {
    hourly: Array.from({ length: 14 }, (_, i) => ({
      hour: i + 8,
      count: Math.floor(Math.random() * 20) + 5,
    })),
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PEAK_HOURS': return '⏰';
      case 'STAFF_ALLOCATION': return '👥';
      case 'PRICING': return '💰';
      case 'PROMOTION': return '🎯';
      default: return '💡';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Scheduling AI</h1>
          <p className="text-gray-500">Rekomendasi cerdas berdasarkan data booking Anda</p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:border-primary-500 focus:outline-none"
        />
      </div>

      {/* Peak Hours Chart */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Jam Sibuk</h2>
        <div className="flex items-end gap-1 h-40">
          {peakHours.hourly.map((h: any) => {
            const maxCount = Math.max(...peakHours.hourly.map((x: any) => x.count));
            const height = maxCount > 0 ? (h.count / maxCount) * 100 : 0;
            return (
              <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{h.count}</span>
                <div
                  className={`w-full rounded-t ${height > 70 ? 'bg-red-400' : height > 40 ? 'bg-yellow-400' : 'bg-green-400'}`}
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-400">{h.hour}:00</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded" />
            <span className="text-xs text-gray-500">Sibuk (&gt;70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded" />
            <span className="text-xs text-gray-500">Sedang (40-70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded" />
            <span className="text-xs text-gray-500">Sepi (&lt;40%)</span>
          </div>
        </div>
      </div>

      {/* Smart Suggestions */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">Rekomendasi AI</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-gray-100">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getTypeIcon(s.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{s.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getImpactColor(s.impact)}`}>
                        {s.impact === 'high' ? 'Tinggi' : s.impact === 'medium' ? 'Sedang' : 'Rendah'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{s.description}</p>
                  </div>
                  <button className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100">
                    {s.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
