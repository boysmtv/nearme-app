import { Link } from 'react-router-dom';

const exploreLinks = [
  { label: 'Cari Layanan', to: '/search' },
  { label: 'Masuk', to: '/login' },
  { label: 'Daftar Akun', to: '/register' },
  { label: 'Daftar Provider', to: '/provider/register' },
  { label: 'Tentang DEKAT', to: '/about' },
];

const infoLinks = [
  { label: 'Syarat & Ketentuan', to: '/about' },
  { label: 'Kebijakan Privasi', to: '/about' },
  { label: 'Bantuan & FAQ', to: '/about' },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#E8E8FF] bg-gradient-to-br from-[#FAF9FF] via-white to-[#E8F2FF]/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#8B8CFF] to-[#A5A6FF] text-xs font-black text-white">D</span>
              <span className="bg-gradient-to-r from-[#8B8CFF] to-[#FF8E9E] bg-clip-text text-xl font-black tracking-tight text-transparent">DEKAT</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Platform booking layanan dengan harga transparan, jadwal real-time, dan pembayaran mudah. Warna lembut, pengalaman menyenangkan.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#e8e8ff] text-[#8B8CFF]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#ffe8ec] text-[#FF6B80]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#e6f7ee] text-[#3CB371]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#fff4d6] text-[#D4A000]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">
              Jelajahi
            </h3>
            <ul className="mt-4 space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.to + link.label}>
                  <Link
                    to={link.to}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 transition-all hover:translate-x-0.5 hover:text-[#8B8CFF]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E8E8FF]" /> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">
              Informasi
            </h3>
            <ul className="mt-4 space-y-2.5">
              {infoLinks.map((link) => (
                <li key={link.to + link.label}>
                  <Link to={link.to} className="inline-flex items-center gap-2 text-sm text-gray-500 transition-all hover:translate-x-0.5 hover:text-[#8B8CFF]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ffe8ec]" /> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[#E8E8FF] pt-6 sm:flex-row">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} DEKAT — dibuat dengan <span className="text-[#FF8E9E]">♥</span> di Indonesia
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-white px-3 py-1 font-medium text-gray-500 shadow-sm ring-1 ring-[#E8E8FF]">🇮🇩 Bahasa Indonesia</span>
            <span className="rounded-full bg-gradient-to-r from-[#8B8CFF] to-[#FF8E9E] px-3 py-1 font-bold text-white">v1.0 • Soft UI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
