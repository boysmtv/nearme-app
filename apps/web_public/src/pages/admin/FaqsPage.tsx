import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { publicApi } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const faqSchema = z.object({
  question: z.string().min(5, 'Minimal 5 karakter'),
  answer: z.string().min(10, 'Minimal 10 karakter'),
  category: z.string().optional(),
  sortOrder: z.number().optional(),
});
type FaqForm = z.infer<typeof faqSchema>;

const policySchema = z.object({
  title: z.string().min(3, 'Minimal 3 karakter'),
  body: z.string().min(10, 'Minimal 10 karakter'),
  type: z.string().min(2, 'Wajib diisi'),
  version: z.number().optional(),
});
type PolicyForm = z.infer<typeof policySchema>;

type Tab = 'faq' | 'policies';

export default function FaqsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('faq');

  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editFaqId, setEditFaqId] = useState<string | null>(null);
  const [deleteFaqId, setDeleteFaqId] = useState<string | null>(null);

  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [editPolicyId, setEditPolicyId] = useState<string | null>(null);
  const [deletePolicyId, setDeletePolicyId] = useState<string | null>(null);

  const { data: faqsRes, isLoading: faqLoading } = useQuery({
    queryKey: ['admin', 'faqs'],
    queryFn: () => publicApi.faqs.listAdmin().then((r) => r.data),
  });

  const { data: policiesRes, isLoading: polLoading } = useQuery({
    queryKey: ['admin', 'policies'],
    queryFn: () => publicApi.policies.listAdmin().then((r) => r.data),
  });

  const faqList = normalizeList(faqResToItems(faqsRes));
  const policyList = normalizeList(polResToItems(policiesRes));

  const {
    register: regFaq,
    handleSubmit: hsFaq,
    reset: resetFaq,
    formState: { errors: errFaq },
  } = useForm<FaqForm>({ resolver: zodResolver(faqSchema) });

  const {
    register: regPol,
    handleSubmit: hsPol,
    reset: resetPol,
    formState: { errors: errPol },
  } = useForm<PolicyForm>({ resolver: zodResolver(policySchema) });

  const createFaqMut = useMutation({
    mutationFn: (d: FaqForm) =>
      publicApi.faqs.createAdmin({ question: d.question, answer: d.answer, category: d.category, sortOrder: d.sortOrder }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      setShowFaqModal(false);
      resetFaq({ question: '', answer: '', category: '', sortOrder: 0 });
    },
  });

  const updateFaqMut = useMutation({
    mutationFn: (d: FaqForm) =>
      publicApi.faqs.updateAdmin(editFaqId!, { question: d.question, answer: d.answer, category: d.category, sortOrder: d.sortOrder ?? 0 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      setShowFaqModal(false);
      setEditFaqId(null);
    },
  });

  const deleteFaqMut = useMutation({
    mutationFn: (id: string) => publicApi.faqs.deleteAdmin(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      setDeleteFaqId(null);
    },
  });

  const createPolMut = useMutation({
    mutationFn: (d: PolicyForm) =>
      publicApi.policies.createAdmin({ title: d.title, body: d.body, type: d.type, version: d.version }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'policies'] });
      setShowPolicyModal(false);
      resetPol({ title: '', body: '', type: 'cancellation', version: 1 });
    },
  });

  const updatePolMut = useMutation({
    mutationFn: (d: PolicyForm) =>
      publicApi.policies.updateAdmin(editPolicyId!, { title: d.title, body: d.body, type: d.type, version: d.version }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'policies'] });
      setShowPolicyModal(false);
      setEditPolicyId(null);
    },
  });

  const deletePolMut = useMutation({
    mutationFn: (id: string) => publicApi.policies.deleteAdmin(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'policies'] });
      setDeletePolicyId(null);
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ & Kebijakan</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola pertanyaan umum dan kebijakan platform</p>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-6">
            {([
              { key: 'faq' as const, label: 'FAQ', count: faqList.length },
              { key: 'policies' as const, label: 'Kebijakan', count: policyList.length },
            ]).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
                  tab === t.key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${tab === t.key ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {tab === 'faq' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Kelola FAQ yang ditampilkan di halaman publik dan aplikasi mobile</p>
              <button
                onClick={() => { setEditFaqId(null); resetFaq({ question: '', answer: '', category: '', sortOrder: 0 }); setShowFaqModal(true); }}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                + Tambah FAQ
              </button>
            </div>

            {faqLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
                ))}
              </div>
            ) : faqList.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
                <p className="text-gray-500">Belum ada FAQ</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Pertanyaan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Urutan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {faqList.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50">
                        <td className="max-w-xs px-6 py-4">
                          <p className="text-sm font-medium text-gray-900 truncate">{f.question}</p>
                          <p className="mt-1 text-xs text-gray-500 truncate max-w-xs">{f.answer}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">{f.category || 'umum'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f.sortOrder ?? 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${f.isActive !== false ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {f.isActive !== false ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditFaqId(f.id);
                                resetFaq({ question: f.question, answer: f.answer, category: f.category, sortOrder: f.sortOrder ?? 0 });
                                setShowFaqModal(true);
                              }}
                              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteFaqId(f.id)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'policies' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Kelola kebijakan pembatalan, privasi, dan syarat penggunaan</p>
              <button
                onClick={() => { setEditPolicyId(null); resetPol({ title: '', body: '', type: 'cancellation', version: 1 }); setShowPolicyModal(true); }}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                + Tambah Kebijakan
              </button>
            </div>

            {polLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
                ))}
              </div>
            ) : policyList.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
                <p className="text-gray-500">Belum ada kebijakan</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Judul</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tipe</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Versi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {policyList.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="max-w-xs px-6 py-4">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                          <p className="mt-1 text-xs text-gray-500 truncate max-w-xs">{p.body}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700">{p.type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">v{p.version ?? 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.isActive !== false ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {p.isActive !== false ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditPolicyId(p.id);
                                resetPol({ title: p.title, body: p.body, type: p.type, version: p.version ?? 1 });
                                setShowPolicyModal(true);
                              }}
                              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeletePolicyId(p.id)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{editFaqId ? 'Edit FAQ' : 'Tambah FAQ'}</h2>
              <button onClick={() => { setShowFaqModal(false); setEditFaqId(null); }} className="text-xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={hsFaq((d) => (editFaqId ? updateFaqMut.mutate(d) : createFaqMut.mutate(d)))} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Pertanyaan</label>
                <input {...regFaq('question')} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
                {errFaq.question && <p className="mt-1 text-sm text-red-600">{errFaq.question.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Jawaban</label>
                <textarea {...regFaq('answer')} rows={4} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
                {errFaq.answer && <p className="mt-1 text-sm text-red-600">{errFaq.answer.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kategori</label>
                  <input {...regFaq('category')} placeholder="booking / pembayaran / kalender" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Urutan</label>
                  <input type="number" {...regFaq('sortOrder', { valueAsNumber: true })} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowFaqModal(false); setEditFaqId(null); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={createFaqMut.isPending || updateFaqMut.isPending} className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
                  {createFaqMut.isPending || updateFaqMut.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{editPolicyId ? 'Edit Kebijakan' : 'Tambah Kebijakan'}</h2>
              <button onClick={() => { setShowPolicyModal(false); setEditPolicyId(null); }} className="text-xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={hsPol((d) => (editPolicyId ? updatePolMut.mutate(d) : createPolMut.mutate(d)))} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Judul</label>
                <input {...regPol('title')} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
                {errPol.title && <p className="mt-1 text-sm text-red-600">{errPol.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Isi</label>
                <textarea {...regPol('body')} rows={4} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
                {errPol.body && <p className="mt-1 text-sm text-red-600">{errPol.body.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipe</label>
                  <input {...regPol('type')} placeholder="cancellation / privacy / terms" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
                  {errPol.type && <p className="mt-1 text-sm text-red-600">{errPol.type.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Versi</label>
                  <input type="number" {...regPol('version', { valueAsNumber: true })} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowPolicyModal(false); setEditPolicyId(null); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={createPolMut.isPending || updatePolMut.isPending} className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
                  {createPolMut.isPending || updatePolMut.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete FAQ Confirmation */}
      {deleteFaqId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Hapus FAQ?</h3>
            <p className="mt-2 text-sm text-gray-500">FAQ ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => setDeleteFaqId(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Batal</button>
              <button onClick={() => deleteFaqMut.mutate(deleteFaqId)} disabled={deleteFaqMut.isPending} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {deleteFaqMut.isPending ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Policy Confirmation */}
      {deletePolicyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Hapus Kebijakan?</h3>
            <p className="mt-2 text-sm text-gray-500">Kebijakan ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => setDeletePolicyId(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Batal</button>
              <button onClick={() => deletePolMut.mutate(deletePolicyId)} disabled={deletePolMut.isPending} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {deletePolMut.isPending ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// Helpers to normalize API response into arrays
function faqResToItems(res: unknown): unknown[] {
  if (!res) return [];
  const d = (res as { data?: unknown })?.data;
  return Array.isArray(d) ? d : Array.isArray(res) ? (res as unknown[]) : [];
}

function polResToItems(res: unknown): unknown[] {
  if (!res) return [];
  const d = (res as { data?: unknown })?.data;
  return Array.isArray(d) ? d : Array.isArray(res) ? (res as unknown[]) : [];
}

function normalizeList(items: unknown[]) {
  return items as { id: string; question?: string; answer?: string; category?: string; sortOrder?: number; title?: string; body?: string; type?: string; version?: number; isActive?: boolean }[];
}
