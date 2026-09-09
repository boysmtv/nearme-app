import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  title: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  totalBookings: number;
  monthlyBookings: number;
  checkInStatus: 'CHECKED_IN' | 'CHECKED_OUT' | null;
  lastCheckIn: string;
}

export default function StaffManagementSuitePage() {
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: staffRes, isLoading } = useQuery({
    queryKey: ['provider-staff'],
    queryFn: () => api.get('/provider/staff'),
  });

  const { data: statsRes } = useQuery({
    queryKey: ['staff-performance'],
    queryFn: () => api.get('/provider/staff/performance'),
  });

  const checkInMutation = useMutation({
    mutationFn: (staffId: string) => api.post(`/provider/staff/${staffId}/check-in`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-staff'] });
      qc.invalidateQueries({ queryKey: ['staff-performance'] });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (staffId: string) => api.post(`/provider/staff/${staffId}/check-out`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-staff'] });
      qc.invalidateQueries({ queryKey: ['staff-performance'] });
    },
  });

  const staff = staffRes?.data ?? [];
  const stats = statsRes?.data ?? {};

  return (
    <div className="max-w-screen-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manajemen Staf</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Staf</p>
          <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4">
          <p className="text-sm text-gray-500">Hadir Hari Ini</p>
          <p className="text-2xl font-bold text-green-600">
            {staff.filter((s: StaffMember) => s.checkInStatus === 'CHECKED_IN').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4">
          <p className="text-sm text-gray-500">Booking Bulan Ini</p>
          <p className="text-2xl font-bold text-primary-600">{stats.monthlyBookings || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4">
          <p className="text-sm text-gray-500">Rata-rata Rating</p>
          <p className="text-2xl font-bold text-yellow-500">{stats.avgRating || '0.0'}</p>
        </div>
      </div>

      {/* Staff List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">Belum ada staf</p>
        </div>
      ) : (
        <div className="space-y-3">
          {staff.map((s: StaffMember) => (
            <div key={s.id} className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={s.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=6C63FF&color=fff`}
                    alt={s.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{s.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.checkInStatus === 'CHECKED_IN' ? 'bg-green-100 text-green-700' :
                        s.checkInStatus === 'CHECKED_OUT' ? 'bg-gray-100 text-gray-500' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {s.checkInStatus === 'CHECKED_IN' ? '● Hadir' :
                         s.checkInStatus === 'CHECKED_OUT' ? '○ Pulang' : 'Belum Absen'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{s.title || 'Staf'}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">★ {s.rating?.toFixed(1) || '0.0'} ({s.reviewCount || 0})</span>
                      <span className="text-xs text-gray-400">{s.monthlyBookings || 0} booking bulan ini</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {s.checkInStatus !== 'CHECKED_IN' ? (
                    <button
                      onClick={() => checkInMutation.mutate(s.id)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Check In
                    </button>
                  ) : (
                    <button
                      onClick={() => checkOutMutation.mutate(s.id)}
                      className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                    >
                      Check Out
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedStaff(selectedStaff === s.id ? null : s.id)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Detail
                  </button>
                </div>
              </div>

              {selectedStaff === s.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Total Booking</p>
                      <p className="font-semibold text-gray-900">{s.totalBookings || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Bulan Ini</p>
                      <p className="font-semibold text-gray-900">{s.monthlyBookings || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Rating</p>
                      <p className="font-semibold text-gray-900">★ {s.rating?.toFixed(1) || '0.0'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Terakhir Check-in</p>
                      <p className="font-semibold text-gray-900">
                        {s.lastCheckIn ? new Date(s.lastCheckIn).toLocaleTimeString('id-ID') : '-'}
                      </p>
                    </div>
                  </div>
                  {s.specialties && s.specialties.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-1">Spesialisasi</p>
                      <div className="flex flex-wrap gap-1">
                        {s.specialties.map((spec) => (
                          <span key={spec} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
