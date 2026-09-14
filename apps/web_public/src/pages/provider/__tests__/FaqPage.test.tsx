import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FaqPage from '../FaqPage';

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' }, logout: vi.fn() }),
}));

const mockFaqList = vi.fn();
const mockFaqCreate = vi.fn();
const mockFaqUpdate = vi.fn();
const mockFaqDelete = vi.fn();
const mockPolicyList = vi.fn();
const mockPolicyCreate = vi.fn();
const mockPolicyUpdate = vi.fn();
const mockPolicyDelete = vi.fn();

vi.mock('../../../lib/api', () => ({
  publicApi: {
    faqs: {
      listProvider: (...args: unknown[]) => mockFaqList(...args),
      createProvider: (...args: unknown[]) => mockFaqCreate(...args),
      updateProvider: (...args: unknown[]) => mockFaqUpdate(...args),
      deleteProvider: (...args: unknown[]) => mockFaqDelete(...args),
    },
    policies: {
      listProvider: (...args: unknown[]) => mockPolicyList(...args),
      createProvider: (...args: unknown[]) => mockPolicyCreate(...args),
      updateProvider: (...args: unknown[]) => mockPolicyUpdate(...args),
      deleteProvider: (...args: unknown[]) => mockPolicyDelete(...args),
    },
  },
}));

