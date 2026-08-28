import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../lib/auth';

const schema = z.object({
  name: z.string().min(2, 'Nama harus minimal 2 karakter'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit'),
});

type FormData = z.infer<typeof schema>;

export default function ProfileCompletePage() {
  const { user, completeProfile } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '', phone: '' },
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await completeProfile({ nickname: data.name, name: data.name, phone: data.phone });
      navigate('/', { replace: true });
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Gagal menyimpan profil');
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Link to="/login" className="text-primary-600 hover:underline">Silakan login terlebih dahulu</Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link to="/" className="text-3xl font-bold text-primary-600">DEKAT</Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Lengkapi Profil</h1>
          <p className="mt-2 text-sm text-gray-500">Isi data berikut untuk melanjutkan booking</p>
          <p className="mt-1 text-xs text-gray-400">{user.email}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
          {serverError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{serverError}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              {...register('name')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Masukkan nama Anda"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
            <input
              {...register('phone')}
              type="tel"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="08xxxxxxxxxx"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
          </button>
          <p className="text-center text-xs text-gray-400">Profil disimpan ke server via PUT /customer/profile</p>
        </form>
      </div>
    </div>
  );
}
