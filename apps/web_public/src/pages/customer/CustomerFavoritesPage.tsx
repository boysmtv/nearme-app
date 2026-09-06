import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function CustomerFavoritesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['customer-favorites'],
    queryFn: () => api.get('/customer/favorites'),
  });

  const removeMutation = useMutation({
    mutationFn: (staffId: string) => api.delete(`/customer/favorites/${staffId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer-favorites'] }),
  });

  const favorites = data?.data ?? [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Staf Favorit</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">Belum ada staf favorit</p>
          <Link to="/search" className="text-primary-600 hover:underline mt-2 inline-block font-medium">
            Cari provider
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((f: any) => (
            <div key={f.id} className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                {(f.staffName || f.name || 'S').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{f.staffName || f.name || 'Staf'}</p>
                <p className="text-sm text-gray-500 truncate">{f.specialties || 'Provider staff'}</p>
              </div>
              <button
                onClick={() => removeMutation.mutate(f.staffId)}
                disabled={removeMutation.isPending}
                className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
