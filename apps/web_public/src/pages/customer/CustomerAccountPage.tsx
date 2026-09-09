import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../lib/auth';
import { publicApi } from '../../lib/api';
import CustomerLayout from '../../components/CustomerLayout';

const profileSchema = z.object({
  name: z.string().min(2, 'Nama harus minimal 2 karakter'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').regex(/^\+?[0-9]{10,15}$/, 'Nomor telepon tidak valid'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function getLoyaltyTier(points: number): { label: string; color: string; bg: string } {
  if (points >= 1000) return { label: 'Platinum', color: 'text-violet-700', bg: 'bg-violet-100' };
  if (points >= 500) return { label: 'Gold', color: 'text-amber-700', bg: 'bg-amber-100' };
  if (points >= 100) return { label: 'Silver', color: 'text-slate-600', bg: 'bg-slate-100' };
  return { label: 'Bronze', color: 'text-orange-700', bg: 'bg-orange-100' };
}

export default function CustomerAccountPage() {
  const navigate = useNavigate();
  const { logout, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: () => publicApi.customer.getProfile(),
  });

  const profile = profileData?.data;
  const loyaltyPoints = profile?.loyaltyPoints ?? 0;
  const tier = getLoyaltyTier(loyaltyPoints);

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

  const menuSections = [
    {
      title: 'Booking',
      items: [
        {
          label: 'Booking Saya',
          description: 'Lihat semua riwayat dan status booking',
          path: '/bookings',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          ),
        },
        {
          label: 'Ulasan',
          description: 'Kelola ulasan yang telah Anda berikan',
          path: '/account/reviews',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          ),
        },
        {
          label: 'Booking Berulang',
          description: 'Atur jadwal booking rutin Anda',
          path: '/account/recurring',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Akun',
      items: [
        {
          label: 'Favorit',
          description: 'Daftar staf dan layanan favorit Anda',
          path: '/favorites',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ),
        },
        {
          label: 'Referral',
          description: 'Undang teman dan dapatkan poin',
          path: '/account/referral',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          ),
        },
        {
          label: 'Notifikasi',
          description: 'Pengaturan notifikasi dan preferensi',
          path: '/notifications',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Dukungan',
      items: [
        {
          label: 'Bantuan',
          description: 'Pusat bantuan dan FAQ',
          path: '/support',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          label: 'Syarat & Ketentuan',
          description: 'Kebijakan privasi dan layanan',
          path: '/support#terms',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <CustomerLayout>
      <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 space-y-6">
        {isLoading ? (
          <div className="space-y-6">
            <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {saveMsg && (
              <div className={`rounded-xl px-4 py-3 text-sm font-medium ${saveMsg.includes('berhasil') ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'}`}>
                {saveMsg}
              </div>
            )}

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
              <div className="h-28 bg-gradient-to-r from-primary-600 to-primary-400" />
              <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white ring-4 ring-white flex items-center justify-center text-3xl sm:text-4xl font-bold text-primary-600 bg-primary-50 flex-shrink-0">
                    {(profile?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {profile?.name || 'User'}
                      </h1>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${tier.bg} ${tier.color} w-fit`}>
                        {tier.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{profile?.email}</p>
                    {profile?.phone && (
                      <p className="text-sm text-gray-500">{profile.phone}</p>
                    )}
                  </div>
                  {!editing && (
                    <button
                      onClick={() => {
                        reset({ name: profile?.name ?? '', phone: profile?.phone ?? '' });
                        setEditing(true);
                      }}
                      className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 px-4 py-2 rounded-xl hover:bg-primary-50 transition-colors w-fit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profil
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Inline Edit Form */}
            {editing && (
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Profil</h2>
                <form
                  onSubmit={handleSubmit((data) => updateMutation.mutate(data))}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <input
                      {...register('name')}
                      className="block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-shadow"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-shadow"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                      {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Booking</p>
                    <p className="text-2xl font-bold text-gray-900">{profile?.totalBookings ?? 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Poin Loyalitas</p>
                    <p className="text-2xl font-bold text-gray-900">{loyaltyPoints}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status Akun</p>
                    <p className="text-2xl font-bold text-emerald-600">Aktif</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: 'Edit Profil',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  ),
                  action: () => {
                    reset({ name: profile?.name ?? '', phone: profile?.phone ?? '' });
                    setEditing(true);
                  },
                  color: 'text-primary-600 bg-primary-50',
                },
                {
                  label: 'Ganti Password',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  ),
                  action: () => {},
                  color: 'text-amber-600 bg-amber-50',
                },
                {
                  label: 'Preferensi',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  action: () => {},
                  color: 'text-violet-600 bg-violet-50',
                },
                {
                  label: 'Bantuan',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  action: () => navigate('/support'),
                  color: 'text-sky-600 bg-sky-50',
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Menu Sections */}
            {menuSections.map((section) => (
              <div key={section.title} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{section.title}</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors flex-shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-300 group-hover:text-primary-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Logout */}
            {!showLogoutConfirm ? (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 text-red-600 font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Keluar
              </button>
            ) : (
              <div className="bg-red-50 rounded-2xl ring-1 ring-red-200 p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-red-800">Yakin ingin keluar?</p>
                <p className="text-xs text-red-600">Anda akan diarahkan ke halaman utama</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleLogout}
                    className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                  >
                    Ya, Keluar
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-white transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </CustomerLayout>
  );
}
