import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SupportPage from '../SupportPage';

const mockFaqs = [
  { id: 'f1', question: 'Bagaimana cara booking?', answer: 'Pilih provider, pilih layanan, pilih jadwal, lalu konfirmasi.', category: 'Booking' },
  { id: 'f2', question: 'Bagaimana cara membatalkan booking?', answer: 'Buka halaman booking, pilih booking yang ingin dibatalkan, lalu klik Batalkan.', category: 'Booking' },
  { id: 'f3', question: 'Metode pembayaran apa yang diterima?', answer: 'Kami menerima pembayaran melalui kartu kredit, debit, dan transfer bank.', category: 'Pembayaran' },
  { id: 'f4', question: 'Bagaimana cara mengubah profil?', answer: 'Buka halaman Akun, klik Edit Profil, ubah data yang diperlukan, lalu Simpan.', category: 'Akun' },
  { id: 'f5', question: 'Apa itu poin loyalitas?', answer: 'Poin loyalitas didapat dari setiap booking dan bisa ditukarkan dengan diskon.', category: 'Umum' },
];

const mockPolicies = [
  { id: 'p1', title: 'Kebijakan Pembatalan', body: 'Pembatalan gratis jika dilakukan 24 jam sebelum jadwal booking.', type: 'Pembatalan', version: '1.0' },
  { id: 'p2', title: 'Kebijakan Privasi', body: 'Data pribadi Anda aman dan tidak akan dibagikan ke pihak ketiga.', type: 'Privasi', version: '2.1' },
];

vi.mock('../../../lib/api', () => ({
  publicApi: {
    faqs: { listPublic: vi.fn() },
    policies: { listPublic: vi.fn() },
  },
  api: { post: vi.fn() },
}));

vi.mock('../../../components/CustomerLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="customer-layout">{children}</div>,
}));

import { publicApi, api } from '../../../lib/api';

let queryClient: QueryClient;

