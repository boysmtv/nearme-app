import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { adminApi } from '../lib/api';
import AdminLayout from '../components/AdminLayout';
import StatusBadge from '../components/StatusBadge';

interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  result: string;
  ipAddress: string;
  createdAt: string;
}

export default function AuditLogPage() {
  const [filters, setFilters] = useState({ action: '', resourceType: '', since: '' });

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin', 'audit-logs', filters],
    queryFn: () => {
      const q = new URLSearchParams();
      if (filters.action) q.set('action', filters.action);
      if (filters.resourceType) q.set('resourceType', filters.resourceType);
      if (filters.since) q.set('since', filters.since);
      return adminApi.auditLogs.list({ action: filters.action, resourceType: filters.resourceType, since: filters.since });
    },
  });
  const logs = res?.data ?? [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-1 text-sm text-gray-500">Riwayat aktivitas platform</p>
        </div>

        <div className="flex flex-wrap gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <input type="text" placeholder="Action..." value={filters.action}
            onChange={e => setFilters({ ...filters, action: e.target.value })}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          <input type="text" placeholder="Resource Type..." value={filters.resourceType}
            onChange={e => setFilters({ ...filters, resourceType: e.target.value })}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          <input type="date" value={filters.since}
            onChange={e => setFilters({ ...filters, since: e.target.value })}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
            <p className="text-gray-500">Tidak ada audit log ditemukan</p>
          </div>
        ) : (
          <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log: AuditLog) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString('id-ID') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{log.actorId?.substring(0, 8) || '-'}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{log.action}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{log.resourceType}:{log.resourceId?.substring(0, 8)}</td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={log.result} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{log.ipAddress || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
