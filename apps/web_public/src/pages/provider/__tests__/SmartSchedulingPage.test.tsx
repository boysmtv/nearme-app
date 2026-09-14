import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SmartSchedulingPage from '../SmartSchedulingPage';

vi.mock('../../../lib/api', () => ({
  api: { get: vi.fn() },
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

import { api } from '../../../lib/api';

const mockGet = api.get as ReturnType<typeof vi.fn>;

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <SmartSchedulingPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('SmartSchedulingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: null });
  });

  it('renders heading', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /smart scheduling ai/i })).toBeInTheDocument();
  });

  it('shows default suggestions when API returns null', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('smart-suggestions')) {
        return Promise.resolve({ data: [{ type: 'PEAK_HOURS', title: 'Jam Sibuk: 10:00 - 14:00', description: 'Booking paling banyak di jam ini.', impact: 'high', action: 'Tambah staf' }] });
      }
      return Promise.resolve({ data: { hourly: [] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/jam sibuk: 10:00 - 14:00/i)).toBeInTheDocument();
    });
  });

  it('shows date input', async () => {
    renderPage();
    expect(screen.getByDisplayValue(new Date().toISOString().split('T')[0])).toBeInTheDocument();
  });

  it('renders custom suggestions from API', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('smart-suggestions')) {
        return Promise.resolve({ data: [{ type: 'PEAK_HOURS', title: 'Custom Suggestion', description: 'Test desc', impact: 'high', action: 'Do something' }] });
      }
      return Promise.resolve({ data: { hourly: [] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Custom Suggestion')).toBeInTheDocument();
    });
  });
});
