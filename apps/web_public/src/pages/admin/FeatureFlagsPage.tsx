import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminApi } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';
import type { FeatureFlag } from '../../lib/types';

export default function FeatureFlagsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newFlag, setNewFlag] = useState({ name: '', key: '', description: '', enabled: false, environment: 'development' });
  const { data: res, isLoading } = useQuery({ queryKey: ['admin', 'feature-flags'], queryFn: () => adminApi.config.getFlags() });
  const flags = res?.data ?? [];
  const toggleMut = useMutation({ mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => adminApi.config.toggleFlag(id, enabled), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'feature-flags'] }) });
  const createMut = useMutation({ mutationFn: (data: typeof newFlag) => adminApi.config.createFlag(data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'feature-flags'] }); setShowCreate(false); setNewFlag({ name: '', key: '', description: '', enabled: false, environment: 'development' }); } });
  const deleteMut = useMutation({ mutationFn: (id: string) => adminApi.config.deleteFlag(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'feature-flags'] }) });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1><p className="mt-1 text-sm text-gray-500">Kelola fitur dan pengaturan platform</p></div><button onClick={() => setShowCreate(true)} className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">+ Buat Flag</button></div>
        {isLoading ? <div className="animate-pulse space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-100" />)}</div>
        : flags.length === 0 ? <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100"><p className="text-gray-500">Belum ada feature flags</p></div>
        : <div className="space-y-3">{flags.map((flag: FeatureFlag) => <div key={flag.id} className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100"><div><div className="flex items-center gap-3"><h3 className="font-medium text-gray-900">{flag.name}</h3><code className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{flag.key || flag.name}</code><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{flag.targetEnvironment || flag.environment}</span></div><p className="mt-1 text-sm text-gray-500">{flag.description}</p></div><div className="flex items-center gap-3"><button onClick={() => toggleMut.mutate({ id: flag.id, enabled: !flag.enabled })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${flag.enabled ? 'bg-primary-600' : 'bg-gray-300'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${flag.enabled ? 'translate-x-6' : 'translate-x-1'}`} /></button><button onClick={() => deleteMut.mutate(flag.id)} className="text-gray-400 hover:text-red-600 transition-colors"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></div></div>)}</div>}
      </div>
      {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"><h2 className="text-lg font-semibold text-gray-900">Buat Feature Flag</h2><div className="mt-4 space-y-4"><input value={newFlag.name} onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })} placeholder="Nama flag" className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" /><input value={newFlag.description} onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })} placeholder="Deskripsi" className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" /><select value={newFlag.environment} onChange={(e) => setNewFlag({ ...newFlag, environment: e.target.value })} className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none"><option value="development">Development</option><option value="staging">Staging</option><option value="production">Production</option></select></div><div className="mt-6 flex justify-end gap-3"><button onClick={() => setShowCreate(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Batal</button><button onClick={() => createMut.mutate(newFlag)} disabled={!newFlag.name} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">Buat</button></div></div></div>}
    </AdminLayout>
  );
}
