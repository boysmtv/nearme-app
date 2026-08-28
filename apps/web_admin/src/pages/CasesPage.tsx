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

  const severityColors: Record<string, string> = { P0: 'bg-red-100 text-red-700', P1: 'bg-orange-100 text-orange-700', P2: 'bg-yellow-100 text-yellow-700', P3: 'bg-gray-100 text-gray-600' };

  const columns = [
    { key: 'caseNumber', label: 'No.', render: (c: SupportCase) => <span className="font-medium text-primary-600">{c.caseNumber}</span> },
    { key: 'subject', label: 'Subjek', render: (c: SupportCase) => <span className="text-gray-900">{c.subject}</span> },
    { key: 'customerName', label: 'Pelanggan', render: (c: SupportCase) => <span className="text-gray-700">{c.customerName}</span> },
    { key: 'severity', label: 'Severity', render: (c: SupportCase) => <span className={`inline-flex rounded-full px-2.5 py-1 text-[13px] font-medium ${severityColors[c.severity] || 'bg-gray-100 text-gray-600'}`}>{c.severity}</span> },
    { key: 'status', label: 'Status', render: (c: SupportCase) => <StatusBadge status={c.status} /> },
    { key: 'assignee', label: 'Assignee', render: (c: SupportCase) => <span className="text-gray-700">{c.assignee || '-'}</span> },
    { key: 'actions', label: '', render: (c: SupportCase) => (
      <div className="flex gap-2">
        {c.status === 'OPEN' && <button onClick={() => statusMut.mutate({ id: c.id, status: 'IN_PROGRESS' })} className="text-sm px-2 py-1 text-blue-600 hover:underline">Take</button>}
        {c.status === 'IN_PROGRESS' && <button onClick={() => statusMut.mutate({ id: c.id, status: 'RESOLVED' })} className="text-sm px-2 py-1 text-green-600 hover:underline">Resolve</button>}
      </div>
    )},
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Support Cases</h1><p className="mt-1 text-sm text-gray-500">SLA tracking dan manajemen kasus</p></div>
        <div className="flex gap-3">
          <select value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="">Semua Severity</option>{['P0','P1','P2','P3'].map((s) => <option key={s} value={s}>{s}</option>)}</select>
          <select value={caseStatus} onChange={(e) => { setCaseStatus(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="">Semua Status</option>{['OPEN','IN_PROGRESS','WAITING_CUSTOMER','RESOLVED','CLOSED'].map((s) => <option key={s} value={s}>{s}</option>)}</select>
        </div>
        <DataTable columns={columns} data={res?.data?.data ?? []} pagination={res?.data?.pagination} onPageChange={setPage} isLoading={isLoading} emptyMessage="Tidak ada kasus" />
      </div>
    </AdminLayout>
  );
}
