import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../lib/auth';
import { publicApi } from '../../lib/api';

const profileSchema = z.object({
  name: z.string().min(2, 'Nama harus minimal 2 karakter'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').regex(/^\+?[0-9]{10,15}$/, 'Nomor telepon tidak valid'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function CustomerAccountPage() {
  const navigate = useNavigate();
  const { logout, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: () => publicApi.customer.getProfile(),
  });

  const profile = profileData?.data;

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: profile?.name ?? '', phone: profile?.phone ?? '' },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormData) => publicApi.customer.updateProfile({ name: data.name, phone: data.phone }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
      refreshUser();
      setEditing(false);
      setSaveMsg('Profil berhasil diperbarui');
      setTimeout(() => setSaveMsg(null), 3000);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Profile Update Error]', err);
      setSaveMsg(msg || 'Gagal memperbarui profil');
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { label: 'My Bookings', path: '/bookings', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    )},
    { label: 'Ulasan Saya', path: '/account/reviews', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
    )},
    { label: 'Favorites', path: '/favorites', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
    )},
    { label: 'Undang Teman', path: '/account/referral', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
    )},
    { label: 'Booking Berulang', path: '/account/recurring', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
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
          {saveMsg && (
            <div className={`rounded-lg p-3 text-sm ${saveMsg.includes('berhasil') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {saveMsg}
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
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
              {!editing && (
                <button
                  onClick={() => { reset({ name: profile?.name ?? '', phone: profile?.phone ?? '' }); setEditing(true); }}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Edit Profil
                </button>
              )}
            </div>

            {editing && (
              <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="border-t pt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                  <input
                    {...register('name')}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Booking Streak</h2>
            <p className="text-gray-600">Anda telah booking <span className="font-bold text-primary-600">3 kali</span> bulan ini!</p>
            <div className="flex items-center gap-1 mt-3">
              {[1,2,3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">✓</div>
              ))}
              {[4,5,6,7].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">{i}</div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Booking 7 kali dalam sebulan untuk badge!</p>
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
