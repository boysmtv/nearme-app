import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';
import { publicApi, mediaApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Review } from '../lib/types';

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-[18px] w-[18px] ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
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
          className="p-0.5"
        >
          <svg
            className={`h-7 w-7 ${star <= (hover || value) ? 'text-yellow-400' : 'text-gray-200'} transition-colors`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-500">{value ? `${value}/5` : 'Pilih rating'}</span>
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
  const [photoIds, setPhotoIds] = useState<string[]>([]);

  const uploadMut = useMutation({
    mutationFn: async (file: File) => {
      // upload as review photo with dummy owner, will be reassigned to reviewId server-side after creation
      // For now upload with ownerType review and ownerId bookingId (will be moved to review id)
      const res = await mediaApi.upload(file, 'review', bookingId.trim() || providerId);
      return (res as unknown as { data: { id: string } }).data.id;
    },
    onSuccess: (id) => {
      if (photoIds.length < 8) setPhotoIds((p) => [...p, id]);
    },
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (!bookingId.trim()) throw new Error('Booking ID wajib diisi');
      if (rating < 1) throw new Error('Rating wajib diisi');
      if (!body.trim()) throw new Error('Komentar wajib diisi');
      if (photoIds.length > 8) throw new Error('Maksimal 8 foto');
      return publicApi.reviews.create(bookingId.trim(), { rating, title: title.trim() || undefined, body: body.trim(), photoIds });
    },
    onSuccess: () => {
      setRating(0); setTitle(''); setBody(''); setBookingId(''); setPhotoIds([]);
      queryClient.invalidateQueries({ queryKey: ['reviews', providerId] });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-sm text-gray-600">Masuk untuk menulis ulasan setelah booking selesai.</p>
        <Link to="/login" className="mt-2 inline-block text-sm font-medium text-primary-600 hover:underline">Masuk</Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h4 className="font-semibold text-gray-900">Tulis Ulasan</h4>
      <p className="mt-1 text-[13px] text-gray-500">Ulasan memerlukan Booking ID yang sudah COMPLETED untuk provider ini. Maks 8 foto (jpeg/png/webp).</p>
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Booking ID <span className="text-red-500">*</span></label>
          <input
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            placeholder="Contoh: 3fa85f64-5717-4562-b3fc-2c963f66afa6"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rating <span className="text-red-500">*</span></label>
          <div className="mt-1"><StarInput value={rating} onChange={setRating} /></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Judul <span className="text-gray-400">(opsional)</span></label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ringkasan pengalaman Anda"
            maxLength={120}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Komentar <span className="text-red-500">*</span></label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Bagaimana pengalaman Anda?"
            maxLength={2000}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <p className="mt-1 text-xs text-gray-400">{body.length}/2000</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Foto Ulasan (maks 8)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              files.slice(0, 8 - photoIds.length).forEach((f) => {
                if (f.size > 10 * 1024 * 1024) { alert('File too large max 10MB'); return; }
                uploadMut.mutate(f);
              });
              e.target.value = '';
            }}
            className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
          />
          {uploadMut.isPending && <p className="mt-1 text-xs text-primary-600">Uploading...</p>}
          {photoIds.length > 0 && <p className="mt-1 text-xs text-gray-500">{photoIds.length}/8 foto terupload</p>}
          {uploadMut.isError && <p className="mt-1 text-xs text-red-600">{(uploadMut.error as Error).message}</p>}
        </div>
        {mutation.isError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {(mutation.error as Error).message}
          </div>
        )}
        {mutation.isSuccess && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">Ulasan berhasil dikirim. Terima kasih!</div>
        )}
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Mengirim...' : 'Kirim Ulasan'}
        </button>
        <p className="text-xs text-gray-400 text-center">Ulasan akan dikirim bersama rating dan komentar Anda</p>
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

  const { data: galleryRes } = useQuery({
    queryKey: ['gallery', provider?.id],
    queryFn: () => publicApi.media.publicProviderGallery(provider!.id),
    enabled: !!provider?.id,
  });

  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportMsg, setReportMsg] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
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

  const favMut = useMutation({
    mutationFn: async ({ staffId, favorited }: { staffId: string; favorited: boolean }) => {
      if (favorited) return publicApi.favorites.remove(staffId);
      return publicApi.favorites.add(staffId);
    },
    onSuccess: (_data, vars) => {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (vars.favorited) next.delete(vars.staffId);
        else next.add(vars.staffId);
        return next;
      });
    },
  });

  const services = servicesRes?.data ?? [];
  const staffList = staffRes?.data ?? [];
  const gallery = (galleryRes as unknown as { data: unknown[]; })?.data ?? (galleryRes as unknown as { data: { data: unknown[] } })?.data ?? [];
  // normalize gallery to array
  const galleryItems: { id: string; url: string; fileName?: string }[] = Array.isArray(gallery) ? (gallery as never[]) : [];
  const reviews = (reviewsRes as unknown as { data?: { data: Review[] } })?.data?.data ?? (reviewsRes as unknown as { data?: Review[] })?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-6">
              <div className="h-64 rounded-xl bg-gray-200" />
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
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="mx-auto max-w-screen-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold text-gray-900">Provider tidak ditemukan</h2>
            <Link to="/search" className="mt-4 inline-block text-primary-600 hover:underline">
              Kembali ke pencarian
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        {/* Cover */}
        <div className="relative h-48 bg-gradient-to-r from-primary-600 to-primary-800 sm:h-64">
          {provider.coverUrl && (
            <img
              src={provider.coverUrl}
              alt={provider.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="relative -mt-16 flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg sm:h-32 sm:w-32">
              {provider.logoUrl ? (
                <img src={provider.logoUrl} alt={provider.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-primary-100 text-2xl font-bold text-primary-600 sm:text-3xl">
                  {provider.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{provider.name}</h1>
                <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
                  {provider.category}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {provider.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <StarRating rating={provider.rating} />
                    <span className="font-medium text-gray-700">{provider.rating.toFixed(1)}</span>
                    <span>({provider.reviewCount} ulasan)</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
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
              className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
            >
              Booking Sekarang
            </Link>
          </div>

          {/* Description */}
          <div className="mt-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <p className="text-gray-600 leading-relaxed">{provider.description}</p>
          </div>

          {/* Gallery Grid 3 cols */}
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="font-semibold text-gray-900">Galeri</h3>
            {galleryItems.length > 0 ? (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {galleryItems.map((item) => (
                  <div key={item.id} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                    <img src={item.url} alt={item.fileName || 'gallery'} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-500">Belum ada foto galeri. Provider dapat upload via dashboard Media.</p>
            )}
            <p className="mt-2 text-xs text-gray-400">{galleryItems.length} foto dalam galeri</p>
          </div>

          {/* Operating Hours */}
          {provider.openingHours && provider.openingHours.length > 0 && (
            <div className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h3 className="font-semibold text-gray-900">Jam Operasional</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {provider.openingHours.map((hour) => (
                  <div key={hour.dayOfWeek} className="flex justify-between text-sm">
                    <span className={hour.isClosed ? 'text-gray-400' : 'text-gray-700'}>
                      {dayNames[hour.dayOfWeek]}
                    </span>
                    <span className={hour.isClosed ? 'text-red-500' : 'text-gray-600'}>
                      {hour.isClosed ? 'Tutup' : `${hour.open} - ${hour.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mt-8 border-b border-gray-200">
            <nav className="flex gap-8">
              {([
                { key: 'services', label: `Layanan (${services.length})` },
                { key: 'staff', label: `Staf (${staffList.length})` },
                { key: 'reviews', label: `Ulasan (${reviews.length})` },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
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
                  <p className="text-center text-gray-500">Belum ada layanan tersedia</p>
                )}
              </div>
            )}

            {activeTab === 'staff' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {staffList.length > 0 ? (
                  staffList.map((s) => (
                    <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-full bg-primary-100">
                          {s.avatarUrl ? (
                            <img src={s.avatarUrl} alt={s.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm font-bold text-primary-600">
                              {s.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900">{s.name}</h4>
                          {s.rating > 0 && (
                            <div className="flex items-center gap-1 text-[13px] text-gray-500">
                              <StarRating rating={s.rating} />
                              <span>{s.rating.toFixed(1)}</span>
                            </div>
                          )}
                          {s.title && <p className="text-xs text-gray-500">{s.title}</p>}
                        </div>
                        {isAuthenticated && (
                          <button
                            onClick={() => favMut.mutate({ staffId: s.id, favorited: favorites.has(s.id) })}
                            disabled={favMut.isPending}
                            className={`rounded-full p-2 ${favorites.has(s.id) ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400 hover:text-pink-500'}`}
                            aria-label="Favorite"
                            title={favorites.has(s.id) ? 'Hapus favorit' : 'Favoritkan'}
                          >
                            <svg className="h-4 w-4" fill={favorites.has(s.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {s.specialties?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {s.specialties.map((spec) => (
                            <span
                              key={spec}
                              className="rounded-full bg-gray-100 px-2 py-0.5 text-sm text-gray-600"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* portfolio carousel */}
                      {s.portfolio && s.portfolio.length > 0 ? (
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                          {s.portfolio.slice(0, 5).map((p) => (
                            <img key={p.id} src={p.url} alt={p.fileName} className="h-16 w-16 flex-shrink-0 rounded-lg object-cover" />
                          ))}
                          {s.portfolio.length > 5 && (
                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-600">+{s.portfolio.length - 5}</div>
                          )}
                        </div>
                      ) : (
                        <p className="mt-3 text-xs text-gray-400">Belum ada portfolio</p>
                      )}
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">{s.bio}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">Belum ada staf terdaftar</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <ReviewForm providerId={provider.id} />
                {reportMsg && (
                  <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">{reportMsg}</div>
                )}
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review: Review) => (
                      <div key={review.id} className="rounded-xl border border-gray-200 bg-white p-5">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100 flex-shrink-0">
                            {review.customerAvatar ? (
                              <img
                                src={review.customerAvatar}
                                alt={review.customerName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm font-bold text-gray-500">
                                {review.customerName?.[0] ?? '?'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                  {review.customerName}
                                  {review.verifiedBooking && (
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                                      ✓ Verified booking
                                    </span>
                                  )}
                                </h4>
                                <p className="text-xs text-gray-500">{review.serviceName}</p>
                              </div>
                              <span className="text-xs text-gray-400">
                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString('id-ID') : ''}
                              </span>
                            </div>
                            <div className="mt-1">
                              <StarRating rating={review.rating} />
                            </div>
                            {review.title && <p className="mt-1 text-sm font-medium text-gray-800">{review.title}</p>}
                            <p className="mt-1 text-sm text-gray-600 break-words">{review.comment ?? review.body ?? ''}</p>
                            {review.photos && review.photos.length > 0 && (
                              <div className="mt-3 grid grid-cols-4 gap-2">
                                {review.photos.slice(0, 8).map((ph) => (
                                  <img key={ph.id} src={ph.url} alt={ph.fileName || 'review'} className="h-20 w-full rounded-lg object-cover" />
                                ))}
                              </div>
                            )}
                            <div className="mt-3 flex items-center gap-3">
                              <button
                                onClick={() => reportMutation.mutate(review.id)}
                                disabled={reportingId === review.id}
                                className="text-xs text-gray-400 hover:text-red-600 disabled:opacity-50"
                              >
                                {reportingId === review.id ? 'Melaporkan...' : 'Laporkan'}
                              </button>
                              
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">Belum ada ulasan</p>
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
