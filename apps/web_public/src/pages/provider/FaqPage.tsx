import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { publicApi } from '../../lib/api';
import ProviderLayout from '../../components/ProviderLayout';

const faqSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(10),
  category: z.string().optional(),
  sortOrder: z.number().optional(),
});

type FaqForm = z.infer<typeof faqSchema>;

export default function FaqPage() {
  const qc = useQueryClient();
  const [showFaq, setShowFaq] = useState(false);
  const [editFaq, setEditFaq] = useState<{ id: string } | null>(null);

  const [showPolicy, setShowPolicy] = useState(false);
  const [editPolicy, setEditPolicy] = useState<{ id: string } | null>(null);

  const { data: faqsRes, isLoading: faqLoading } = useQuery({
    queryKey: ['provider-faqs'],
    queryFn: () => publicApi.faqs.listProvider().then((r) => r.data),
  });
  const { data: policiesRes, isLoading: polLoading } = useQuery({
    queryKey: ['provider-policies'],
    queryFn: () => publicApi.policies.listProvider().then((r) => r.data),
  });

  const faqs = (faqsRes as unknown as { data?: unknown[] })?.data ?? (faqsRes as unknown as unknown[] | undefined) ?? [];
  const policies = (policiesRes as unknown as { data?: unknown[] })?.data ?? (policiesRes as unknown as unknown[] | undefined) ?? [];
  // normalize: if array directly
  const faqList = Array.isArray(faqs) ? faqs as { id: string; question: string; answer: string; category?: string; sortOrder?: number; isActive?: boolean }[] : [];
  const policyList = Array.isArray(policies) ? policies as { id: string; title: string; body: string; type: string; version?: number; isActive?: boolean }[] : [];

  const { register: regFaq, handleSubmit: hsFaq, reset: resetFaq, formState: { errors: errFaq } } = useForm<FaqForm>({ resolver: zodResolver(faqSchema) });
  const createFaqMut = useMutation({
    mutationFn: (d: FaqForm) => publicApi.faqs.createProvider({ question: d.question, answer: d.answer, category: d.category, sortOrder: d.sortOrder }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['provider-faqs'] }); setShowFaq(false); },
  });
  const updateFaqMut = useMutation({
    mutationFn: (d: FaqForm) => publicApi.faqs.updateProvider(editFaq!.id, { question: d.question, answer: d.answer, category: d.category, sortOrder: d.sortOrder }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['provider-faqs'] }); setShowFaq(false); setEditFaq(null); },
  });
  const deleteFaqMut = useMutation({
    mutationFn: (id: string) => publicApi.faqs.deleteProvider(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provider-faqs'] }),
  });

  const policySchema = z.object({ title: z.string().min(3), body: z.string().min(10), type: z.string().min(2), version: z.number().optional() });
  type PolicyForm = z.infer<typeof policySchema>;
  const { register: regPol, handleSubmit: hsPol, reset: resetPol, formState: { errors: errPol } } = useForm<PolicyForm>({ resolver: zodResolver(policySchema) });
  const createPolMut = useMutation({
    mutationFn: (d: PolicyForm) => publicApi.policies.createProvider({ title: d.title, body: d.body, type: d.type, version: d.version }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['provider-policies'] }); setShowPolicy(false); },
  });
  const updatePolMut = useMutation({
    mutationFn: (d: PolicyForm) => publicApi.policies.updateProvider(editPolicy!.id, { title: d.title, body: d.body, type: d.type, version: d.version }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['provider-policies'] }); setShowPolicy(false); setEditPolicy(null); },
  });
  const deletePolMut = useMutation({
    mutationFn: (id: string) => publicApi.policies.deleteProvider(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provider-policies'] }),
  });

  return (
    <ProviderLayout>
      <div className="space-y-10">
        {/* FAQ */}
        <div>
          <div className="flex items-center justify-between">
            <div><h1 className="text-2xl font-bold text-gray-900">FAQ</h1><p className="mt-1 text-sm text-gray-500">Kelola pertanyaan yang sering diajukan oleh pelanggan</p></div>
            <button onClick={() => { setEditFaq(null); resetFaq({ question: '', answer: '', category: '', sortOrder: 0 }); setShowFaq(true); }} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">+ Tambah FAQ</button>
          </div>
          <div className="mt-6">
            {faqLoading ? <div className="animate-pulse h-20 bg-white rounded-xl" /> : faqList.length === 0 ? <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100"><p className="text-gray-500">Belum ada FAQ</p></div> : (
              <div className="space-y-3">
                {faqList.map((f) => (
                  <div key={f.id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                    <div className="flex justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{f.question}</h3>
                        <p className="mt-1 text-sm text-gray-600">{f.answer}</p>
                        <div className="mt-2 flex gap-2 text-xs text-gray-400"><span className="rounded-full bg-gray-100 px-2 py-0.5">{f.category || 'umum'}</span><span>order {f.sortOrder ?? 0}</span><span>{f.isActive === false ? 'Nonaktif' : 'Aktif'}</span></div>
                      </div>
                      <div className="flex gap-2 self-start">
                        <button onClick={() => { setEditFaq({ id: f.id }); resetFaq({ question: f.question, answer: f.answer, category: f.category, sortOrder: f.sortOrder ?? 0 }); setShowFaq(true); }} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Edit</button>
                        <button onClick={() => { if (confirm('Hapus FAQ?')) deleteFaqMut.mutate(f.id); }} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">Hapus</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Policies */}
        <div>
          <div className="flex items-center justify-between">
            <div><h1 className="text-2xl font-bold text-gray-900">Kebijakan</h1><p className="mt-1 text-sm text-gray-500">Kelola kebijakan deposit, pembatalan, dan ketentuan lainnya</p></div>
            <button onClick={() => { setEditPolicy(null); resetPol({ title: '', body: '', type: 'cancellation', version: 1 }); setShowPolicy(true); }} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">+ Tambah Kebijakan</button>
          </div>
          <div className="mt-6">
            {polLoading ? <div className="animate-pulse h-20 bg-white rounded-xl" /> : policyList.length === 0 ? <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100"><p className="text-gray-500">Belum ada kebijakan</p></div> : (
              <div className="space-y-3">
                {policyList.map((p) => (
                  <div key={p.id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                    <div className="flex justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2"><span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">{p.type}</span><span className="text-xs text-gray-400">v{p.version ?? 1}</span></div>
                        <h3 className="mt-2 font-semibold text-gray-900">{p.title}</h3>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-3">{p.body}</p>
                      </div>
                      <div className="flex gap-2 self-start">
                        <button onClick={() => { setEditPolicy({ id: p.id }); resetPol({ title: p.title, body: p.body, type: p.type, version: p.version ?? 1 }); setShowPolicy(true); }} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Edit</button>
                        <button onClick={() => { if (confirm('Hapus kebijakan?')) deletePolMut.mutate(p.id); }} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">Hapus</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Modal */}
      {showFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{editFaq ? 'Edit FAQ' : 'Tambah FAQ'}</h2><button onClick={() => { setShowFaq(false); setEditFaq(null); }} className="text-xl text-gray-400">&times;</button></div>
            <form onSubmit={hsFaq((d) => editFaq ? updateFaqMut.mutate(d) : createFaqMut.mutate(d))} className="mt-6 space-y-4">
              <div><label className="block text-sm font-medium">Pertanyaan</label><input {...regFaq('question')} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />{errFaq.question && <p className="text-sm text-red-600">{errFaq.question.message}</p>}</div>
              <div><label className="block text-sm font-medium">Jawaban</label><textarea {...regFaq('answer')} rows={4} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />{errFaq.answer && <p className="text-sm text-red-600">{errFaq.answer.message}</p>}</div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium">Kategori</label><input {...regFaq('category')} placeholder="booking / pembayaran / kalender" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium">Urutan</label><input type="number" {...regFaq('sortOrder', { valueAsNumber: true })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
              </div>
              <div className="flex justify-end gap-3"><button type="button" onClick={() => { setShowFaq(false); setEditFaq(null); }} className="rounded-lg border px-4 py-2 text-sm">Batal</button><button type="submit" disabled={createFaqMut.isPending || updateFaqMut.isPending} className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white disabled:opacity-50">{createFaqMut.isPending || updateFaqMut.isPending ? 'Menyimpan...' : 'Simpan'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {showPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{editPolicy ? 'Edit Kebijakan' : 'Tambah Kebijakan'}</h2><button onClick={() => { setShowPolicy(false); setEditPolicy(null); }} className="text-xl text-gray-400">&times;</button></div>
            <form onSubmit={hsPol((d) => editPolicy ? updatePolMut.mutate(d) : createPolMut.mutate(d))} className="mt-6 space-y-4">
              <div><label className="block text-sm font-medium">Judul</label><input {...regPol('title')} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />{errPol.title && <p className="text-sm text-red-600">{errPol.title.message}</p>}</div>
              <div><label className="block text-sm font-medium">Isi</label><textarea {...regPol('body')} rows={4} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />{errPol.body && <p className="text-sm text-red-600">{errPol.body.message}</p>}</div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium">Tipe</label><input {...regPol('type')} placeholder="cancellation / privacy / terms" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium">Versi</label><input type="number" {...regPol('version', { valueAsNumber: true })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
              </div>
              <div className="flex justify-end gap-3"><button type="button" onClick={() => { setShowPolicy(false); setEditPolicy(null); }} className="rounded-lg border px-4 py-2 text-sm">Batal</button><button type="submit" disabled={createPolMut.isPending || updatePolMut.isPending} className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white disabled:opacity-50">{createPolMut.isPending || updatePolMut.isPending ? 'Menyimpan...' : 'Simpan'}</button></div>
            </form>
          </div>
        </div>
      )}
    </ProviderLayout>
  );
}
