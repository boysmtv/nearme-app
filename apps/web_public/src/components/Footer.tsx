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
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Link to="/" className="text-2xl font-bold text-primary-600">
              DEKAT
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Platform booking layanan dengan harga transparan, jadwal real-time, dan pembayaran mudah.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Jelajahi
            </h3>
            <ul className="mt-4 space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-500 transition-colors hover:text-primary-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Informasi
            </h3>
            <ul className="mt-4 space-y-3">
              {infoLinks.map((link) => (
                <li key={link.to + link.label}>
                  <Link to={link.to} className="text-sm text-gray-500 transition-colors hover:text-primary-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} DEKAT Booking Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