function renderSupport() {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, cacheTime: 0 } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <SupportPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('SupportPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders Bantuan & Dukungan heading and subtitle', async () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: mockFaqs });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: mockPolicies });
    renderSupport();
    await waitFor(() => {
      expect(screen.getByText('Bantuan & Dukungan')).toBeInTheDocument();
      expect(screen.getByText('Temukan jawaban atas pertanyaan Anda atau hubungi tim kami.')).toBeInTheDocument();
    });
  });

  it('renders CustomerLayout', async () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: [] });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: [] });
    renderSupport();
    await waitFor(() => {
      expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
    });
  });

  it('renders quick links section', async () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: [] });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: [] });
    renderSupport();
    await waitFor(() => {
      expect(screen.getByText('FAQ')).toBeInTheDocument();
      expect(screen.getByText('Pertanyaan yang sering ditanyakan')).toBeInTheDocument();
      expect(screen.getAllByText('Kebijakan').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Ketentuan & aturan platform')).toBeInTheDocument();
      expect(screen.getAllByText('Hubungi Kami').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Kirim pesan ke tim support')).toBeInTheDocument();
      expect(screen.getByText('Chat')).toBeInTheDocument();
      expect(screen.getByText('Mulai chat dengan support')).toBeInTheDocument();
    });
  });

  it('renders FAQ section heading and question count', async () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: mockFaqs });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: [] });
    renderSupport();
    await waitFor(() => {
      expect(screen.getByText('Pertanyaan Umum')).toBeInTheDocument();
      expect(screen.getByText('5 pertanyaan')).toBeInTheDocument();
    });
  });

  it('renders FAQ category filter chips', async () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: mockFaqs });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: [] });
    renderSupport();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Semua' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Umum' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Booking' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Pembayaran' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Akun' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Teknis' })).toBeInTheDocument();
    });
  });

  it('renders FAQ questions with categories', async () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: mockFaqs });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: [] });
    renderSupport();
    await waitFor(() => {
      expect(screen.getByText('Bagaimana cara booking?')).toBeInTheDocument();
      expect(screen.getByText('Bagaimana cara membatalkan booking?')).toBeInTheDocument();
      expect(screen.getByText('Metode pembayaran apa yang diterima?')).toBeInTheDocument();
    });
  });

  it('expands FAQ when clicked and shows answer', async () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: mockFaqs });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: [] });
    renderSupport();
    await waitFor(() => {
      expect(screen.getByText('Bagaimana cara booking?')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Bagaimana cara booking?'));
    await waitFor(() => {
      expect(screen.getByText('Pilih provider, pilih layanan, pilih jadwal, lalu konfirmasi.')).toBeInTheDocument();
    });
  });

  it('filters FAQs by category', async () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: mockFaqs });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: [] });
    renderSupport();
    await waitFor(() => {
      expect(screen.getByText('Bagaimana cara booking?')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Pembayaran' }));
    await waitFor(() => {
      expect(screen.getByText('Metode pembayaran apa yang diterima?')).toBeInTheDocument();
      expect(screen.queryByText('Bagaimana cara booking?')).not.toBeInTheDocument();
    });
  });

  it('searches FAQs by keyword', async () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: mockFaqs });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: [] });
    renderSupport();
    await waitFor(() => {
      expect(screen.getByText('Bagaimana cara booking?')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Cari pertanyaan, topik, atau kata kunci...');
    await userEvent.type(searchInput, 'loyalitas');
    await waitFor(() => {
      expect(screen.getByText('Apa itu poin loyalitas?')).toBeInTheDocument();
      expect(screen.queryByText('Bagaimana cara booking?')).not.toBeInTheDocument();
    });
  });

  it('renders policies section', async () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: [] });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: mockPolicies });
    renderSupport();
    await waitFor(() => {
      expect(screen.getAllByText('Kebijakan').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Kebijakan Pembatalan')).toBeInTheDocument();
      expect(screen.getByText('Kebijakan Privasi')).toBeInTheDocument();
      expect(screen.getByText('Pembatalan gratis jika dilakukan 24 jam sebelum jadwal booking.')).toBeInTheDocument();
    });
  });

  it('renders policy version', async () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: [] });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: mockPolicies });
    renderSupport();
    await waitFor(() => {
      expect(screen.getByText('v1.0')).toBeInTheDocument();
      expect(screen.getByText('v2.1')).toBeInTheDocument();
    });
  });

  it('renders contact form with all fields', async () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: [] });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: [] });
    renderSupport();
    await waitFor(() => {
      expect(screen.getByLabelText('Subjek')).toBeInTheDocument();
      expect(screen.getByLabelText('Kategori')).toBeInTheDocument();
      expect(screen.getByLabelText('Pesan')).toBeInTheDocument();
      expect(screen.getByText('Lampiran (opsional)')).toBeInTheDocument();
      expect(screen.getByText('Kirim Pesan')).toBeInTheDocument();
    });
  });

  it('shows validation errors when submitting empty form', async () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: [] });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: [] });
    renderSupport();
    await waitFor(() => {
      expect(screen.getByText('Kirim Pesan')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Kirim Pesan'));
    await waitFor(() => {
      expect(screen.getByText('Subjek minimal 5 karakter')).toBeInTheDocument();
      expect(screen.getByText('Pesan minimal 10 karakter')).toBeInTheDocument();
    });
  });

  it('shows empty FAQ state when search matches nothing', async () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: mockFaqs });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: [] });
    renderSupport();
    await waitFor(() => {
      expect(screen.getByText('Bagaimana cara booking?')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Cari pertanyaan, topik, atau kata kunci...');
    await userEvent.type(searchInput, 'xyznonexistent');
    await waitFor(() => {
      expect(screen.getByText('Tidak ada pertanyaan yang cocok.')).toBeInTheDocument();
    });
  });

  it('shows empty policies state when no policies', async () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: [] });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: [] });
    renderSupport();
    await waitFor(() => {
      expect(screen.getByText('Belum ada kebijakan.')).toBeInTheDocument();
    });
  });

  it('shows loading skeletons for FAQ and policies', () => {
    (publicApi.faqs.listPublic as any).mockReturnValue(new Promise(() => {}));
    (publicApi.policies.listPublic as any).mockReturnValue(new Promise(() => {}));
    const { container } = renderSupport();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders search input in header', async () => {
    (publicApi.faqs.listPublic as any).mockResolvedValue({ data: [] });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: [] });
    renderSupport();
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Cari pertanyaan, topik, atau kata kunci...');
      expect(searchInput).toBeInTheDocument();
    });
  });
});
