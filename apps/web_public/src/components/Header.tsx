import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../lib/auth';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E8FF]/70 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B8CFF] to-[#A5A6FF] text-sm font-black tracking-widest text-white shadow-md shadow-[#8B8CFF]/25 transition-transform group-hover:scale-105">
            D
          </span>
          <span className="bg-gradient-to-r from-[#8B8CFF] to-[#FF8E9E] bg-clip-text text-[22px] font-black tracking-tight text-transparent">DEKAT</span>
          <span className="hidden rounded-full bg-[#e8e8ff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#6a6acc] sm:inline">Booking</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden max-w-md flex-1 mx-8 md:block">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B8CFF]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari layanan, lokasi, atau provider..."
              className="w-full rounded-full border border-[#E8E8FF] bg-[#FAF9FF] py-2 pl-10 pr-4 text-sm transition-all focus:border-[#8B8CFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8E8FF]"
            />
          </div>
        </form>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/search"
            className="hidden rounded-full bg-[#e8f2ff] px-4 py-2 text-sm font-semibold text-[#5a7ab3] transition hover:bg-[#dbe9ff] sm:inline-flex items-center gap-1.5"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Cari Layanan
          </Link>
          <div className="hidden h-6 w-px bg-[#E8E8FF] sm:block" />
          {isAuthenticated && user ? (
            <>
              {user.role.startsWith('ROLE_PROVIDER') && (
                <Link
                  to="/provider/dashboard"
                  className="hidden rounded-full bg-gradient-to-r from-[#8B8CFF] to-[#A5A6FF] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#8B8CFF]/20 transition hover:shadow-md sm:inline-flex"
                >
                  Dashboard Provider
                </Link>
              )}
              <span className="hidden max-w-[140px] truncate rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-[#E8E8FF] sm:inline">{user.email}</span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-[#E8E8FF] bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-[#FAF9FF] hover:border-[#d0d0ff]"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-[#E8E8FF] bg-white px-5 py-2 text-sm font-semibold text-[#6a6acc] transition hover:bg-[#FAF9FF]"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-gradient-to-r from-[#8B8CFF] to-[#FF8E9E] px-5 py-2 text-sm font-bold text-white shadow-md shadow-[#8B8CFF]/20 transition hover:shadow-lg hover:opacity-[0.95]"
              >
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="mx-auto block max-w-md px-4 pb-3 md:hidden">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B8CFF]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari layanan..."
              className="w-full rounded-full border border-[#E8E8FF] bg-[#FAF9FF] py-2 pl-10 pr-4 text-sm focus:border-[#8B8CFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8E8FF]"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
