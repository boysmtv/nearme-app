import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FaqsPage from '../FaqsPage';

const { mockFaqList, mockFaqCreate, mockFaqUpdate, mockFaqDelete, mockPolicyList, mockPolicyCreate, mockPolicyUpdate, mockPolicyDelete } = vi.hoisted(() => ({
  mockFaqList: vi.fn(),
  mockFaqCreate: vi.fn(),
  mockFaqUpdate: vi.fn(),
  mockFaqDelete: vi.fn(),
  mockPolicyList: vi.fn(),
  mockPolicyCreate: vi.fn(),
  mockPolicyUpdate: vi.fn(),
  mockPolicyDelete: vi.fn(),
}));

vi.mock('../../../lib/api', () => ({
  publicApi: {
    faqs: {
      listAdmin: mockFaqList,
      createAdmin: mockFaqCreate,
      updateAdmin: mockFaqUpdate,
      deleteAdmin: mockFaqDelete,
    },
    policies: {
      listAdmin: mockPolicyList,
      createAdmin: mockPolicyCreate,
      updateAdmin: mockPolicyUpdate,
      deleteAdmin: mockPolicyDelete,
    },
  },
}));

vi.mock('../../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

function renderFaqs() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <FaqsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('web_public admin FaqsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFaqList.mockResolvedValue({ data: [] });
    mockPolicyList.mockResolvedValue({ data: [] });
  });

  it('renders FAQ & Kebijakan heading', async () => {
    renderFaqs();
    await waitFor(() => { expect(screen.getByText('FAQ & Kebijakan')).toBeInTheDocument(); });
  });

  it('shows empty state when no FAQs', async () => {
    renderFaqs();
    await waitFor(() => { expect(screen.getByText('Belum ada FAQ')).toBeInTheDocument(); });
  });

  it('shows empty state when no policies', async () => {
    renderFaqs();
    fireEvent.click(screen.getByText('Kebijakan'));
    await waitFor(() => { expect(screen.getByText('Belum ada kebijakan')).toBeInTheDocument(); });
  });

  it('renders FAQ list when data loads', async () => {
    mockFaqList.mockResolvedValue({
      data: [{ id: '1', question: 'How to book?', answer: 'Click search.', category: 'General', sortOrder: 1, isActive: true }],
    });
    renderFaqs();
    await waitFor(() => { expect(screen.getByText('How to book?')).toBeInTheDocument(); });
    expect(screen.getByText('Click search.')).toBeInTheDocument();
  });

  it('renders policy list when switching to policies tab', async () => {
    mockPolicyList.mockResolvedValue({
      data: [{ id: 'p1', title: 'Refund Policy', body: 'Full refund within 24h', type: 'cancellation', version: 1, isActive: true }],
    });
    renderFaqs();
    fireEvent.click(screen.getByText('Kebijakan'));
    await waitFor(() => { expect(screen.getByText('Refund Policy')).toBeInTheDocument(); });
    expect(screen.getByText('Full refund within 24h')).toBeInTheDocument();
  });

  it('add FAQ button opens modal and creates FAQ', async () => {
    mockFaqCreate.mockResolvedValue({ success: true });
    renderFaqs();
    await waitFor(() => { expect(screen.getByText('Belum ada FAQ')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText(/tambah faq/i));
    await waitFor(() => { expect(screen.getByText('Tambah FAQ')).toBeInTheDocument(); });
    fireEvent.change(document.querySelector('input[name="question"]') as HTMLInputElement, { target: { value: 'Apa itu?' } });
    fireEvent.change(document.querySelector('textarea[name="answer"]') as HTMLInputElement, { target: { value: 'Ini adalah jawaban yang cukup panjang' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan$/i }));
    await waitFor(() => { expect(mockFaqCreate).toHaveBeenCalled(); });
  });

  it('edit FAQ opens pre-filled modal', async () => {
    mockFaqList.mockResolvedValue({
      data: [{ id: 'f1', question: 'Old Q', answer: 'Old A here', category: 'cat', sortOrder: 1, isActive: true }],
    });
    renderFaqs();
    await waitFor(() => { expect(screen.getByText('Old Q')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Edit'));
    await waitFor(() => { expect(screen.getByText('Edit FAQ')).toBeInTheDocument(); });
    expect((document.querySelector('input[name="question"]') as HTMLInputElement).value).toBe('Old Q');
  });

  it('delete FAQ shows confirmation dialog', async () => {
    mockFaqList.mockResolvedValue({
      data: [{ id: 'f1', question: 'Delete me?', answer: 'Answer here', category: 'test', sortOrder: 1, isActive: true }],
    });
    renderFaqs();
    await waitFor(() => { expect(screen.getByText('Delete me?')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Hapus'));
    await waitFor(() => { expect(screen.getByText(/hapus faq/i)).toBeInTheDocument(); });
    const confirmBtns = screen.getAllByText('Hapus');
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);
    await waitFor(() => { expect(mockFaqDelete).toHaveBeenCalledWith('f1'); });
  });

  it('add policy modal opens and creates policy', async () => {
    mockPolicyCreate.mockResolvedValue({ success: true });
    renderFaqs();
    fireEvent.click(screen.getByText('Kebijakan'));
    await waitFor(() => { expect(screen.getByText('Belum ada kebijakan')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText(/tambah kebijakan/i));
    await waitFor(() => { expect(screen.getByText('Tambah Kebijakan')).toBeInTheDocument(); });
    fireEvent.change(document.querySelector('input[name="title"]') as HTMLInputElement, { target: { value: 'My Policy' } });
    fireEvent.change(document.querySelector('textarea[name="body"]') as HTMLInputElement, { target: { value: 'This is policy body text' } });
    fireEvent.change(document.querySelector('input[name="type"]') as HTMLInputElement, { target: { value: 'terms' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan$/i }));
    await waitFor(() => { expect(mockPolicyCreate).toHaveBeenCalled(); });
  });

  it('edit policy opens pre-filled modal', async () => {
    mockPolicyList.mockResolvedValue({
      data: [{ id: 'p1', title: 'Old Policy', body: 'Old body text', type: 'cancellation', version: 2, isActive: true }],
    });
    renderFaqs();
    fireEvent.click(screen.getByText('Kebijakan'));
    await waitFor(() => { expect(screen.getByText('Old Policy')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Edit'));
    await waitFor(() => { expect(screen.getByText('Edit Kebijakan')).toBeInTheDocument(); });
    expect((document.querySelector('input[name="title"]') as HTMLInputElement).value).toBe('Old Policy');
  });

  it('delete policy shows confirmation', async () => {
    mockPolicyList.mockResolvedValue({
      data: [{ id: 'p1', title: 'Del Policy', body: 'Body text', type: 'terms', version: 1, isActive: true }],
    });
    renderFaqs();
    fireEvent.click(screen.getByText('Kebijakan'));
    await waitFor(() => { expect(screen.getByText('Del Policy')).toBeInTheDocument(); });
    const deleteBtns = screen.getAllByText('Hapus');
    fireEvent.click(deleteBtns[deleteBtns.length - 1]);
    await waitFor(() => { expect(screen.getByText(/hapus kebijakan/i)).toBeInTheDocument(); });
    const confirmBtns = screen.getAllByText('Hapus');
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);
    await waitFor(() => { expect(mockPolicyDelete).toHaveBeenCalledWith('p1'); });
  });

  it('loading state shows skeletons', async () => {
    mockFaqList.mockReturnValue(new Promise(() => {}));
    mockPolicyList.mockReturnValue(new Promise(() => {}));
    renderFaqs();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('submits FAQ update when editing', async () => {
    mockFaqUpdate.mockResolvedValue({ success: true });
    mockFaqList.mockResolvedValue({
      data: [{ id: 'f1', question: 'Old Q', answer: 'Old A here', category: 'cat', sortOrder: 1, isActive: true }],
    });
    renderFaqs();
    await waitFor(() => { expect(screen.getByText('Old Q')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Edit'));
    await waitFor(() => { expect(screen.getByText('Edit FAQ')).toBeInTheDocument(); });
    fireEvent.change(document.querySelector('input[name="question"]') as HTMLInputElement, { target: { value: 'New question here' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan$/i }));
    await waitFor(() => { expect(mockFaqUpdate).toHaveBeenCalledWith('f1', expect.objectContaining({ question: 'New question here' })); });
  });

  it('submits policy update when editing', async () => {
    mockPolicyUpdate.mockResolvedValue({ success: true });
    mockPolicyList.mockResolvedValue({
      data: [{ id: 'p1', title: 'Old Policy', body: 'Old body text', type: 'cancellation', version: 2, isActive: true }],
    });
    renderFaqs();
    fireEvent.click(screen.getByText('Kebijakan'));
    await waitFor(() => { expect(screen.getByText('Old Policy')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Edit'));
    await waitFor(() => { expect(screen.getByText('Edit Kebijakan')).toBeInTheDocument(); });
    fireEvent.change(document.querySelector('input[name="title"]') as HTMLInputElement, { target: { value: 'New Policy Title' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan$/i }));
    await waitFor(() => { expect(mockPolicyUpdate).toHaveBeenCalledWith('p1', expect.objectContaining({ title: 'New Policy Title' })); });
  });

  it('cancels FAQ modal via Batal button', async () => {
    renderFaqs();
    fireEvent.click(screen.getByText(/tambah faq/i));
    await waitFor(() => { expect(screen.getByText('Tambah FAQ')).toBeInTheDocument(); });
    const batalBtns = screen.getAllByText('Batal');
    fireEvent.click(batalBtns[batalBtns.length - 1]);
    await waitFor(() => { expect(screen.queryByText('Tambah FAQ')).not.toBeInTheDocument(); });
  });

  it('cancels policy modal via Batal button', async () => {
    renderFaqs();
    fireEvent.click(screen.getByText('Kebijakan'));
    fireEvent.click(screen.getByText(/tambah kebijakan/i));
    await waitFor(() => { expect(screen.getByText('Tambah Kebijakan')).toBeInTheDocument(); });
    const batalBtns = screen.getAllByText('Batal');
    fireEvent.click(batalBtns[batalBtns.length - 1]);
    await waitFor(() => { expect(screen.queryByText('Tambah Kebijakan')).not.toBeInTheDocument(); });
  });

  it('cancels FAQ delete confirmation', async () => {
    mockFaqList.mockResolvedValue({
      data: [{ id: 'f1', question: 'Keep me?', answer: 'Answer here', category: 'test', sortOrder: 1, isActive: true }],
    });
    renderFaqs();
    await waitFor(() => { expect(screen.getByText('Keep me?')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Hapus'));
    await waitFor(() => { expect(screen.getByText(/hapus faq/i)).toBeInTheDocument(); });
    const batalBtns = screen.getAllByText('Batal');
    fireEvent.click(batalBtns[batalBtns.length - 1]);
    await waitFor(() => { expect(screen.queryByText(/hapus faq/i)).not.toBeInTheDocument(); });
    expect(mockFaqDelete).not.toHaveBeenCalled();
  });

  it('cancels policy delete confirmation', async () => {
    mockPolicyList.mockResolvedValue({
      data: [{ id: 'p1', title: 'Keep Policy', body: 'Body text', type: 'terms', version: 1, isActive: true }],
    });
    renderFaqs();
    fireEvent.click(screen.getByText('Kebijakan'));
    await waitFor(() => { expect(screen.getByText('Keep Policy')).toBeInTheDocument(); });
    const deleteBtns = screen.getAllByText('Hapus');
    fireEvent.click(deleteBtns[deleteBtns.length - 1]);
    await waitFor(() => { expect(screen.getByText(/hapus kebijakan/i)).toBeInTheDocument(); });
    const batalBtns = screen.getAllByText('Batal');
    fireEvent.click(batalBtns[batalBtns.length - 1]);
    await waitFor(() => { expect(screen.queryByText(/hapus kebijakan/i)).not.toBeInTheDocument(); });
    expect(mockPolicyDelete).not.toHaveBeenCalled();
  });

  it('shows FAQ validation errors on empty submit', async () => {
    renderFaqs();
    fireEvent.click(screen.getByText(/tambah faq/i));
    await waitFor(() => { expect(screen.getByText('Tambah FAQ')).toBeInTheDocument(); });
    fireEvent.click(screen.getByRole('button', { name: /simpan$/i }));
    await waitFor(() => { expect(screen.getByText('Minimal 5 karakter')).toBeInTheDocument(); });
  });

  it('shows policy validation errors on empty submit', async () => {
    renderFaqs();
    fireEvent.click(screen.getByText('Kebijakan'));
    fireEvent.click(screen.getByText(/tambah kebijakan/i));
    await waitFor(() => { expect(screen.getByText('Tambah Kebijakan')).toBeInTheDocument(); });
    fireEvent.click(screen.getByRole('button', { name: /simpan$/i }));
    await waitFor(() => { expect(screen.getByText('Minimal 3 karakter')).toBeInTheDocument(); });
  });

  it('closes FAQ modal via X button', async () => {
    renderFaqs();
    fireEvent.click(screen.getByText(/tambah faq/i));
    await waitFor(() => { expect(screen.getByText('Tambah FAQ')).toBeInTheDocument(); });
    const closeBtns = screen.getAllByText('×');
    fireEvent.click(closeBtns[0]);
    await waitFor(() => { expect(screen.queryByText('Tambah FAQ')).not.toBeInTheDocument(); });
  });

  it('closes policy modal via X button', async () => {
    renderFaqs();
    fireEvent.click(screen.getByText('Kebijakan'));
    fireEvent.click(screen.getByText(/tambah kebijakan/i));
    await waitFor(() => { expect(screen.getByText('Tambah Kebijakan')).toBeInTheDocument(); });
    const closeBtns = screen.getAllByText('×');
    fireEvent.click(closeBtns[closeBtns.length - 1]);
    await waitFor(() => { expect(screen.queryByText('Tambah Kebijakan')).not.toBeInTheDocument(); });
  });
});
