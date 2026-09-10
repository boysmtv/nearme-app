import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function AnalyticsDeepPage() {
  const [period, setPeriod] = useState('30d');

  const { data: analyticsRes } = useQuery({
    queryKey: ['analytics-deep', period],
    queryFn: () => api.get(`/provider/analytics/deep?period=${period}`),
  });

  const { data: segmentationRes } = useQuery({
    queryKey: ['customer-segmentation'],
    queryFn: () => api.get('/provider/analytics/segmentation'),
  });

  const { data: forecastRes } = useQuery({
    queryKey: ['booking-forecast'],
    queryFn: () => api.get('/provider/analytics/forecast'),
  });

  const analytics = (analyticsRes as any)?.data ?? {
    revenue: { total: 0, growth: 0, daily: [] },
    bookings: { total: 0, growth: 0, completed: 0, cancelled: 0 },
    customers: { new: 0, returning: 0, churnRate: 0 },
    topServices: [],
    staffPerformance: [],
  };

  const segmentation = (segmentationRes as any)?.data ?? [];

  const forecast = (forecastRes as any)?.data ?? {
    nextWeek: { predicted: 0, confidence: 0 },
    nextMonth: { predicted: 0, confidence: 0 },
    recommendation: 'Belum cukup data untuk prediksi.',
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Mendalam</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:border-primary-500 focus:outline-none"
        >
          <option value="7d">7 Hari</option>
          <option value="30d">30 Hari</option>
          <option value="90d">90 Hari</option>
          <option value="1y">1 Tahun</option>
        </select>
      </div>

      {/* Revenue & Booking Forecast */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-6 text-white">
          <p className="text-primary-100">Prediksi Minggu Depan</p>
          <p className="text-4xl font-bold mt-2">{forecast.nextWeek.predicted} booking</p>
          <p className="text-sm text-primary-200 mt-1">Confidence: {forecast.nextWeek.confidence}%</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <p className="text-green-100">Prediksi Bulan Depan</p>
          <p className="text-4xl font-bold mt-2">{forecast.nextMonth.predicted} booking</p>
          <p className="text-sm text-green-200 mt-1">Confidence: {forecast.nextMonth.confidence}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">💡 Rekomendasi AI</h3>
        <p className="text-gray-600">{forecast.recommendation}</p>
      </div>

      {/* Customer Segmentation */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Segmentasi Pelanggan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {segmentation.map((seg: any) => (
            <div key={seg.segment} className="text-center p-4 rounded-xl bg-gray-50">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: seg.color + '20' }}>
                <span className="text-2xl font-bold" style={{ color: seg.color }}>{seg.count}</span>
              </div>
              <p className="font-semibold text-gray-900 mt-3">{seg.segment}</p>
              <p className="text-sm text-gray-500">{seg.percentage}% dari total</p>
              {seg.revenue > 0 && (
                <p className="text-xs text-gray-400 mt-1">Rp {seg.revenue.toLocaleString('id-ID')}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top Services */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Layanan Terlaris</h3>
        <div className="space-y-3">
          {(analytics.topServices.length > 0 ? analytics.topServices : []).map((service: any, i: number) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-400 w-6">{i + 1}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{service.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${(service.count / 85) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">{service.count}x</span>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-600">
                Rp {service.revenue.toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Performance */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Performa Staf</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-gray-600 font-medium">Staf</th>
                <th className="text-center py-3 text-gray-600 font-medium">Booking</th>
                <th className="text-center py-3 text-gray-600 font-medium">Rating</th>
                <th className="text-center py-3 text-gray-600 font-medium">Repeat Rate</th>
                <th className="text-right py-3 text-gray-600 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(analytics.staffPerformance.length > 0 ? analytics.staffPerformance : []).map((staff: any) => (
                <tr key={staff.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-900">{staff.name}</td>
                  <td className="py-3 text-center">{staff.bookings}</td>
                  <td className="py-3 text-center">
                    <span className="text-yellow-500">★</span> {staff.rating}
                  </td>
                  <td className="py-3 text-center">{staff.repeatRate}</td>
                  <td className="py-3 text-right">Rp {staff.revenue.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
