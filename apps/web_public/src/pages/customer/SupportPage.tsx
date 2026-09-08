import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, publicApi } from '../../lib/api';

const ticketSchema = z.object({
  subject: z.string().min(5, 'Subjek minimal 5 karakter'),
  category: z.enum(['Umum', 'Teknis', 'Pembayaran', 'Akun']),
  message: z.string().min(10, 'Pesan minimal 10 karakter'),
});

type TicketFormData = z.infer<typeof ticketSchema>;

export default function SupportPage() {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: faqsData, isLoading: faqsLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => publicApi.faqs.listPublic(),
  });

  const { data: policiesData, isLoading: policiesLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: () => publicApi.policies.listPublic(),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { subject: '', category: 'Umum', message: '' },
  });

  const onSubmit = async (data: TicketFormData) => {
    setSubmitError(null);
    try {
      await api.post('/support/cases', { subject: data.subject, message: data.message, category: data.category });
      setSubmitSuccess(true);
      reset();
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setSubmitError('Silakan login terlebih dahulu untuk mengirim pesan.');
      } else {
        setSubmitError(err?.response?.data?.message || 'Gagal mengirim pesan. Silakan coba lagi.');
      }
    }
  };

  const faqs = faqsData?.data ?? [];
  const policies = policiesData?.data ?? [];
  const isLoading = faqsLoading || policiesLoading;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Bantuan & Dukungan</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <>
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Pertanyaan Umum</h2>
            <div className="space-y-2">
              {faqs.map((faq: any) => (
                <div key={faq.id} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                    <svg
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${expandedFaq === faq.id ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed">{faq.answer}</div>
                  )}
                </div>
              ))}
              {faqs.length === 0 && <p className="text-gray-500">Belum ada FAQ</p>}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Kebijakan</h2>
            <div className="space-y-3">
              {policies.map((p: any) => (
                <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                      {p.type || 'Kebijakan'}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900">{p.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{p.content || p.body}</p>
                </div>
              ))}
              {policies.length === 0 && <p className="text-gray-500">Belum ada kebijakan</p>}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Hubungi Kami</h2>
            {submitSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <svg className="w-10 h-10 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-800 font-medium">Pesan terkirim! Tim kami akan merespon dalam 24 jam.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6 space-y-5">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subjek</label>
                  <input
                    id="subject"
                    {...register('subject')}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                    placeholder="Masukkan subjek pesan"
                  />
                  {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    id="category"
                    {...register('category')}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Teknis">Teknis</option>
                    <option value="Pembayaran">Pembayaran</option>
                    <option value="Akun">Akun</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
                  <textarea
                    id="message"
                    {...register('message')}
                    rows={5}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none"
                    placeholder="Jelaskan masalah atau pertanyaan Anda..."
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
                </div>

                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{submitError}</div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Mengirim...
                    </span>
                  ) : (
                    'Kirim Pesan'
                  )}
                </button>
              </form>
            )}
          </section>
        </>
      )}
    </div>
  );
}
