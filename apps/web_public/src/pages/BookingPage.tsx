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
    onSuccess: () => setPinMsg('PIN terverifikasi, booking dikonfirmasi!'),
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

  const steps: { key: BookingStep; label: string }[] = [
    { key: 'service', label: 'Layanan' },
    { key: 'staff', label: 'Staf' },
    { key: 'slot', label: 'Jadwal' },
    { key: 'contact', label: 'Kontak' },
    { key: 'confirm', label: 'Konfirmasi' },
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
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-gray-500">
            <Link to="/search" className="hover:text-primary-600">Cari Layanan</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Booking</span>
          </nav>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center">
              {steps.map((s, idx) => (
                <div key={s.key} className="flex items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                      stepIndex[step] > idx
                        ? 'bg-primary-600 text-white'
                          : stepIndex[step] === idx
                            ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500'
                            : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {stepIndex[step] > idx ? (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      stepIndex[step] >= idx ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {s.label}
                  </span>
                  {idx < steps.length - 1 && (
                    <div
                      className={`mx-4 h-px w-12 sm:w-16 ${
                        stepIndex[step] > idx ? 'bg-primary-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {createdBooking ? (
            <div className="mx-auto max-w-xl rounded-xl border border-green-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">Booking Berhasil Dibuat</h2>
              <p className="mt-2 text-sm text-gray-500">
                Simpan kode booking berikut sebagai referensi Anda
              </p>
              <div className="mx-auto mt-4 w-fit rounded-lg bg-gray-100 px-6 py-3 text-lg font-bold tracking-widest text-gray-900">
                {createdBooking.bookingCode}
              </div>
              <p className="mt-3 text-xs uppercase tracking-wide text-gray-400">
                Status: {createdBooking.status}
              </p>
              {createdBooking.confirmationPin && (
                <div className="mx-auto mt-4 w-fit rounded-lg bg-yellow-50 border border-yellow-200 px-6 py-3">
                  <p className="text-xs text-yellow-700">PIN Konfirmasi (tunjukkan ke staf)</p>
                  <p className="text-xl font-bold tracking-widest text-yellow-900">{createdBooking.confirmationPin}</p>
                </div>
              )}
              <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left">
                <h3 className="text-sm font-semibold text-gray-900">Verifikasi PIN</h3>
                <p className="mt-1 text-xs text-gray-500">POST /bookings/{'{id}'}/verify-pin — masukkan 6-digit PIN untuk check-in</p>
                <div className="mt-3 flex gap-2">
                  <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="6-digit PIN" maxLength={6} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
                  <button onClick={() => verifyPinMut.mutate()} disabled={verifyPinMut.isPending || pin.length !== 6} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">{verifyPinMut.isPending ? '...' : 'Verifikasi'}</button>
                </div>
                {pinMsg && <p className="mt-2 text-sm text-green-600">{pinMsg}</p>}
                {verifyPinMut.isError && <p className="mt-1 text-sm text-red-600">{(verifyPinMut.error as Error).message}</p>}
              </div>
              <div className="mt-6 flex justify-center gap-3">
                <Link
                  to="/"
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Beranda
                </Link>
                <Link
                  to="/search"
                  className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  Cari Layanan Lain
                </Link>
              </div>
            </div>
          ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step: Service Selection */}
              {step === 'service' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Pilih Layanan</h2>
                  <div className="mt-4 space-y-3">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleServiceSelect(service)}
                        className={`w-full rounded-xl border p-5 text-left transition-all ${
                          selectedService?.id === service.id
                            ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                            : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{service.name}</h3>
                            <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                            <p className="mt-2 text-sm text-gray-400">{service.duration} menit</p>
                          </div>
                          <span className="text-lg font-bold text-primary-600">
                            {formatPrice(service.price)}
                          </span>
                        </div>
                        {(service.addons?.length ?? 0) > 0 && (
                          <div className="mt-3 border-t border-gray-100 pt-3">
                            <p className="text-xs font-medium text-gray-500">Add-on tersedia:</p>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {service.addons.map((addon) => (
                                <span
                                  key={addon.id}
                                  className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
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
                  <h2 className="text-xl font-semibold text-gray-900">Pilih Staf</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {filteredStaff.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleStaffSelect(s)}
                        className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                          selectedStaff?.id === s.id
                            ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                            : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-primary-100">
                          {s.avatarUrl ? (
                            <img src={s.avatarUrl} alt={s.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm font-bold text-primary-600">
                              {s.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{s.name}</h4>
                          {s.rating > 0 && (
                            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                              <svg className="h-3 w-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span>{s.rating.toFixed(1)} ({s.reviewCount})</span>
                            </div>
                          )}
                          <p className="mt-1 text-[13px] text-gray-500 line-clamp-1">{s.bio}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => { setSelectedStaff(null); setStep('service'); }}
                    className="mt-4 text-sm text-primary-600 hover:underline"
                  >
                    &larr; Kembali ke layanan
                  </button>
                </div>
              )}

              {/* Step: Slot Selection */}
              {step === 'slot' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Pilih Jadwal</h2>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Tanggal</label>
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
                      className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
                      <h3 className="text-sm font-medium text-gray-700">Tambah Add-on</h3>
                      <div className="mt-2 space-y-2">
                        {selectedService.addons.map((addon) => (
                          <label
                            key={addon.id}
                            className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                              selectedAddons.find((a) => a.id === addon.id)
                                ? 'border-primary-300 bg-primary-50'
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={!!selectedAddons.find((a) => a.id === addon.id)}
                                onChange={() => handleAddonToggle(addon)}
                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <div>
                                <span className="text-sm font-medium text-gray-900">{addon.name}</span>
                                <span className="ml-2 text-xs text-gray-500">+{addon.duration} menit</span>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-primary-600">{formatPrice(addon.price)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => { setSelectedSlot(null); setStep('staff'); }}
                    className="mt-4 text-sm text-primary-600 hover:underline"
                  >
                    &larr; Kembali ke pemilihan staf
                  </button>
                </div>
              )}

              {/* Step: Contact Info */}
              {step === 'contact' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Informasi Kontak</h2>
                  {isAuthenticated ? (
                    <p className="mt-1 text-sm text-green-600">
                      Otomatis terisi dari profil — hanya catatan dapat diedit
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      Isi data diri Anda untuk menyelesaikan booking
                    </p>
                  )}
                  <form
                    onSubmit={contactForm.handleSubmit(handleContactSubmit)}
                    className="mt-6 space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                      <input
                        {...contactForm.register('customerName')}
                        readOnly={isAuthenticated}
                        disabled={isAuthenticated}
                        className={`mt-1 block w-full rounded-lg border px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ${isAuthenticated ? 'border-gray-200 bg-gray-100 text-gray-600' : 'border-gray-300 bg-white'}`}
                        placeholder="Masukkan nama Anda"
                      />
                      {contactForm.formState.errors.customerName && (
                        <p className="mt-1 text-sm text-red-600">
                          {contactForm.formState.errors.customerName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        {...contactForm.register('customerEmail')}
                        type="email"
                        readOnly={isAuthenticated}
                        disabled={isAuthenticated}
                        className={`mt-1 block w-full rounded-lg border px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ${isAuthenticated ? 'border-gray-200 bg-gray-100 text-gray-600' : 'border-gray-300 bg-white'}`}
                        placeholder="email@contoh.com"
                      />
                      {contactForm.formState.errors.customerEmail && (
                        <p className="mt-1 text-sm text-red-600">
                          {contactForm.formState.errors.customerEmail.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                      <input
                        {...contactForm.register('customerPhone')}
                        type="tel"
                        readOnly={isAuthenticated}
                        disabled={isAuthenticated}
                        className={`mt-1 block w-full rounded-lg border px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ${isAuthenticated ? 'border-gray-200 bg-gray-100 text-gray-600' : 'border-gray-300 bg-white'}`}
                        placeholder="08xxxxxxxxxx"
                      />
                      {contactForm.formState.errors.customerPhone && (
                        <p className="mt-1 text-sm text-red-600">
                          {contactForm.formState.errors.customerPhone.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Catatan <span className="text-gray-400">(opsional)</span>
                      </label>
                      <textarea
                        {...contactForm.register('notes')}
                        rows={3}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="Permintaan khusus, alergi, dll."
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep('slot')}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Kembali
                      </button>
                      <button
                        type="submit"
                        className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                      >
                        Lanjutkan
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step: Confirm */}
              {step === 'confirm' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Konfirmasi Booking</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Pastikan semua data sudah benar sebelum melanjutkan
                  </p>
                  <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Layanan</span>
                        <span className="font-medium text-gray-900">{selectedService?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Durasi</span>
                        <span className="text-gray-700">{selectedService?.duration} menit</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Staf</span>
                        <span className="text-gray-700">{selectedStaff?.name}</span>
                      </div>
                      {selectedSlot && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Waktu</span>
                          <span className="text-gray-700">
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
                      <div className="flex justify-between">
                        <span className="text-gray-500">Nama</span>
                        <span className="text-gray-700">{contactForm.getValues('customerName')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email</span>
                        <span className="text-gray-700">{contactForm.getValues('customerEmail')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Telepon</span>
                        <span className="text-gray-700">{contactForm.getValues('customerPhone')}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => setStep('contact')}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => setStep('contact')}
                      className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      &larr; Kembali
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={createBooking.isPending}
                      className="flex-1 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                    >
                      {createBooking.isPending ? 'Memproses...' : 'Konfirmasi Booking'}
                    </button>
                  </div>
                  {createBooking.isError && (
                    <p className="mt-3 text-sm text-red-600">
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
