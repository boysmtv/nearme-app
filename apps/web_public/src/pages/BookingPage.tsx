import { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SlotPicker from '../components/SlotPicker';
import BookingSummary from '../components/BookingSummary';
import { publicApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Service, Staff, TimeSlot, Addon, BookingResponse } from '../lib/types';

const contactSchema = z.object({
  customerName: z.string().min(2, 'Nama harus minimal 2 karakter'),
  customerEmail: z.string().email('Email tidak valid'),
  customerPhone: z.string().min(10, 'Nomor telepon harus minimal 10 digit'),
  notes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

type BookingStep = 'service' | 'staff' | 'slot' | 'contact' | 'confirm';

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function BookingPage() {
  const { providerId } = useParams<{ providerId: string }>();
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('service') || '';

  const [step, setStep] = useState<BookingStep>(preselectedServiceId ? 'staff' : 'service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [createdBooking, setCreatedBooking] = useState<BookingResponse | null>(null);

  const { data: servicesRes } = useQuery({
    queryKey: ['services', providerId],
    queryFn: () => publicApi.services.listByProvider(providerId!),
    enabled: !!providerId,
  });

  const { data: staffRes } = useQuery({
    queryKey: ['staff', providerId],
    queryFn: () => publicApi.staff.listByProvider(providerId!),
    enabled: !!providerId,
  });

  const { data: slotsRes, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', providerId, selectedService?.id, selectedStaff?.id, selectedDate],
    queryFn: () =>
      publicApi.availability.getSlots(
        providerId!,
        selectedService!.id,
        selectedStaff!.id,
        selectedDate ?? new Date().toISOString().split('T')[0],
      ),
    enabled: !!providerId && !!selectedService?.id && !!selectedStaff?.id && !!selectedDate,
  });

  const [pin, setPin] = useState('');
  const [pinMsg, setPinMsg] = useState<string | null>(null);
  const verifyPinMut = useMutation({
    mutationFn: () => publicApi.bookings.verifyPin(createdBooking!.id, pin),
    onSuccess: () => setPinMsg('PIN terverifikasi, booking dikonfirmasi! 🎉'),
    onError: (e) => setPinMsg(e instanceof Error ? e.message : 'PIN salah'),
  });

  const createBooking = useMutation({
    mutationFn: (data: z.infer<typeof contactSchema>) =>
      publicApi.bookings.create({
        providerId: providerId!,
        serviceId: selectedService!.id,
        startsAt: selectedSlot!.startTime,
        endsAt: selectedSlot!.endTime,
        ...data,
        notes: data.notes || '',
        idempotencyKey: crypto.randomUUID(),
      }),
  });

  const services = servicesRes?.data ?? [];

  useEffect(() => {
    if (preselectedServiceId && !selectedService && services.length > 0) {
      const match = services.find((s) => s.id === preselectedServiceId);
      if (match) setSelectedService(match);
    }
  }, [preselectedServiceId, services, selectedService]);
  const staffList = staffRes?.data ?? [];
  const slots = slotsRes?.data ?? [];

  const filteredStaff = useMemo(() => {
    if (!selectedService) return staffList;
    return staffList.filter(
      (s) =>
        selectedService.id &&
        (!(s.specialties?.length) || s.specialties.includes(selectedService.category)),
    );
  }, [staffList, selectedService]);

  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const { user, isAuthenticated } = useAuth();
  const { data: profileRes } = useQuery({
    queryKey: ['customerProfile'],
    queryFn: () => publicApi.customer.getProfile(),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isAuthenticated) {
      const data = (profileRes as unknown as { data?: { nickname?: string; name?: string; email?: string; phone?: string } })?.data ?? (profileRes as unknown as { nickname?: string; name?: string; email?: string; phone?: string });
      const profile = (data as { nickname?: string; name?: string; email?: string; phone?: string }) ?? {};
      const name = profile.nickname || profile.name || user?.name || '';
      const email = profile.email || user?.email || '';
      const phone = profile.phone || '';
      if (name || email || phone) {
        const currentNotes = contactForm.getValues('notes') || '';
        contactForm.reset({ customerName: name, customerEmail: email, customerPhone: phone, notes: currentNotes });
      }
    }
  }, [isAuthenticated, profileRes, user]);

  const stepIndex: Record<BookingStep, number> = {
    service: 0,
    staff: 1,
    slot: 2,
    contact: 3,
    confirm: 4,
  };

  const steps: { key: BookingStep; label: string; icon: string; color: string }[] = [
    { key: 'service', label: 'Layanan', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'from-[#e8e8ff] to-[#e8f2ff]' },
    { key: 'staff', label: 'Staf', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'from-[#ffe8ec] to-[#fff4d6]' },
    { key: 'slot', label: 'Jadwal', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'from-[#e6f7ee] to-[#e8f2ff]' },
    { key: 'contact', label: 'Kontak', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'from-[#f0e8ff] to-[#e8e8ff]' },
    { key: 'confirm', label: 'Konfirmasi', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-[#fff4d6] to-[#ffe8ec]' },
  ];

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setSelectedStaff(null);
    setSelectedSlot(null);
    setSelectedAddons([]);
    setStep('staff');
  };

  const handleStaffSelect = (staff: Staff) => {
    setSelectedStaff(staff);
    setSelectedSlot(null);
    setStep('slot');
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep('contact');
  };

  const handleAddonToggle = (addon: Addon) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === addon.id) ? prev.filter((a) => a.id !== addon.id) : [...prev, addon],
    );
  };

  const handleContactSubmit = () => {
    setStep('confirm');
  };

  const handleConfirm = () => {
    const values = contactForm.getValues();
    createBooking.mutate(values, {
      onSuccess: (res) => {
        setCreatedBooking(res.data);
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9FF]">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm">
            <Link to="/search" className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[#6a6acc] ring-1 ring-[#E8E8FF] hover:bg-[#FAF9FF]">← Cari Layanan</Link>
            <span className="text-gray-300">/</span>
            <span className="rounded-full bg-gradient-to-r from-[#8B8CFF] to-[#A5A6FF] px-3 py-1 text-xs font-bold text-white">✦ Booking</span>
          </nav>

          {/* Progress Steps */}
          <div className="mb-8 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#E8E8FF] overflow-x-auto">
            <div className="flex items-center min-w-max">
              {steps.map((s, idx) => {
                const isDone = stepIndex[step] > idx;
                const isCurrent = stepIndex[step] === idx;
                return (
                  <div key={s.key} className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                          isDone
                            ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-md'
                            : isCurrent
                              ? 'bg-gradient-to-br from-[#8B8CFF] to-[#A5A6FF] text-white shadow-lg shadow-[#8B8CFF]/25 ring-2 ring-[#d0d0ff]'
                              : 'bg-[#FAF9FF] text-gray-400 ring-1 ring-[#E8E8FF]'
                        }`}
                      >
                        {isDone ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} /></svg>
                        )}
                      </div>
                      <span
                        className={`text-sm font-bold whitespace-nowrap ${
                          isDone || isCurrent ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="mx-2 sm:mx-3 flex items-center">
                        <div className={`h-1 w-8 sm:w-12 rounded-full ${isDone ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : isCurrent ? 'bg-[#e8e8ff]' : 'bg-[#E8E8FF]'}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {createdBooking ? (
            <div className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-[#e6f7ee] bg-white shadow-xl shadow-emerald-100/40">
              <div className="bg-gradient-to-r from-emerald-400 to-teal-400 p-[1px]">
                <div className="bg-white rounded-[15px] p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e6f7ee] to-[#e8f2ff] text-emerald-600 shadow-inner">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="mt-4 text-xl font-black text-gray-900">Booking Berhasil! 🎉</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Simpan kode booking berikut sebagai referensi Anda
                  </p>
                  <div className="mx-auto mt-4 w-fit rounded-2xl bg-gradient-to-r from-[#8B8CFF] to-[#A5A6FF] p-[1.5px]">
                    <div className="rounded-[14px] bg-[#FAF9FF] px-6 py-3 text-lg font-black tracking-widest text-[#6a6acc]">
                      {createdBooking.bookingCode}
                    </div>
                  </div>
                  <p className="mt-3 inline-flex rounded-full bg-[#e6f7ee] px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700">
                    Status: {createdBooking.status}
                  </p>
                  {createdBooking.confirmationPin && (
                    <div className="mx-auto mt-4 w-fit rounded-2xl bg-gradient-to-br from-[#fff4d6] to-[#ffe8ec] p-[1.5px]">
                      <div className="rounded-[14px] bg-[#fff8e1] px-6 py-3 text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-amber-700">PIN Konfirmasi (tunjukkan ke staf)</p>
                        <p className="text-2xl font-black tracking-[0.3em] text-amber-700">{createdBooking.confirmationPin}</p>
                      </div>
                    </div>
                  )}
                  <div className="mt-6 rounded-2xl border border-[#E8E8FF] bg-[#FAF9FF] p-4 text-left">
                    <h3 className="flex items-center gap-2 text-sm font-black text-gray-900"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8e8ff] text-[#6a6acc] text-xs">✦</span> Verifikasi PIN</h3>
                    <p className="mt-1 text-xs text-gray-500">Masukkan 6-digit PIN untuk check-in</p>
                    <div className="mt-3 flex gap-2">
                      <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="6-digit PIN" maxLength={6} className="flex-1 rounded-xl border border-[#E8E8FF] bg-white px-3 py-2.5 text-sm focus:border-[#8B8CFF] focus:outline-none focus:ring-2 focus:ring-[#e8e8ff] text-center tracking-widest font-bold" />
                      <button onClick={() => verifyPinMut.mutate()} disabled={verifyPinMut.isPending || pin.length !== 6} className="rounded-xl bg-gradient-to-r from-[#8B8CFF] to-[#A5A6FF] px-5 py-2.5 text-sm font-bold text-white shadow hover:shadow-md disabled:opacity-50">{verifyPinMut.isPending ? '...' : 'Verifikasi'}</button>
                    </div>
                    {pinMsg && <p className="mt-2 rounded-xl bg-[#e6f7ee] px-3 py-2 text-sm font-medium text-emerald-700">{pinMsg}</p>}
                    {verifyPinMut.isError && <p className="mt-1 text-sm text-rose-600">{(verifyPinMut.error as Error).message}</p>}
                  </div>
                  <div className="mt-6 flex justify-center gap-3">
                    <Link
                      to="/"
                      className="rounded-full border border-[#E8E8FF] bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-[#FAF9FF]"
                    >
                      Beranda
                    </Link>
                    <Link
                      to="/search"
                      className="rounded-full bg-gradient-to-r from-[#8B8CFF] to-[#A5A6FF] px-5 py-2.5 text-sm font-bold text-white shadow"
                    >
                      Cari Layanan Lain
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step: Service Selection */}
              {step === 'service' && (
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8e8ff] to-[#f0e8ff] text-[#6a6acc]"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg></span>
                    <h2 className="text-xl font-black text-gray-900">Pilih Layanan</h2>
                    <span className="rounded-full bg-[#e8e8ff] px-2.5 py-1 text-xs font-bold text-[#6a6acc]">{services.length} pilihan</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleServiceSelect(service)}
                        className={`w-full rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                          selectedService?.id === service.id
                            ? 'border-[#8B8CFF] bg-gradient-to-br from-[#e8e8ff] to-white ring-2 ring-[#d0d0ff] shadow-lg shadow-[#8B8CFF]/10'
                            : 'border-[#E8E8FF] bg-white hover:border-[#d0d0ff] hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-gray-900">{service.name}</h3>
                            <p className="mt-1 text-sm text-gray-500 leading-relaxed">{service.description}</p>
                            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#e8f2ff] px-2.5 py-1 text-xs font-semibold text-[#5a7ab3]">{service.duration} menit ⏱</span>
                          </div>
                          <span className="rounded-xl bg-gradient-to-br from-[#8B8CFF] to-[#A5A6FF] px-3 py-1.5 text-sm font-black text-white shadow-sm">
                            {formatPrice(service.price)}
                          </span>
                        </div>
                        {(service.addons?.length ?? 0) > 0 && (
                          <div className="mt-3 border-t border-[#E8E8FF] pt-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Add-on tersedia:</p>
                            <div className="mt-1.5 flex flex-wrap gap-2">
                              {service.addons.map((addon) => (
                                <span
                                  key={addon.id}
                                  className="rounded-full bg-[#fff4d6] px-2.5 py-1 text-xs font-medium text-amber-700"
                                >
                                  {addon.name} (+{formatPrice(addon.price)})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Staff Selection */}
              {step === 'staff' && (
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffe8ec] to-[#fff4d6] text-rose-500"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg></span>
                    <h2 className="text-xl font-black text-gray-900">Pilih Staf</h2>
                    <span className="rounded-full bg-[#ffe8ec] px-2.5 py-1 text-xs font-bold text-rose-600">{filteredStaff.length} staf</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {filteredStaff.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleStaffSelect(s)}
                        className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 ${
                          selectedStaff?.id === s.id
                            ? 'border-[#8B8CFF] bg-gradient-to-br from-[#e8e8ff] to-white ring-2 ring-[#d0d0ff] shadow-md'
                            : 'border-[#E8E8FF] bg-white hover:border-[#d0d0ff] hover:shadow-sm'
                        }`}
                      >
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#e8e8ff] to-[#ffe8ec] ring-1 ring-[#E8E8FF]">
                          {s.avatarUrl ? (
                            <img src={s.avatarUrl} alt={s.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm font-black text-[#6a6acc]">
                              {s.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 truncate">{s.name}</h4>
                          {s.rating > 0 && (
                            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                              <span className="rounded-full bg-[#fff4d6] px-1.5 py-0.5 font-bold text-amber-700">⭐ {s.rating.toFixed(1)}</span>
                              <span>({s.reviewCount})</span>
                            </div>
                          )}
                          <p className="mt-1 text-xs text-gray-500 line-clamp-1">{s.bio}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => { setSelectedStaff(null); setStep('service'); }}
                    className="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#6a6acc] ring-1 ring-[#E8E8FF] hover:bg-[#FAF9FF]"
                  >
                    ← Kembali ke layanan
                  </button>
                </div>
              )}

              {/* Step: Slot Selection */}
              {step === 'slot' && (
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E8E8FF]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#e6f7ee] to-[#e8f2ff] text-emerald-600"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></span>
                    <h2 className="text-xl font-black text-gray-900">Pilih Jadwal</h2>
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Tanggal</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedSlot(null);
                      }}
                      min={(() => {
                        const d = new Date();
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        return `${y}-${m}-${day}`;
                      })()}
                      className="mt-1.5 rounded-xl border border-[#E8E8FF] bg-[#FAF9FF] px-3 py-2.5 text-sm focus:border-[#8B8CFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e8e8ff]"
                    />
                  </div>
                  <div className="mt-4">
                    <SlotPicker
                      slots={slots}
                      selectedSlotId={selectedSlot?.id || null}
                      onSelect={handleSlotSelect}
                      isLoading={slotsLoading}
                    />
                  </div>
                  {selectedService && (selectedService.addons?.length ?? 0) > 0 && (
                    <div className="mt-6">
                      <h3 className="flex items-center gap-2 text-sm font-black text-gray-700"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fff4d6] text-amber-600 text-xs">＋</span> Tambah Add-on</h3>
                      <div className="mt-2 space-y-2">
                        {selectedService.addons.map((addon) => (
                          <label
                            key={addon.id}
                            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                              selectedAddons.find((a) => a.id === addon.id)
                                ? 'border-[#8B8CFF] bg-[#e8e8ff] ring-1 ring-[#d0d0ff]'
                                : 'border-[#E8E8FF] bg-[#FAF9FF] hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={!!selectedAddons.find((a) => a.id === addon.id)}
                                onChange={() => handleAddonToggle(addon)}
                                className="h-4 w-4 rounded border-gray-300 text-[#8B8CFF] focus:ring-[#8B8CFF]"
                              />
                              <div>
                                <span className="text-sm font-bold text-gray-900">{addon.name}</span>
                                <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-500">+{addon.duration} menit</span>
                              </div>
                            </div>
                            <span className="rounded-full bg-white px-2.5 py-1 text-sm font-black text-[#6a6acc] ring-1 ring-[#E8E8FF]">{formatPrice(addon.price)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => { setSelectedSlot(null); setStep('staff'); }}
                    className="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#6a6acc] ring-1 ring-[#E8E8FF] hover:bg-[#FAF9FF]"
                  >
                    ← Kembali ke pemilihan staf
                  </button>
                </div>
              )}

              {/* Step: Contact Info */}
              {step === 'contact' && (
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E8E8FF]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f0e8ff] to-[#e8e8ff] text-[#8B8CFF]"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></span>
                    <h2 className="text-xl font-black text-gray-900">Informasi Kontak</h2>
                  </div>
                  {isAuthenticated ? (
                    <p className="mt-2 inline-flex rounded-full bg-[#e6f7ee] px-3 py-1 text-xs font-bold text-emerald-700">
                      ✓ Otomatis terisi dari profil — hanya catatan dapat diedit
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">
                      Isi data diri Anda untuk menyelesaikan booking
                    </p>
                  )}
                  <form
                    onSubmit={contactForm.handleSubmit(handleContactSubmit)}
                    className="mt-6 space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Nama Lengkap</label>
                      <input
                        {...contactForm.register('customerName')}
                        readOnly={isAuthenticated}
                        disabled={isAuthenticated}
                        className={`mt-1.5 block w-full rounded-xl border px-4 py-3 text-sm focus:border-[#8B8CFF] focus:outline-none focus:ring-2 focus:ring-[#e8e8ff] ${isAuthenticated ? 'border-[#E8E8FF] bg-[#FAF9FF] text-gray-600' : 'border-[#E8E8FF] bg-white'}`}
                        placeholder="Masukkan nama Anda"
                      />
                      {contactForm.formState.errors.customerName && (
                        <p className="mt-1 text-sm text-rose-600">
                          {contactForm.formState.errors.customerName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Email</label>
                      <input
                        {...contactForm.register('customerEmail')}
                        type="email"
                        readOnly={isAuthenticated}
                        disabled={isAuthenticated}
                        className={`mt-1.5 block w-full rounded-xl border px-4 py-3 text-sm focus:border-[#8B8CFF] focus:outline-none focus:ring-2 focus:ring-[#e8e8ff] ${isAuthenticated ? 'border-[#E8E8FF] bg-[#FAF9FF] text-gray-600' : 'border-[#E8E8FF] bg-white'}`}
                        placeholder="email@contoh.com"
                      />
                      {contactForm.formState.errors.customerEmail && (
                        <p className="mt-1 text-sm text-rose-600">
                          {contactForm.formState.errors.customerEmail.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Nomor Telepon</label>
                      <input
                        {...contactForm.register('customerPhone')}
                        type="tel"
                        readOnly={isAuthenticated}
                        disabled={isAuthenticated}
                        className={`mt-1.5 block w-full rounded-xl border px-4 py-3 text-sm focus:border-[#8B8CFF] focus:outline-none focus:ring-2 focus:ring-[#e8e8ff] ${isAuthenticated ? 'border-[#E8E8FF] bg-[#FAF9FF] text-gray-600' : 'border-[#E8E8FF] bg-white'}`}
                        placeholder="08xxxxxxxxxx"
                      />
                      {contactForm.formState.errors.customerPhone && (
                        <p className="mt-1 text-sm text-rose-600">
                          {contactForm.formState.errors.customerPhone.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                        Catatan <span className="text-gray-400 normal-case tracking-normal">(opsional)</span>
                      </label>
                      <textarea
                        {...contactForm.register('notes')}
                        rows={3}
                        className="mt-1.5 block w-full rounded-xl border border-[#E8E8FF] bg-white px-4 py-3 text-sm focus:border-[#8B8CFF] focus:outline-none focus:ring-2 focus:ring-[#e8e8ff]"
                        placeholder="Permintaan khusus, alergi, dll."
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep('slot')}
                        className="rounded-full border border-[#E8E8FF] bg-white px-6 py-3 text-sm font-bold text-gray-700 hover:bg-[#FAF9FF]"
                      >
                        Kembali
                      </button>
                      <button
                        type="submit"
                        className="flex-1 rounded-full bg-gradient-to-r from-[#8B8CFF] to-[#A5A6FF] px-6 py-3 text-sm font-black text-white shadow-md hover:shadow-lg transition"
                      >
                        Lanjutkan ✦
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step: Confirm */}
              {step === 'confirm' && (
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E8E8FF]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#fff4d6] to-[#e6f7ee] text-amber-600"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                    <h2 className="text-xl font-black text-gray-900">Konfirmasi Booking</h2>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Pastikan semua data sudah benar sebelum melanjutkan
                  </p>
                  <div className="mt-4 rounded-2xl border border-[#E8E8FF] bg-[#FAF9FF] p-5">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between bg-white rounded-xl px-3 py-2 ring-1 ring-[#E8E8FF]/50">
                        <span className="text-gray-500">Layanan</span>
                        <span className="font-bold text-gray-900">{selectedService?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Durasi</span>
                        <span className="font-medium text-gray-700 rounded-full bg-white px-2.5 py-1 ring-1 ring-[#E8E8FF] text-xs">{selectedService?.duration} menit</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Staf</span>
                        <span className="font-medium text-gray-700">{selectedStaff?.name}</span>
                      </div>
                      {selectedSlot && (
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-500 shrink-0">Waktu</span>
                          <span className="text-right font-medium text-gray-700">
                            {new Date(selectedSlot.startTime).toLocaleString('id-ID', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between bg-white rounded-xl px-3 py-2 ring-1 ring-[#E8E8FF]/50">
                        <span className="text-gray-500">Nama</span>
                        <span className="font-medium text-gray-700">{contactForm.getValues('customerName')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email</span>
                        <span className="text-gray-700 text-xs truncate max-w-[180px]">{contactForm.getValues('customerEmail')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Telepon</span>
                        <span className="font-medium text-gray-700">{contactForm.getValues('customerPhone')}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => setStep('contact')}
                        className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#6a6acc] ring-1 ring-[#E8E8FF] hover:bg-[#FAF9FF]"
                      >
                        ✎ Edit Kontak
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => setStep('contact')}
                      className="rounded-full border border-[#E8E8FF] bg-white px-6 py-3 text-sm font-bold text-gray-700 hover:bg-[#FAF9FF]"
                    >
                      ← Kembali
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={createBooking.isPending}
                      className="flex-1 rounded-full bg-gradient-to-r from-[#8B8CFF] to-[#FF8E9E] px-6 py-3 text-sm font-black text-white shadow-md hover:shadow-lg disabled:opacity-50 transition"
                    >
                      {createBooking.isPending ? '⏳ Memproses...' : '✦ Konfirmasi Booking'}
                    </button>
                  </div>
                  {createBooking.isError && (
                    <p className="mt-3 rounded-xl bg-[#ffe8ec] px-3 py-2 text-sm font-medium text-rose-600 ring-1 ring-rose-200">
                      {(createBooking.error as Error).message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {selectedService && (
                  <BookingSummary
                    service={selectedService}
                    staff={selectedStaff}
                    slot={selectedSlot}
                    selectedAddons={selectedAddons}
                    depositRequired={selectedService.depositAmount > 0}
                    onConfirm={handleConfirm}
                    isPending={createBooking.isPending}
                  />
                )}
              </div>
            </div>
          </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
