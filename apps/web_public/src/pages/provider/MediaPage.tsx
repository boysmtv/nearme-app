import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaApi } from '../../lib/api';
import ProviderLayout from '../../components/ProviderLayout';

export default function MediaPage() {
  const qc = useQueryClient();
  const { data: res, isLoading } = useQuery({
    queryKey: ['providerMedia'],
    queryFn: () => mediaApi.list(),
  });
  const items = (res as unknown as { data: { id: string; url: string; fileName: string; sortOrder: number; ownerType: string }[] })?.data ?? [];

  const [dragged, setDragged] = useState<string | null>(null);

  const uploadMut = useMutation({
    mutationFn: async (file: File) => {
      // provider gallery: ownerType provider, ownerId omitted -> server will use tenantId as ownerId
      return mediaApi.upload(file, 'provider');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['providerMedia'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => mediaApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['providerMedia'] }),
  });

  const reorderMut = useMutation({
    mutationFn: (orderedIds: string[]) => mediaApi.reorder(orderedIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['providerMedia'] }),
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 8).forEach((f) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
        alert(`Unsupported type: ${f.type}`);
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        alert('File too large max 10MB');
        return;
      }
      uploadMut.mutate(f);
    });
  };

  const onDragStart = (id: string) => setDragged(id);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (targetId: string) => {
    if (!dragged || dragged === targetId) return;
    const ids = items.map((i) => i.id);
    const from = ids.indexOf(dragged);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) return;
    const reordered = [...ids];
    reordered.splice(from, 1);
    reordered.splice(to, 0, dragged);
    reorderMut.mutate(reordered);
    setDragged(null);
  };

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galeri</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola foto galeri provider (drag untuk reorder) — POST /media/upload, GET /provider/media, DELETE /provider/media/{'{id}'}, PUT /provider/media/reorder</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <label className="block text-sm font-medium text-gray-700">Upload foto (jpeg/png/webp, max 10MB)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
            className="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
          />
          {uploadMut.isPending && <p className="mt-2 text-sm text-primary-600">Uploading...</p>}
          {uploadMut.isError && <p className="mt-2 text-sm text-red-600">{(uploadMut.error as Error).message}</p>}
          {uploadMut.isSuccess && <p className="mt-2 text-sm text-green-600">Upload berhasil</p>}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
            <p className="text-gray-500">Belum ada foto. Upload foto pertama Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => onDragStart(item.id)}
                onDragOver={onDragOver}
                onDrop={() => onDrop(item.id)}
                className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200"
              >
                <img src={item.url} alt={item.fileName} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <button
                  onClick={() => { if (confirm('Hapus foto ini?')) deleteMut.mutate(item.id); }}
                  className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-red-600 shadow hover:bg-white"
                  aria-label="Delete"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white">#{item.sortOrder}</div>
                <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white">{item.ownerType}</div>
              </div>
            ))}
          </div>
        )}
        {reorderMut.isPending && <p className="text-sm text-primary-600">Reordering...</p>}
        <p className="text-xs text-gray-400">Drag & drop untuk reorder — akan PUT /provider/media/reorder dengan orderedIds</p>
      </div>
    </ProviderLayout>
  );
}
