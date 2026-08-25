import { Routes, Route, Link } from 'react-router-dom';
import { Suspense, lazy } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ProviderPage = lazy(() => import('./pages/ProviderPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-primary-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-gray-500">Halaman yang Anda cari tidak tersedia.</p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}

export function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/provider/:slug" element={<ProviderPage />} />
        <Route path="/booking/:providerId" element={<BookingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
