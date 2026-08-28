import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../lib/api';
import AdminLayout from '../components/AdminLayout';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import type { SupportCase } from '../lib/types';

export default function CasesPage() {
  const [severity, setSeverity] = useState('');
  const [caseStatus, setCaseStatus] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { data: res, isLoading } = useQuery({
    queryKey: ['admin', 'cases', page, severity, caseStatus],
    queryFn: () => adminApi.cases.list({ page, limit: 20, severity, status: caseStatus }),
  });

  const statusMut = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.cases.updateStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'cases'] }) });

  const severityColors: Record<string, string> = {
    P0: 'bg-rose-100 text-rose-700 ring-rose-200',
    P1: 'bg-orange-100 text-orange-700 ring-orange-200',
    P2: 'bg-amber-100 text-amber-700 ring-amber-200',
    P3: 'bg-sky-100 text-sky-700 ring-sky-200',
  };

  const columns = [
    { key: 'caseNumber', label: 'No. Kasus', render: (c: SupportCase) => <span className="inline-flex items-center rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 px-2.5 py-1 text-xs font-bold text-white shadow">{c.caseNumber}</span> },
    { key: 'subject', label: 'Subjek', render: (c: SupportCase) => <span className="text-sm font-semibold text-gray-900 line-clamp-1">{c.subject}</span> },
    { key: 'customerName', label: 'Pelanggan', render: (c: SupportCase) => <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-soft-pink text-xs font-bold text-rose-700">{c.customerName[0]}</span><span className="text-sm font-medium text-gray-700">{c.customerName}</span></div> },
    { key: 'severity', label: 'Severity', render: (c: SupportCase) => <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${severityColors[c.severity] || 'bg-gray-100 text-gray-600'}`}><span className="h-1.5 w-1.5 rounded-full bg-current opacity-60"/> {c.severity}</span> },
    { key: 'status', label: 'Status', render: (c: SupportCase) => <StatusBadge status={c.status} /> },
    { key: 'assignee', label: 'Assignee', render: (c: SupportCase) => <span className="text-sm text-gray-600">{c.assignee ? <span className="inline-flex items-center gap-1 rounded-full bg-soft-violet px-2 py-1 text-xs font-semibold text-primary-700">{c.assignee}</span> : <span className="text-gray-400">—</span>}</span> },
    { key: 'actions', label: '', render: (c: SupportCase) => (
      <div className="flex gap-1.5">
        {c.status === 'OPEN' && <button onClick={() => statusMut.mutate({ id: c.id, status: 'IN_PROGRESS' })} className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-600 shadow-sm transition-colors">Take</button>}
        {c.status === 'IN_PROGRESS' && <button onClick={() => statusMut.mutate({ id: c.id, status: 'RESOLVED' })} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 shadow-sm transition-colors">Resolve</button>}
      </div>
    )},
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-400 shadow-md">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div><h1 className="text-2xl font-bold tracking-tight text-gray-900">Support Cases</h1><p className="mt-1 text-sm font-medium text-gray-500">SLA tracking dan manajemen kasus</p></div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-100">
            <span className="pl-3 text-xs font-bold uppercase tracking-widest text-gray-500">Severity:</span>
            <select value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1); }} className="rounded-lg bg-soft-pink px-3 py-2 text-sm font-semibold text-rose-700 focus:outline-none"><option value="">Semua</option>{['P0','P1','P2','P3'].map((s) => <option key={s} value={s}>{s}</option>)}</select>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-100">
            <span className="pl-3 text-xs font-bold uppercase tracking-widest text-gray-500">Status:</span>
            <select value={caseStatus} onChange={(e) => { setCaseStatus(e.target.value); setPage(1); }} className="rounded-lg bg-soft-violet px-3 py-2 text-sm font-semibold text-primary-700 focus:outline-none"><option value="">Semua</option>{['OPEN','IN_PROGRESS','WAITING_CUSTOMER','RESOLVED','CLOSED'].map((s) => <option key={s} value={s}>{s}</option>)}</select>
          </div>
        </div>
        <DataTable columns={columns} data={res?.data?.data ?? []} pagination={res?.data?.pagination} onPageChange={setPage} isLoading={isLoading} emptyMessage="Tidak ada kasus" />
      </div>
    </AdminLayout>
  );
}
