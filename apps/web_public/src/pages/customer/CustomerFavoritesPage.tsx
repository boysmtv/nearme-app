import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { ApiResponse } from '../../lib/types';

export default function CustomerFavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFavorites(); }, []);

  const loadFavorites = async () => {
    try {
      const res = await api.get<ApiResponse<any[]>>('/customer/favorites');
      setFavorites(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const removeFavorite = async (staffId: string) => {
    await api.delete(`/customer/favorites/${staffId}`);
    setFavorites(prev => prev.filter(f => f.staffId !== staffId));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Favorite Staff</h1>

      {loading ? <p>Loading...</p> : favorites.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No favorites yet</p>
          <Link to="/search" className="text-[#6C63FF] hover:underline mt-2 inline-block">Find providers</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map(f => (
            <div key={f.id} className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
              <div className="w-12 h-12 bg-[#6C63FF] rounded-full flex items-center justify-center text-white font-bold">
                {(f.staffName || f.name || 'S').charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{f.staffName || f.name || 'Staff'}</p>
                <p className="text-sm text-gray-500">{f.specialties || 'Provider staff'}</p>
              </div>
              <button onClick={() => removeFavorite(f.staffId)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
