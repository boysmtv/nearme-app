import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';

export default function CustomerAccountPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: () => api.get('/customer/profile'),
  });

  const profile = profileData?.data;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { label: 'My Bookings', path: '/bookings', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    )},
    { label: 'Favorites', path: '/favorites', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
    )},
    { label: 'Notifications', path: '/notifications', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
    )},
    { label: 'Help & Support', path: '/support', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )},
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Akun Saya</h1>

      {isLoading ? (
        <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
      ) : (
        <>
          <div className="bg-white p-6 rounded-xl shadow-sm ring-1 ring-gray-100 flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold">
              {(profile?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{profile?.name || 'User'}</p>
              <p className="text-gray-500">{profile?.email}</p>
              {(profile?.loyaltyPoints ?? 0) > 0 && (
                <p className="text-sm text-primary-600 font-medium mt-1">
                  ⭐ {profile.loyaltyPoints} loyalty points
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 divide-y">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-400">{item.icon}</span>
                <span className="flex-1 font-medium text-gray-700">{item.label}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 p-3 rounded-xl hover:bg-red-100 transition-colors font-medium"
          >
            Keluar
          </button>
        </>
      )}
    </div>
  );
}
