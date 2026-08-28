import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { providerApi } from '../lib/api';
import Layout from '../components/Layout';
import type { BookingStatus } from '../lib/types';

const statusColors: Record<BookingStatus, string> = {
  CONFIRMED: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  PENDING_APPROVAL: 'bg-amber-50 border-amber-200 text-amber-700',
  PENDING_PAYMENT: 'bg-orange-50 border-orange-200 text-orange-700',
  IN_SERVICE: 'bg-sky-50 border-sky-200 text-sky-700',
  COMPLETED: 'bg-teal-50 border-teal-200 text-teal-700',
  CANCELLED: 'bg-gray-50 border-gray-200 text-gray-600',
  NO_SHOW: 'bg-rose-50 border-rose-200 text-rose-700',
  HELD: 'bg-amber-50 border-amber-200 text-amber-700',
  CHECKED_IN: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  EN_ROUTE: 'bg-violet-50 border-violet-200 text-violet-700',
  EXPIRED: 'bg-gray-50 border-gray-200 text-gray-400',
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
    <Layout>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-primary-500 shadow-md">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Kalender</h1>
              <p className="text-sm font-medium text-gray-500">Kelola jadwal booking Anda</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-100">
              <button onClick={() => setView('week')} className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${view === 'week' ? 'bg-gradient-to-r from-primary-500 to-violet-500 text-white shadow' : 'text-gray-600 hover:bg-soft-violet'}`}>Minggu</button>
              <button onClick={() => setView('month')} className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${view === 'month' ? 'bg-gradient-to-r from-primary-500 to-violet-500 text-white shadow' : 'text-gray-600 hover:bg-soft-violet'}`}>Bulan</button>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-100">
              <button onClick={() => view === 'week' ? navigateWeek(-1) : navigateMonth(-1)} className="rounded-lg p-2 text-gray-600 hover:bg-soft-violet hover:text-primary-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="min-w-[140px] text-center text-sm font-bold text-gray-900">{MONTHS[month]} {year}</span>
              <button onClick={() => view === 'week' ? navigateWeek(1) : navigateMonth(1)} className="rounded-lg p-2 text-gray-600 hover:bg-soft-violet hover:text-primary-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="h-96 rounded-xl bg-soft-violet" />
          </div>
        ) : view === 'week' ? (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="grid grid-cols-8 border-b border-gray-100 bg-gradient-to-r from-soft-violet/50 via-white to-soft-pink/30">
              <div className="border-r border-gray-100 px-3 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Waktu</div>
              {getWeekDays().map((day, i) => {
                const isToday = day.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                return (
                  <div key={i} className={`border-r border-gray-100 px-2 py-3 text-center ${isToday ? 'bg-gradient-to-b from-primary-500 to-violet-500 text-white' : ''}`}>
                    <div className={`text-xs font-semibold ${isToday ? 'text-white/80' : 'text-gray-500'}`}>{DAYS[day.getDay()]}</div>
                    <div className={`mt-1 text-lg font-bold ${isToday ? 'text-white' : 'text-gray-900'}`}>{day.getDate()}</div>
                  </div>
                );
              })}
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-gray-50">
                  <div className="border-r border-gray-100 bg-soft-violet/20 px-3 py-3 text-xs font-bold text-gray-600">{String(hour).padStart(2, '0')}:00</div>
                  {getWeekDays().map((day, di) => {
                    const dayBookings = getBookingsForDate(day).filter((b) => {
                      const h = b.startsAt ? new Date(b.startsAt).getHours() : -1;
                      return h === hour;
                    });
                    return (
                      <div key={di} className="border-r border-gray-50 p-1 min-h-[60px] hover:bg-soft-violet/10 transition-colors">
                        {dayBookings.map((b) => (
                          <div key={b.id} className={`mb-1 rounded-lg border px-2 py-1.5 text-xs font-medium shadow-sm ${statusColors[b.status] || 'bg-gray-100 text-gray-600'}`}>
                            <div className="font-bold truncate">{b.customerName}</div>
                            <div className="truncate opacity-80">{b.serviceName}</div>
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
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-4">
            <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden">
              {DAYS.map((d) => (
                <div key={d} className="bg-gradient-to-r from-soft-violet/60 to-soft-pink/30 px-2 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-gray-700">{d}</div>
              ))}
              {Array.from({ length: startOfMonth.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-gray-50/50 min-h-[90px]" />
              ))}
              {Array.from({ length: endOfMonth.getDate() }).map((_, i) => {
                const date = new Date(year, month, i + 1);
                const dayBookings = getBookingsForDate(date);
                const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                return (
                  <div key={i} className={`min-h-[90px] p-2 transition-colors ${isToday ? 'bg-gradient-to-br from-primary-50 to-violet-50 ring-2 ring-inset ring-primary-200' : 'bg-white hover:bg-soft-violet/20'}`}>
                    <div className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-gradient-to-br from-primary-500 to-violet-500 text-white shadow' : 'text-gray-700'}`}>{i + 1}</div>
                    {dayBookings.slice(0, 3).map((b) => (
                      <div key={b.id} className={`mt-1 rounded-lg px-1.5 py-1 text-[10px] font-bold truncate border ${statusColors[b.status] || 'bg-gray-100 text-gray-600'}`}>
                        {b.startsAt ? new Date(b.startsAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : b.time} {b.customerName}
                      </div>
                    ))}
                    {dayBookings.length > 3 && <div className="text-[10px] font-semibold text-primary-600 mt-1">+{dayBookings.length - 3} lagi</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
