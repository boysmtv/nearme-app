import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function SupportPage() {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const { data: faqsData, isLoading: faqsLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => api.get('/public/faqs'),
  });

  const { data: policiesData, isLoading: policiesLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: () => api.get('/public/policies'),
  });

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
        </>
      )}
    </div>
  );
}
