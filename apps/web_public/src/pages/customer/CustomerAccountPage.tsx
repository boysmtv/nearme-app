import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import type { ApiResponse } from '../../lib/types';

export default function CustomerAccountPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get<ApiResponse<any>>('/customer/profile');
      setProfile(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh');
    localStorage.removeItem('auth_user');
    navigate('/login');
  };

  const menuItems = [
    { label: 'My Bookings', path: '/bookings', icon: '📋' },
    { label: 'Favorites', path: '/favorites', icon: '❤️' },
    { label: 'Notifications', path: '/notifications', icon: '🔔' },
    { label: 'Help & Support', path: '/support', icon: '❓' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Account</h1>

      {loading ? <p>Loading...</p> : (
        <>
          <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
            <div className="w-16 h-16 bg-[#6C63FF] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {(profile?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold">{profile?.name || 'User'}</p>
              <p className="text-gray-500">{profile?.email}</p>
              {profile?.loyaltyPoints > 0 && (
                <p className="text-sm text-[#6C63FF]">⭐ {profile.loyaltyPoints} loyalty points</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow divide-y">
            {menuItems.map(item => (
              <Link key={item.path} to={item.path}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                <span className="text-xl">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                <span className="text-gray-400">→</span>
              </Link>
            ))}
          </div>

          <button onClick={logout}
            className="w-full bg-red-50 text-red-600 p-3 rounded-lg hover:bg-red-100 transition-colors">
            Logout
          </button>
        </>
      )}
    </div>
  );
}