vi.mock('../../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="provider-layout">{children}</div>,
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <FaqPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('FaqPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFaqList.mockResolvedValue({ data: [] });
    mockPolicyList.mockResolvedValue({ data: [] });
  });

  it('renders FAQ heading', async () => {
    renderPage();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  it('renders Kebijakan heading', async () => {
    renderPage();
    expect(screen.getByText('Kebijakan')).toBeInTheDocument();
  });

  it('renders ProviderLayout', async () => {
    renderPage();
    expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
  });

  it('shows empty state when no FAQs', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Belum ada FAQ')).toBeInTheDocument();
    });
  });

  it('shows empty state when no policies', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Belum ada kebijakan')).toBeInTheDocument();
    });
  });

  it('renders FAQ list when data is available', async () => {
    mockFaqList.mockResolvedValue({
      data: [{ id: 'f1', question: 'Bagaimana cara booking?', answer: 'Klik booking pada layanan yang diinginkan', category: 'booking', sortOrder: 1, isActive: true }],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Bagaimana cara booking?')).toBeInTheDocument();
    });
    expect(screen.getByText('Klik booking pada layanan yang diinginkan')).toBeInTheDocument();
  });

  it('renders policy list when data is available', async () => {
    mockPolicyList.mockResolvedValue({
      data: [{ id: 'p1', title: 'Kebijakan Pembatalan', body: 'Pembatalan harus 24 jam sebelum jadwal', type: 'cancellation', version: 1, isActive: true }],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Kebijakan Pembatalan')).toBeInTheDocument();
    });
    expect(screen.getByText('Pembatalan harus 24 jam sebelum jadwal')).toBeInTheDocument();
  });

  it('add FAQ button opens modal and create FAQ', async () => {
    mockFaqCreate.mockResolvedValue({ success: true });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Belum ada FAQ')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText(/tambah faq/i));
    await waitFor(() => { expect(screen.getByText('Tambah FAQ')).toBeInTheDocument(); });
    const questionInput = document.querySelector('input[name="question"]') as HTMLInputElement;
    const answerInput = document.querySelector('textarea[name="answer"]') as HTMLInputElement;
    fireEvent.change(questionInput, { target: { value: 'Apa itu DEKAT?' } });
    fireEvent.change(answerInput, { target: { value: 'DEKAT adalah platform booking layanan lokal' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan$/i }));
    await waitFor(() => {
      expect(mockFaqCreate).toHaveBeenCalledWith(expect.objectContaining({ question: 'Apa itu DEKAT?' }));
    });
  });

  it('edit FAQ button opens pre-filled modal and update', async () => {
    mockFaqList.mockResolvedValue({
      data: [{ id: 'f1', question: 'Old question?', answer: 'Old answer here', category: 'general', sortOrder: 1, isActive: true }],
    });
    mockFaqUpdate.mockResolvedValue({ success: true });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Old question?')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Edit'));
    await waitFor(() => { expect(screen.getByText('Edit FAQ')).toBeInTheDocument(); });
    const questionInput = document.querySelector('input[name="question"]') as HTMLInputElement;
    expect(questionInput.value).toBe('Old question?');
    fireEvent.change(questionInput, { target: { value: 'Updated question?' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan$/i }));
    await waitFor(() => {
      expect(mockFaqUpdate).toHaveBeenCalledWith('f1', expect.objectContaining({ question: 'Updated question?' }));
    });
  });

  it('delete FAQ calls API after confirm', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockFaqList.mockResolvedValue({
      data: [{ id: 'f1', question: 'Delete me?', answer: 'Answer', category: 'test', sortOrder: 1, isActive: true }],
    });
    mockFaqDelete.mockResolvedValue({ success: true });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Delete me?')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Hapus'));
    await waitFor(() => {
      expect(mockFaqDelete).toHaveBeenCalledWith('f1');
    });
    vi.restoreAllMocks();
  });

  it('create policy modal opens and creates policy', async () => {
    mockPolicyCreate.mockResolvedValue({ success: true });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Belum ada kebijakan')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText(/tambah kebijakan/i));
    await waitFor(() => { expect(screen.getByText('Tambah Kebijakan')).toBeInTheDocument(); });
    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
    const bodyInput = document.querySelector('textarea[name="body"]') as HTMLInputElement;
    const typeInput = document.querySelector('input[name="type"]') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Judul Kebijakan' } });
    fireEvent.change(bodyInput, { target: { value: 'Isi kebijakan yang cukup panjang untuk validasi' } });
    fireEvent.change(typeInput, { target: { value: 'cancellation' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan$/i }));
    await waitFor(() => {
      expect(mockPolicyCreate).toHaveBeenCalledWith(expect.objectContaining({ title: 'Judul Kebijakan' }));
    });
  });

  it('edit policy opens pre-filled modal and updates', async () => {
    mockPolicyList.mockResolvedValue({
      data: [{ id: 'p1', title: 'Old Policy', body: 'Old policy body text here', type: 'cancellation', version: 1, isActive: true }],
    });
    mockPolicyUpdate.mockResolvedValue({ success: true });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Old Policy')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Edit'));
    await waitFor(() => { expect(screen.getByText('Edit Kebijakan')).toBeInTheDocument(); });
    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
    expect(titleInput.value).toBe('Old Policy');
    fireEvent.change(titleInput, { target: { value: 'Updated Policy' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan$/i }));
    await waitFor(() => {
      expect(mockPolicyUpdate).toHaveBeenCalledWith('p1', expect.objectContaining({ title: 'Updated Policy' }));
    });
  });

  it('delete policy calls API after confirm', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockPolicyList.mockResolvedValue({
      data: [{ id: 'p1', title: 'Delete Policy', body: 'Body text here', type: 'terms', version: 1, isActive: true }],
    });
    mockPolicyDelete.mockResolvedValue({ success: true });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Delete Policy')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Hapus'));
    await waitFor(() => {
      expect(mockPolicyDelete).toHaveBeenCalledWith('p1');
    });
    vi.restoreAllMocks();
  });

  it('modal close button works', async () => {
    renderPage();
    await waitFor(() => { expect(screen.getByText('Belum ada FAQ')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText(/tambah faq/i));
    await waitFor(() => { expect(screen.getByText('Tambah FAQ')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('\u00d7'));
    await waitFor(() => { expect(screen.queryByText('Tambah FAQ')).not.toBeInTheDocument(); });
  });
});
