import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProviderLayout from '../../components/ProviderLayout';

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function SettlementPage() {
  const queryClient = useQueryClient();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');

  const { data: settlementsRes, isLoading } = useQuery({
    queryKey: ['provider', 'settlements'],
    queryFn: () => fetch('/api/v1/provider/settlement?limit=20', { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } }).then(r => r.json()),
  });

  const requestMutation = useMutation({
    mutationFn: (amount: number) => fetch('/api/v1/provider/settlement/request', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      body: JSON.stringify({ amount }),
    }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['provider', 'settlements'] }); setShowRequestForm(false); setRequestAmount(''); },
  });

  const settlements = settlementsRes?.data ?? [];

  return (
    <ProviderLayout>
      <div className="mx-auto max-w-4xl space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settlement & Payout</h1>
            <p className="text-sm text-gray-500">Riwayat pembayaran dan pencairan dana</p>
          </div>
          <button onClick={() => setShowRequestForm(!showRequestForm)} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
            + Request Payout
          </button>
        </div>

        {showRequestForm && (
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="font-semibold text-gray-900">Request Pencairan Dana</h3>
            <div className="mt-4 flex items-end gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Jumlah (IDR)</label>
                <input type="number" value={requestAmount} onChange={e => setRequestAmount(e.target.value)} placeholder="Masukkan jumlah" className="mt-1 rounded-lg border px-3 py-2 text-sm" />
              </div>
              <button onClick={() => requestMutation.mutate(parseInt(requestAmount))} disabled={!requestAmount || requestMutation.isPending} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                {requestMutation.isPending ? 'Memproses...' : 'Ajukan'}
              </button>
              <button onClick={() => setShowRequestForm(false)} className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
            </div>
          </div>
        )}

        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs font-medium text-gray-500">
                <tr>
                  <th className="px-4 py-3">Periode</th>
                  <th className="px-4 py-3">Pendapatan</th>
                  <th className="px-4 py-3">Komisi</th>
                  <th className="px-4 py-3">Net Payout</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tanggal Bayar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Memuat...</td></tr>
                ) : settlements.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada settlement</td></tr>
                ) : settlements.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{s.period}</td>
                    <td className="px-4 py-3">{formatPrice(s.totalRevenue)}</td>
                    <td className="px-4 py-3 text-red-600">{formatPrice(s.commission)}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">{formatPrice(s.netPayout)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${s.status === 'PAID' ? 'bg-green-100 text-green-700' : s.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                        {s.status === 'PAID' ? 'Dibayar' : s.status === 'PENDING' ? 'Menunggu' : s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{s.paidAt ? new Date(s.paidAt).toLocaleDateString('id-ID') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}
