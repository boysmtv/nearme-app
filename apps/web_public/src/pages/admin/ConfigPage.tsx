import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';
import type { FeatureFlag } from '../../lib/types';

export default function ConfigPage() {
  const qc = useQueryClient();
  const { data: res, isLoading } = useQuery({ queryKey: ['admin', 'flags'], queryFn: () => adminApi.config.getFlags() });
  const flags = res?.data ?? [];
  const toggleMut = useMutation({ mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => adminApi.config.toggleFlag(id, enabled), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'flags'] }) });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Configuration</h1><p className="mt-1 text-sm text-gray-500">Feature flags dan pengaturan platform</p></div>
        {isLoading ? <div className="animate-pulse space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-100" />)}</div>
        : flags.length === 0 ? <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100"><p className="text-gray-500">Belum ada feature flags</p></div>
        : <div className="space-y-3">{flags.map((flag: FeatureFlag) => <div key={flag.id} className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100"><div><div className="flex items-center gap-3"><h3 className="font-medium text-gray-900">{flag.name}</h3><code className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{flag.key}</code><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{flag.environment}</span></div><p className="mt-1 text-sm text-gray-500">{flag.description}</p></div><button onClick={() => toggleMut.mutate({ id: flag.id, enabled: !flag.enabled })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${flag.enabled ? 'bg-primary-600' : 'bg-gray-300'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${flag.enabled ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>)}</div>}
      </div>
    </AdminLayout>
  );
}
