import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { providerApi } from '../../lib/api';
import ProviderLayout from '../../components/ProviderLayout';
import type { BookingStatus } from '../../lib/types';

const statusColors: Record<BookingStatus, string> = {
  CONFIRMED: 'bg-green-100 border-green-300 text-green-800',
  PENDING_APPROVAL: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  PENDING_PAYMENT: 'bg-orange-100 border-orange-300 text-orange-800',
  IN_SERVICE: 'bg-blue-100 border-blue-300 text-blue-800',
  COMPLETED: 'bg-gray-100 border-gray-300 text-gray-600',
  CANCELLED: 'bg-red-50 border-red-200 text-red-600',
  NO_SHOW: 'bg-red-100 border-red-300 text-red-800',
  HELD: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  CHECKED_IN: 'bg-indigo-100 border-indigo-300 text-indigo-800',
  EN_ROUTE: 'bg-purple-100 border-purple-300 text-purple-800',
  EXPIRED: 'bg-gray-50 border-gray-200 text-gray-500',
};

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('week');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  const startDate = view === 'week'
    ? new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()))
    : startOfMonth;
  const endDate = view === 'week'
    ? new Date(startDate.getTime() + 6 * 86400000)
    : endOfMonth;

  const { data: bookingsRes, isLoading } = useQuery({
    queryKey: ['calendar', startDate.toISOString(), endDate.toISOString()],
    queryFn: () => providerApi.calendar.getBookings(startDate.toISOString().split('T')[0] ?? '', endDate.toISOString().split('T')[0] ?? ''),
  });

  const bookings = bookingsRes?.data ?? [];

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter((b) => (b.startsAt ?? '').split('T')[0] === dateStr);
  };

  const navigateWeek = (direction: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + direction * 7);
    setCurrentDate(d);
  };

  const navigateMonth = (direction: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + direction);
    setCurrentDate(d);
  };

  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 7);

  return (
    <ProviderLayout>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kalender</h1>
            <p className="mt-1 text-sm text-gray-500">Kelola jadwal booking Anda</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-gray-300">
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1.5 text-sm font-medium ${view === 'week' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Minggu
              </button>
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1.5 text-sm font-medium ${view === 'month' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Bulan
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => view === 'week' ? navigateWeek(-1) : navigateMonth(-1)}
                className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="min-w-[140px] text-center text-sm font-medium text-gray-900">
                {MONTHS[month]} {year}
              </span>
              <button
                onClick={() => view === 'week' ? navigateWeek(1) : navigateMonth(1)}
                className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="h-96 rounded bg-gray-100" />
          </div>
        ) : view === 'week' ? (
          <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="border-r border-gray-200 px-3 py-3 text-xs font-medium text-gray-500">Waktu</div>
              {getWeekDays().map((day, i) => {
                const isToday = day.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                return (
                  <div key={i} className={`border-r border-gray-100 px-2 py-3 text-center ${isToday ? 'bg-primary-50' : ''}`}>
                    <div className="text-xs text-gray-500">{DAYS[day.getDay()]}</div>
                    <div className={`mt-1 text-lg font-semibold ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-gray-100">
                  <div className="border-r border-gray-200 px-3 py-3 text-xs text-gray-500">
                    {String(hour).padStart(2, '0')}:00
                  </div>
                  {getWeekDays().map((day, di) => {
                    const dayBookings = getBookingsForDate(day).filter((b) => {
                      const h = b.startsAt ? new Date(b.startsAt).getHours() : -1;
                      return h === hour;
                    });
                    return (
                      <div key={di} className="border-r border-gray-50 p-1 min-h-[60px]">
                        {dayBookings.map((b) => (
                          <div
                            key={b.id}
                            className={`mb-1 rounded border px-2 py-1 text-xs ${statusColors[b.status] || 'bg-gray-100 text-gray-600'}`}
                          >
                            <div className="font-medium truncate">{b.customerName}</div>
                            <div className="truncate">{b.serviceName}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 p-4">
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {DAYS.map((d) => (
                <div key={d} className="bg-gray-50 px-2 py-2 text-center text-xs font-medium text-gray-500">
                  {d}
                </div>
              ))}
              {Array.from({ length: startOfMonth.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-white min-h-[80px]" />
              ))}
              {Array.from({ length: endOfMonth.getDate() }).map((_, i) => {
                const date = new Date(year, month, i + 1);
                const dayBookings = getBookingsForDate(date);
                const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                return (
                  <div key={i} className={`bg-white min-h-[80px] p-1.5 ${isToday ? 'bg-primary-50' : ''}`}>
                    <div className={`text-sm font-medium ${isToday ? 'text-primary-600' : 'text-gray-700'}`}>{i + 1}</div>
                    {dayBookings.slice(0, 3).map((b) => (
                      <div key={b.id} className={`mt-0.5 rounded px-1 py-0.5 text-[10px] font-medium truncate ${statusColors[b.status] || 'bg-gray-100 text-gray-600'}`}>
                        {b.startsAt ? new Date(b.startsAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : b.time} {b.customerName}
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-[10px] text-gray-500 mt-0.5">+{dayBookings.length - 3} lagi</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}
