import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { ApiResponse } from '../../lib/types';

export default function SupportPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [faqsRes, policiesRes] = await Promise.all([
        api.get<ApiResponse<any[]>>('/public/faqs'),
        api.get<ApiResponse<any[]>>('/public/policies'),
      ]);
      setFaqs(faqsRes.data || []);
      setPolicies(policiesRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Help & Support</h1>

      {loading ? <p>Loading...</p> : (
        <>
          <section>
            <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqs.map(faq => (
                <div key={faq.id} className="bg-white rounded-lg shadow">
                  <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full p-4 text-left flex justify-between items-center">
                    <span className="font-medium">{faq.question}</span>
                    <span>{expandedFaq === faq.id ? '−' : '+'}</span>
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-4 pb-4 text-gray-600">{faq.answer}</div>
                  )}
                </div>
              ))}
              {faqs.length === 0 && <p className="text-gray-500">No FAQs available</p>}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Policies</h2>
            <div className="space-y-2">
              {policies.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-lg shadow">
                  <p className="font-medium">{p.title || p.type}</p>
                  <p className="text-sm text-gray-600 mt-1">{p.content || p.body}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
