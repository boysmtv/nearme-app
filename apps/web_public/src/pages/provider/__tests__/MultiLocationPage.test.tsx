import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MultiLocationPage from '../MultiLocationPage';

vi.mock('../../../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

import { api } from '../../../lib/api';

const mockGet = api.get as ReturnType<typeof vi.fn>;
const mockPost = api.post as ReturnType<typeof vi.fn>;
const mockPut = api.put as ReturnType<typeof vi.fn>;
const mockDelete = api.delete as ReturnType<typeof vi.fn>;

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <MultiLocationPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const mainLoc = { id: 'l1', name: 'Cabang Utama', address: 'Jl. Sudirman 10', phone: '08123456', latitude: -6.2, longitude: 106.8, isMain: true, staffCount: 5, bookingCount: 120 };
const branchLoc = { id: 'l2', name: 'Cabang Blok M', address: 'Jl. Blok M 5', phone: '08129999', latitude: -6.3, longitude: 106.79, isMain: false, staffCount: 3, bookingCount: 40 };

describe('MultiLocationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: [] });
    mockPost.mockResolvedValue({ data: { id: 'l9' } });
    mockPut.mockResolvedValue({ data: { id: 'l1' } });
    mockDelete.mockResolvedValue({ data: {} });
  });

  it('renders heading', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /multi-lokasi/i })).toBeInTheDocument();
  });

  it('shows empty state when no locations', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/belum ada lokasi tambahan/i)).toBeInTheDocument();
    });
  });

  it('renders location cards when data exists', async () => {
    mockGet.mockResolvedValue({
      data: [{ id: 'l1', name: 'Cabang Utama', address: 'Jl. Sudirman 10', phone: '08123456', isMain: true, staffCount: 5, bookingCount: 120 }],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Cabang Utama')).toBeInTheDocument();
    });
    expect(screen.getByText('Jl. Sudirman 10')).toBeInTheDocument();
  });

  it('shows Tambah Lokasi button', async () => {
    renderPage();
    expect(screen.getByRole('button', { name: /tambah lokasi/i })).toBeInTheDocument();
  });

  it('shows loading skeleton while fetching', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = renderPage();
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(1);
  });

  it('shows Utama badge for main location and hides Hapus', async () => {
    mockGet.mockResolvedValue({ data: [mainLoc, branchLoc] });
    renderPage();
    await waitFor(() => expect(screen.getByText('Cabang Utama')).toBeInTheDocument());
    expect(screen.getByText('Utama')).toBeInTheDocument();
    // only branch has Hapus
    expect(screen.getAllByText('Hapus')).toHaveLength(1);
    expect(screen.getAllByText('Edit')).toHaveLength(2);
  });

  it('opens add form and creates location on submit', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(screen.getByText(/belum ada lokasi tambahan/i)).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /tambah lokasi/i }));
    expect(screen.getByText('Tambah Lokasi', { selector: 'h3' })).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('Contoh: Cabang Utama'), 'Cabang Baru');
    await user.type(screen.getByPlaceholderText('Alamat lengkap'), 'Jl. Baru 1');
    await user.type(screen.getByPlaceholderText('0812xxxx'), '08120000');
    await user.type(screen.getByPlaceholderText('-6.2088'), '-6.21');
    await user.type(screen.getByPlaceholderText('106.8456'), '106.84');
    await user.click(screen.getByText('Simpan'));
    await waitFor(() => expect(mockPost).toHaveBeenCalled());
    expect(mockPost.mock.calls[0][1]).toMatchObject({ name: 'Cabang Baru', latitude: -6.21, longitude: 106.84 });
  });

  it('create falls back lat/long to 0 on invalid input', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(screen.getByText(/belum ada lokasi tambahan/i)).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /tambah lokasi/i }));
    await user.type(screen.getByPlaceholderText('Contoh: Cabang Utama'), 'X');
    await user.type(screen.getByPlaceholderText('Alamat lengkap'), 'Y');
    await user.type(screen.getByPlaceholderText('-6.2088'), 'abc');
    await user.click(screen.getByText('Simpan'));
    await waitFor(() => expect(mockPost).toHaveBeenCalled());
    expect(mockPost.mock.calls[0][1].latitude).toBe(0);
  });

  it('save button disabled when name or address empty', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(screen.getByText(/belum ada lokasi tambahan/i)).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /tambah lokasi/i }));
    expect(screen.getByText('Simpan').closest('button')).toBeDisabled();
  });

  it('edits existing location and calls put', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({ data: [mainLoc] });
    renderPage();
    await waitFor(() => expect(screen.getByText('Cabang Utama')).toBeInTheDocument());
    await user.click(screen.getByText('Edit'));
    expect(screen.getByText('Edit Lokasi', { selector: 'h3' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Cabang Utama')).toBeInTheDocument();
    const nameInput = screen.getByPlaceholderText('Contoh: Cabang Utama');
    await user.clear(nameInput);
    await user.type(nameInput, 'Cabang Update');
    await user.click(screen.getByText('Simpan'));
    await waitFor(() => expect(mockPut).toHaveBeenCalledWith('/provider/locations/l1', expect.objectContaining({ name: 'Cabang Update' })));
  });

  it('deletes non-main location', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({ data: [branchLoc] });
    renderPage();
    await waitFor(() => expect(screen.getByText('Cabang Blok M')).toBeInTheDocument());
    await user.click(screen.getByText('Hapus'));
    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith('/provider/locations/l2'));
  });

  it('cancel button closes form', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(screen.getByText(/belum ada lokasi tambahan/i)).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /tambah lokasi/i }));
    expect(screen.getByText('Tambah Lokasi', { selector: 'h3' })).toBeInTheDocument();
    await user.click(screen.getByText('Batal'));
    await waitFor(() => expect(screen.queryByPlaceholderText('Contoh: Cabang Utama')).not.toBeInTheDocument());
  });

  it('shows Menyimpan state while creating', async () => {
    const user = userEvent.setup();
    mockPost.mockReturnValue(new Promise(() => {}));
    renderPage();
    await waitFor(() => expect(screen.getByText(/belum ada lokasi tambahan/i)).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /tambah lokasi/i }));
    await user.type(screen.getByPlaceholderText('Contoh: Cabang Utama'), 'Z');
    await user.type(screen.getByPlaceholderText('Alamat lengkap'), 'W');
    await user.click(screen.getByText('Simpan'));
    await waitFor(() => expect(screen.getByText('Menyimpan...')).toBeInTheDocument());
  });

  it('closes form when clicking backdrop overlay', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(screen.getByText(/belum ada lokasi tambahan/i)).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /tambah lokasi/i }));
    expect(screen.getByText('Tambah Lokasi', { selector: 'h3' })).toBeInTheDocument();
    const overlay = document.querySelector('div.fixed.inset-0') as HTMLElement;
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay);
    await waitFor(() => expect(screen.queryByPlaceholderText('Contoh: Cabang Utama')).not.toBeInTheDocument());
  });
});
