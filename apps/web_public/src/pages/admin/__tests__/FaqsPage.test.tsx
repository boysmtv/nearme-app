import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FaqsPage from '../FaqsPage';

vi.mock('../../../lib/api', () => ({
  publicApi: {
    faqs: { listAdmin: vi.fn() },
    policies: { listAdmin: vi.fn() },
  },
}));

vi.mock('../../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

import { publicApi } from '../../../lib/api';
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderFaqs() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <FaqsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('web_public admin FaqsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders FAQ & Kebijakan heading', async () => {
    (publicApi.faqs.listAdmin as any).mockResolvedValue({ data: [] });
    (publicApi.policies.listAdmin as any).mockResolvedValue({ data: [] });
    renderFaqs();
    await waitFor(() => {
      expect(screen.getByText('FAQ & Kebijakan')).toBeInTheDocument();
    });
  });

  it('shows empty state when no FAQs', async () => {
    (publicApi.faqs.listAdmin as any).mockResolvedValue({ data: [] });
    (publicApi.policies.listAdmin as any).mockResolvedValue({ data: [] });
    renderFaqs();
    await waitFor(() => {
      expect(screen.getByText('Belum ada FAQ')).toBeInTheDocument();
    });
  });

  it('renders FAQ list when data loads', async () => {
    (publicApi.faqs.listAdmin as any).mockResolvedValue({
      data: [{ id: '1', question: 'How to book?', answer: 'Click search.', category: 'General', sortOrder: 1, isActive: true }],
    });
    (publicApi.policies.listAdmin as any).mockResolvedValue({ data: [] });
    renderFaqs();
    await waitFor(() => {
      expect(screen.getByText('How to book?')).toBeInTheDocument();
    });
  });
});
