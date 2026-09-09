import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, publicApi } from '../../lib/api';
import CustomerLayout from '../../components/CustomerLayout';

const ticketSchema = z.object({
  subject: z.string().min(5, 'Subjek minimal 5 karakter'),
  category: z.enum(['Umum', 'Teknis', 'Pembayaran', 'Akun']),
  message: z.string().min(10, 'Pesan minimal 10 karakter'),
  attachment: z.any().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

const FAQ_CATEGORIES = ['Semua', 'Umum', 'Booking', 'Pembayaran', 'Akun', 'Teknis'] as const;

const quickLinks = [
  { label: 'FAQ', desc: 'Pertanyaan yang sering ditanyakan', href: '#faq', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Kebijakan', desc: 'Ketentuan & aturan platform', href: '#policies', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { label: 'Hubungi Kami', desc: 'Kirim pesan ke tim support', href: '#contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { label: 'Chat', desc: 'Mulai chat dengan support', href: '/chats', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
] as const;

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 ${className ?? ''}`} />;
}

function FaqSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <SkeletonBlock key={i} className="h-16" />
      ))}
    </div>
  );
}

export default function SupportPage() {
  const [faqSearch, setFaqSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const { data: faqsData, isLoading: faqsLoading } = useQuery({
    queryKey: ['faqs', 'public'],
    queryFn: () => publicApi.faqs.listPublic(),
  });

  const { data: policiesData, isLoading: policiesLoading } = useQuery({
    queryKey: ['policies', 'public'],
    queryFn: () => publicApi.policies.listPublic(),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { subject: '', category: 'Umum', message: '' },
  });

  const faqs = faqsData?.data ?? [];
  const policies = policiesData?.data ?? [];

  const filteredFaqs = useMemo(() => {
    let result = faqs;
    if (activeCategory !== 'Semua') {
      result = result.filter((f: any) => f.category === activeCategory);
    }
    if (faqSearch.trim()) {
      const q = faqSearch.toLowerCase();
      result = result.filter(
        (f: any) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q),
      );
    }
    return result;
  }, [faqs, activeCategory, faqSearch]);

  const onSubmit = async (data: TicketFormData) => {
    setSubmitError(null);
    try {
      await api.post('/support/cases', { subject: data.subject, message: data.message, category: data.category });
      setSubmitSuccess(true);
      reset();
      setFileName('');
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setSubmitError('Silakan login terlebih dahulu untuk mengirim pesan.');
      } else {
        setSubmitError(err?.response?.data?.message || 'Gagal mengirim pesan. Silakan coba lagi.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file?.name ?? '');
  };

  return (
    <CustomerLayout>
      <div className="max-w-screen-2xl mx-auto space-y-10 pb-12">
        {/* Header */}
        <section className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 px-8 py-10 text-white">
          <h1 className="text-3xl font-bold">Bantuan & Dukungan</h1>
          <p className="mt-2 text-primary-100 max-w-xl">
            Temukan jawaban atas pertanyaan Anda atau hubungi tim kami.
          </p>
          <div className="mt-6 relative max-w-lg">
            <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari pertanyaan, topik, atau kata kunci..."
              value={faqSearch}
              onChange={(e) => {
                setFaqSearch(e.target.value);
                if (e.target.value) {
                  document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full rounded-xl border border-primary-300/40 bg-white/15 pl-11 pr-4 py-3 text-sm text-white placeholder-primary-200 backdrop-blur-sm focus:border-white focus:ring-1 focus:ring-white outline-none transition-colors"
            />
          </div>
        </section>

        {/* Quick Links */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const isExternal = link.href.startsWith('/');
            const Wrapper: any = isExternal ? Link : 'a';
            return (
              <Wrapper
                key={link.label}
                href={isExternal ? undefined : link.href}
                to={isExternal ? link.href : undefined}
                className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-primary-300 hover:shadow-md"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{link.label}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{link.desc}</p>
                </div>
              </Wrapper>
            );
          })}
        </section>

        {/* FAQ Section */}
        <section id="faq" className="scroll-mt-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">Pertanyaan Umum</h2>
            {faqs.length > 0 && (
              <span className="text-sm text-gray-500">{filteredFaqs.length} pertanyaan</span>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {faqsLoading ? (
            <FaqSkeleton />
          ) : filteredFaqs.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="mt-3 text-gray-500">Tidak ada pertanyaan yang cocok.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFaqs.map((faq: any) => (
                <div
                  key={faq.id}
                  className="rounded-xl border border-gray-200 bg-white overflow-hidden transition-all hover:border-gray-300"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      {faq.category && (
                        <span className="inline-block mb-1 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700">
                          {faq.category}
                        </span>
                      )}
                      <p className="font-medium text-gray-900">{faq.question}</p>
                    </div>
                    <svg
                      className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                        expandedFaq === faq.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      expandedFaq === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-5 pb-4 pt-0 text-sm leading-relaxed text-gray-600 border-t border-gray-100">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Policies Section */}
        <section id="policies" className="scroll-mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Kebijakan</h2>
          {policiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <SkeletonBlock key={i} className="h-40" />
              ))}
            </div>
          ) : policies.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-3 text-gray-500">Belum ada kebijakan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {policies.map((p: any) => (
                <div key={p.id} className="rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                      {p.type || 'Kebijakan'}
                    </span>
                    {p.version && (
                      <span className="text-xs text-gray-400">v{p.version}</span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900">{p.title}</p>
                  <p className="mt-1.5 text-sm text-gray-600 leading-relaxed line-clamp-3">{p.body}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Contact Form */}
        <section id="contact" className="scroll-mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Hubungi Kami</h2>

          {submitSuccess ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="mt-4 text-lg font-semibold text-green-800">Pesan berhasil dikirim!</p>
              <p className="mt-1 text-sm text-green-700">Tim kami akan merespon dalam 24 jam.</p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="mt-5 rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
              >
                Kirim Pesan Baru
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Subjek
                  </label>
                  <input
                    id="subject"
                    {...register('subject')}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
                    placeholder="Perihal pesan Anda"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Kategori
                  </label>
                  <select
                    id="category"
                    {...register('category')}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Teknis">Teknis</option>
                    <option value="Pembayaran">Pembayaran</option>
                    <option value="Akun">Akun</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Pesan
                </label>
                <textarea
                  id="message"
                  {...register('message')}
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none transition-colors"
                  placeholder="Jelaskan masalah atau pertanyaan Anda secara detail..."
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Lampiran (opsional)
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-primary-400 hover:bg-primary-50/30 transition-colors">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span>{fileName || 'Pilih file untuk dilampirkan'}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                    {...register('attachment')}
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {submitError && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>{submitError}</span>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Kirim Pesan
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </CustomerLayout>
  );
}
