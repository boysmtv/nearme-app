import { useQuery } from '@tanstack/react-query';
import ProviderLayout from '../../components/ProviderLayout';

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function CommissionPage() {
  const { data: statementRes, isLoading } = useQuery({
    queryKey: ['provider', 'commission'],
    queryFn: () => fetch('/api/v1/provider/commission/statement?days=30', { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } }).then(r => r.json()),
  });

  const { data: configRes } = useQuery({
    queryKey: ['provider', 'commission-config'],
    queryFn: () => fetch('/api/v1/provider/commission/config', { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } }).then(r => r.json()),
  });

  const statement = statementRes?.data;
  const config = configRes?.data;
  const breakdown = statement?.breakdown ?? [];

  return (
    <ProviderLayout>
      <div className="mx-auto max-w-screen-2xl space-y-6 p-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Komisi Platform</h1>
          <p className="text-sm text-gray-500">Ringkasan komisi dan pembayaran</p>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-400 py-8">Memuat...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <p className="text-sm text-gray-500">Total Pendapatan (30 hari)</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{formatPrice(statement?.totalRevenue || 0)}</p>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <p className="text-sm text-gray-500">Total Komisi</p>
                <p className="mt-1 text-2xl font-bold text-red-600">{formatPrice(statement?.totalCommission || 0)}</p>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <p className="text-sm text-gray-500">Net Pembayaran</p>
                <p className="mt-1 text-2xl font-bold text-green-600">{formatPrice(statement?.netPayout || 0)}</p>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <p className="text-sm text-gray-500">Tingkat Komisi</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{config?.rate || '5%'}</p>
              </div>
            </div>

            <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
              <div className="border-b px-6 py-4">
                <h3 className="font-semibold text-gray-900">Rincian Harian</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-gray-50 text-xs font-medium text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Pendapatan</th>
                      <th className="px-4 py-3">Komisi (5%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {breakdown.map((b: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{new Date(b.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</td>
                        <td className="px-4 py-3 font-medium">{formatPrice(b.revenue)}</td>
                        <td className="px-4 py-3 text-red-600">{formatPrice(b.commission)}</td>
                      </tr>
                    ))}
                    {breakdown.length === 0 && (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">Belum ada data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </ProviderLayout>
  );
}
