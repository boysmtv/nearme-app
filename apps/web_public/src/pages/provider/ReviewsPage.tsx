import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providerApi } from '../../lib/api';
import ProviderLayout from '../../components/ProviderLayout';

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  const { data: res, isLoading } = useQuery({
    queryKey: ['provider-reviews'],
    queryFn: () => providerApi.reviews.list(),
  });

  const reviews = res?.data?.data ?? [];

  const respondMutation = useMutation({
    mutationFn: ({ reviewId, body }: { reviewId: string; body: string }) =>
      providerApi.reviews.respond(reviewId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-reviews'] });
      setRespondingTo(null);
      setResponseText('');
    },
  });

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ulasan</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola ulasan pelanggan dan respons Anda</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-white p-5 shadow-sm">
                <div className="h-4 w-1/4 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-3/4 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
            <p className="text-gray-500">Belum ada ulasan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <div key={review.id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{review.customerName || 'Pelanggan'}</span>
                      <div className="flex text-yellow-400 text-sm">
                        {'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}
                      </div>
                      {review.verifiedBooking && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Terverifikasi
                        </span>
                      )}
                    </div>
                    {review.title && <p className="font-medium text-gray-900 mt-1">{review.title}</p>}
                    <p className="text-sm text-gray-600 mt-1">{review.body}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                    </p>
                  </div>
                </div>

                {review.response && (
                  <div className="mt-3 ml-4 rounded-lg bg-primary-50 p-3">
                    <p className="text-sm font-medium text-primary-700">Respons Provider:</p>
                    <p className="text-sm text-primary-600">{review.response}</p>
                  </div>
                )}

                {!review.response && respondingTo !== review.id && (
                  <button
                    onClick={() => setRespondingTo(review.id)}
                    className="mt-3 text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    Balas ulasan
                  </button>
                )}

                {respondingTo === review.id && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Tulis respons Anda..."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => respondMutation.mutate({ reviewId: review.id, body: responseText })}
                        disabled={!responseText.trim()}
                        className="rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                      >
                        Kirim Respons
                      </button>
                      <button
                        onClick={() => { setRespondingTo(null); setResponseText(''); }}
                        className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}
