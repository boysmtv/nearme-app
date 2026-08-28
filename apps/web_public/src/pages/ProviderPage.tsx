import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';
import { publicApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Review } from '../lib/types';

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-[18px] w-[18px] ${star <= rating ? 'text-amber-400' : 'text-[#E8E8FF]'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          aria-label={`Rate ${star}`}
          className="p-0.5 hover:scale-110 transition-transform"
        >
          <svg
            className={`h-7 w-7 ${star <= (hover || value) ? 'text-amber-400 drop-shadow-sm' : 'text-[#E8E8FF]'} transition-colors`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      <span className="ml-2 rounded-full bg-[#fff4d6] px-2.5 py-1 text-xs font-bold text-amber-700">{value ? `${value}/5 ⭐` : 'Pilih rating'}</span>
    </div>
  );
}

function ReviewForm({ providerId }: { providerId: string }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [bookingId, setBookingId] = useState('');

  const mutation = useMutation({
    mutationFn: () => {
      if (!bookingId.trim()) throw new Error('Booking ID wajib diisi');
      if (rating < 1) throw new Error('Rating wajib diisi');
      if (!body.trim()) throw new Error('Komentar wajib diisi');
      return publicApi.reviews.create(bookingId.trim(), { rating, title: title.trim() || undefined, body: body.trim() });
    },
    onSuccess: () => {
      setRating(0); setTitle(''); setBody(''); setBookingId('');
      queryClient.invalidateQueries({ queryKey: ['reviews', providerId] });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-dashed border-[#d0d0ff] bg-gradient-to-br from-[#FAF9FF] to-white p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#e8e8ff] text-[#8B8CFF]">✦</div>
        <p className="mt-2 text-sm font-medium text-gray-700">Masuk untuk menulis ulasan setelah booking selesai.</p>
        <Link to="/login" className="mt-3 inline-flex rounded-full bg-gradient-to-r from-[#8B8CFF] to-[#A5A6FF] px-5 py-2 text-sm font-bold text-white shadow">Masuk sekarang</Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E8E8FF] bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#fff4d6] to-[#ffe8ec] text-amber-600">⭐</span>
        <h4 className="font-black text-gray-900">Tulis Ulasan</h4>
        <span className="ml-auto rounded-full bg-[#e8f2ff] px-2.5 py-1 text-xs font-bold text-[#5a7ab3]">✦ Berbagi pengalaman</span>
      </div>
      <p className="mt-1 text-xs text-gray-500">Ulasan memerlukan Booking ID yang sudah COMPLETED untuk provider ini.</p>
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Booking ID <span className="text-rose-500">*</span></label>
          <input
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            placeholder="Contoh: 3fa85f64-5717-4562-b3fc-2c963f66afa6"
            className="mt-1.5 block w-full rounded-xl border border-[#E8E8FF] bg-[#FAF9FF] px-3 py-2.5 text-sm focus:border-[#8B8CFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e8e8ff]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Rating <span className="text-rose-500">*</span></label>
          <div className="mt-1.5"><StarInput value={rating} onChange={setRating} /></div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Judul <span className="text-gray-400">(opsional)</span></label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ringkasan pengalaman Anda"
            maxLength={120}
            className="mt-1.5 block w-full rounded-xl border border-[#E8E8FF] bg-white px-3 py-2.5 text-sm focus:border-[#8B8CFF] focus:outline-none focus:ring-2 focus:ring-[#e8e8ff]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Komentar <span className="text-rose-500">*</span></label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Bagaimana pengalaman Anda? Ceritakan dengan warna ✨"
            maxLength={2000}
            className="mt-1.5 block w-full rounded-xl border border-[#E8E8FF] bg-white px-3 py-2.5 text-sm focus:border-[#8B8CFF] focus:outline-none focus:ring-2 focus:ring-[#e8e8ff]"
          />
          <p className="mt-1 text-xs text-gray-400">{body.length}/2000</p>
        </div>
        {mutation.isError && (
          <div className="rounded-xl bg-[#ffe8ec] p-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
            {(mutation.error as Error).message}
          </div>
        )}
        {mutation.isSuccess && (
          <div className="rounded-xl bg-[#e6f7ee] p-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">Ulasan berhasil dikirim. Terima kasih! 🎉</div>
        )}
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="w-full rounded-full bg-gradient-to-r from-[#8B8CFF] to-[#A5A6FF] px-4 py-3 text-sm font-black text-white shadow-md hover:shadow-lg disabled:opacity-50 transition"
        >
          {mutation.isPending ? '⏳ Mengirim...' : '✦ Kirim Ulasan'}
        </button>
      </div>
    </div>
  );
}

export default function ProviderPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<'services' | 'staff' | 'reviews'>('services');

  const { data: providerRes, isLoading } = useQuery({
    queryKey: ['provider', slug],
    queryFn: () => publicApi.providers.getBySlug(slug!),
    enabled: !!slug,
  });

  const provider = providerRes?.data;

  const { data: servicesRes } = useQuery({
    queryKey: ['services', provider?.id],
    queryFn: () => publicApi.services.listByProvider(provider!.id),
    enabled: !!provider?.id,
  });

  const { data: staffRes } = useQuery({
    queryKey: ['staff', provider?.id],
    queryFn: () => publicApi.staff.listByProvider(provider!.id),
    enabled: !!provider?.id,
  });

  const { data: reviewsRes, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', provider?.id],
    queryFn: () => publicApi.reviews.listByProvider(provider!.id),
    enabled: !!provider?.id && activeTab === 'reviews',
  });

  const queryClient = useQueryClient();
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportMsg, setReportMsg] = useState<string | null>(null);
  const reportMutation = useMutation({
    mutationFn: (reviewId: string) => publicApi.reviews.report(reviewId),
    onMutate: (id) => { setReportingId(id); setReportMsg(null); },
    onSuccess: () => {
      setReportMsg('Laporan terkirim, review akan dimoderasi.');
      queryClient.invalidateQueries({ queryKey: ['reviews', provider?.id] });
      refetchReviews();
    },
    onError: (e) => setReportMsg(e instanceof Error ? e.message : 'Gagal melaporkan'),
    onSettled: () => setReportingId(null),
  });

  const services = servicesRes?.data ?? [];
  const staffList = staffRes?.data ?? [];
  const reviews = (reviewsRes as unknown as { data?: { data: Review[] } })?.data?.data ?? (reviewsRes as unknown as { data?: Review[] })?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF9FF]">
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-6">
              <div className="h-64 rounded-2xl bg-[#e8e8ff]" />
              <div className="h-8 w-1/3 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-100" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF9FF]">
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ffe8ec] text-rose-500 text-2xl">?</div>
            <h2 className="mt-4 text-xl font-black text-gray-900">Provider tidak ditemukan</h2>
            <Link to="/search" className="mt-4 inline-flex rounded-full bg-[#8B8CFF] px-5 py-2.5 text-sm font-bold text-white">
              Kembali ke pencarian
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9FF]">
      <Header />

      <main className="flex-1">
        {/* Cover */}
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B8CFF] via-[#A5A6FF] to-[#FF8E9E]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {provider.coverUrl && (
            <img
              src={provider.coverUrl}
              alt={provider.name}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#6a6acc] shadow backdrop-blur">✦ Soft & aesthetic</span>
            <span className="rounded-full bg-[#fff4d6] px-3 py-1 text-xs font-bold text-amber-700 shadow">Verified ⭐</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="relative -mt-12 flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl sm:h-32 sm:w-32">
              {provider.logoUrl ? (
                <img src={provider.logoUrl} alt={provider.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#e8e8ff] to-[#f0e8ff] text-2xl font-black text-[#6a6acc] sm:text-3xl">
                  {provider.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">{provider.name}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e8e8ff] px-3 py-1 text-sm font-bold text-[#6a6acc] ring-1 ring-[#d0d0ff]">
                  <span className="h-2 w-2 rounded-full bg-[#8B8CFF]" /> {provider.category}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                {provider.rating > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-[#E8E8FF]">
                    <StarRating rating={provider.rating} />
                    <span className="font-bold text-gray-700">{provider.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({provider.reviewCount} ulasan)</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f2ff] px-3 py-1 text-[#5a7ab3] font-medium">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {provider.location || provider.address}
                </span>
              </div>
            </div>
            <Link
              to={`/booking/${provider.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8B8CFF] to-[#FF8E9E] px-7 py-3.5 font-black text-white shadow-lg shadow-[#8B8CFF]/20 transition hover:shadow-xl hover:scale-[1.02]"
            >
              ✦ Booking Sekarang
            </Link>
          </div>

          {/* Description */}
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E8E8FF]">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-8 w-8 rounded-xl bg-[#FAF9FF] flex items-center justify-center text-[#8B8CFF] ring-1 ring-[#E8E8FF]">✦</span>
              <h3 className="font-bold text-gray-900">Tentang</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">{provider.description}</p>
          </div>

          {/* Operating Hours */}
          {provider.openingHours && provider.openingHours.length > 0 && (
            <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E8E8FF]">
              <h3 className="font-black text-gray-900 flex items-center gap-2"><span className="h-8 w-8 rounded-xl bg-[#e6f7ee] flex items-center justify-center text-emerald-600"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span> Jam Operasional</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {provider.openingHours.map((hour) => (
                  <div key={hour.dayOfWeek} className="flex justify-between rounded-xl bg-[#FAF9FF] px-3 py-2 text-sm ring-1 ring-[#E8E8FF]/60">
                    <span className={hour.isClosed ? 'text-gray-400' : 'font-semibold text-gray-700'}>
                      {dayNames[hour.dayOfWeek]}
                    </span>
                    <span className={hour.isClosed ? 'rounded-full bg-[#ffe8ec] px-2 py-0.5 text-xs font-bold text-rose-600' : 'rounded-full bg-[#e6f7ee] px-2 py-0.5 text-xs font-bold text-emerald-700'}>
                      {hour.isClosed ? 'Tutup' : `${hour.open} - ${hour.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mt-8">
            <nav className="flex gap-2 rounded-full bg-white p-1.5 shadow-sm ring-1 ring-[#E8E8FF] w-fit">
              {([
                { key: 'services', label: `Layanan (${services.length})`, icon: '✦' },
                { key: 'staff', label: `Staf (${staffList.length})`, icon: '👥' },
                { key: 'reviews', label: `Ulasan (${reviews.length})`, icon: '⭐' },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full px-5 py-2 text-sm font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-[#8B8CFF] to-[#A5A6FF] text-white shadow'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-[#FAF9FF]'
                  }`}
                >
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {activeTab === 'services' && (
              <div className="space-y-4">
                {services.length > 0 ? (
                  services.map((service) => (
                    <ServiceCard key={service.id} service={service} providerSlug={slug!} providerId={provider?.id} />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#E8E8FF] bg-white p-12 text-center">
                    <p className="text-gray-500">Belum ada layanan tersedia</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'staff' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {staffList.length > 0 ? (
                  staffList.map((s) => (
                    <div key={s.id} className="rounded-2xl border border-[#E8E8FF] bg-white p-5 shadow-sm hover:shadow-md transition">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-2xl bg-gradient-to-br from-[#e8e8ff] to-[#ffe8ec] ring-1 ring-[#E8E8FF]">
                          {s.avatarUrl ? (
                            <img src={s.avatarUrl} alt={s.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm font-black text-[#6a6acc]">
                              {s.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{s.name}</h4>
                          {s.rating > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <StarRating rating={s.rating} />
                              <span className="font-medium">{s.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {s.specialties?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {s.specialties.map((spec) => (
                            <span
                              key={spec}
                              className="rounded-full bg-[#e8f2ff] px-2.5 py-1 text-xs font-semibold text-[#5a7ab3]"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="mt-3 text-sm text-gray-500 line-clamp-2 leading-relaxed">{s.bio}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full rounded-2xl border border-dashed border-[#E8E8FF] bg-white p-12 text-center">
                    <p className="text-gray-500">Belum ada staf terdaftar</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <ReviewForm providerId={provider.id} />
                {reportMsg && (
                  <div className="rounded-xl bg-[#e8f2ff] p-3 text-sm font-medium text-[#5a7ab3] ring-1 ring-[#dbe9ff]">{reportMsg}</div>
                )}
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review: Review) => (
                      <div key={review.id} className="rounded-2xl border border-[#E8E8FF] bg-white p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-[#e8e8ff] to-[#ffe8ec] flex-shrink-0 ring-1 ring-[#E8E8FF]">
                            {review.customerAvatar ? (
                              <img
                                src={review.customerAvatar}
                                alt={review.customerName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm font-black text-[#6a6acc]">
                                {review.customerName?.[0] ?? '?'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-bold text-gray-900">{review.customerName}</h4>
                                <p className="text-xs text-gray-500">{review.serviceName}</p>
                              </div>
                              <span className="rounded-full bg-[#FAF9FF] px-2 py-1 text-xs font-medium text-gray-500 ring-1 ring-[#E8E8FF]">
                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString('id-ID') : ''}
                              </span>
                            </div>
                            <div className="mt-1">
                              <StarRating rating={review.rating} />
                            </div>
                            {review.title && <p className="mt-1 text-sm font-bold text-gray-800">{review.title}</p>}
                            <p className="mt-1 text-sm text-gray-600 break-words leading-relaxed">{review.comment ?? review.body ?? ''}</p>
                            <div className="mt-3 flex items-center gap-3">
                              <button
                                onClick={() => reportMutation.mutate(review.id)}
                                disabled={reportingId === review.id}
                                className="rounded-full bg-[#FAF9FF] px-3 py-1 text-xs font-medium text-gray-500 ring-1 ring-[#E8E8FF] hover:text-rose-600 disabled:opacity-50"
                              >
                                {reportingId === review.id ? 'Melaporkan...' : '🚩 Laporkan'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#E8E8FF] bg-white p-12 text-center">
                      <p className="text-gray-500">Belum ada ulasan — jadi yang pertama memberi warna ✨</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
