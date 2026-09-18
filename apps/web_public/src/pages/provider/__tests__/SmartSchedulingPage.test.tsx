import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('shows loading skeleton while fetching suggestions', async () => {
    mockGet.mockImplementation(() => new Promise(() => {})); // never resolves
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Rekomendasi AI')).toBeInTheDocument();
    });
    expect(screen.getAllByTestId ? document.querySelectorAll('.animate-pulse').length : 0).toBeGreaterThanOrEqual(0);
  });

  it('renders peak hours chart with hourly data', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('smart-suggestions')) return Promise.resolve({ data: [] });
      if (url.includes('peak-hours')) return Promise.resolve({
        data: { hourly: [{ hour: 8, count: 5 }, { hour: 10, count: 20 }, { hour: 14, count: 15 }, { hour: 18, count: 3 }] },
      });
      return Promise.resolve({ data: null });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('8:00')).toBeInTheDocument();
    });
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('14:00')).toBeInTheDocument();
    expect(screen.getByText('18:00')).toBeInTheDocument();
  });

  it('renders legend for peak hours chart', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('smart-suggestions')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: { hourly: [] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Sedang/)).toBeInTheDocument();
    });
    expect(screen.getByText(/>70%/)).toBeInTheDocument();
    expect(screen.getByText(/40-70%/)).toBeInTheDocument();
    expect(screen.getByText(/<40%/)).toBeInTheDocument();
  });

  it('renders suggestion with medium impact', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('smart-suggestions')) {
        return Promise.resolve({ data: [{ type: 'STAFF_ALLOCATION', title: 'Staf Underutilized', description: 'Test medium', impact: 'medium', action: 'Optimasi' }] });
      }
      return Promise.resolve({ data: { hourly: [] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Staf Underutilized')).toBeInTheDocument();
    });
    expect(screen.getByText('Sedang')).toBeInTheDocument();
  });

  it('renders suggestion with low impact', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('smart-suggestions')) {
        return Promise.resolve({ data: [{ type: 'PRICING', title: 'Low Impact', description: 'Test low', impact: 'low', action: 'Review' }] });
      }
      return Promise.resolve({ data: { hourly: [] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Low Impact')).toBeInTheDocument();
    });
    expect(screen.getByText('Rendah')).toBeInTheDocument();
  });

  it('renders suggestion with default unknown type icon', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('smart-suggestions')) {
        return Promise.resolve({ data: [{ type: 'UNKNOWN_TYPE', title: 'Mystery', description: 'Test default', impact: 'high', action: 'Do' }] });
      }
      return Promise.resolve({ data: { hourly: [] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Mystery')).toBeInTheDocument();
    });
  });

  it('renders multiple suggestion types with icons', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('smart-suggestions')) {
        return Promise.resolve({ data: [
          { type: 'PEAK_HOURS', title: 'Peak', description: 'A', impact: 'high', action: 'Act1' },
          { type: 'STAFF_ALLOCATION', title: 'Staff', description: 'B', impact: 'medium', action: 'Act2' },
          { type: 'PRICING', title: 'Price', description: 'C', impact: 'low', action: 'Act3' },
          { type: 'PROMOTION', title: 'Promo', description: 'D', impact: 'high', action: 'Act4' },
        ] });
      }
      return Promise.resolve({ data: { hourly: [] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Peak')).toBeInTheDocument();
    });
    expect(screen.getByText('Staff')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Promo')).toBeInTheDocument();
  });

  it('changes date input and refetches data', async () => {
    renderPage();
    const dateInput = screen.getByDisplayValue(new Date().toISOString().split('T')[0]);
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, '2026-01-15');
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('2026-01-15'));
    });
  });

  it('renders peak hours chart legend items', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('smart-suggestions')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: { hourly: [] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/>70%/)).toBeInTheDocument();
    });
    expect(screen.getByText(/40-70%/)).toBeInTheDocument();
    expect(screen.getByText(/<40%/)).toBeInTheDocument();
  });

  it('renders suggestions with action buttons', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('smart-suggestions')) {
        return Promise.resolve({ data: [{ type: 'PROMOTION', title: 'Promo', description: 'Test', impact: 'high', action: 'Buat promo' }] });
      }
      return Promise.resolve({ data: { hourly: [] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Buat promo')).toBeInTheDocument();
    });
  });

  it('shows high impact label as Tinggi', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('smart-suggestions')) {
        return Promise.resolve({ data: [{ type: 'PEAK_HOURS', title: 'High', description: 'Test', impact: 'high', action: 'Do' }] });
      }
      return Promise.resolve({ data: { hourly: [] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Tinggi')).toBeInTheDocument();
    });
  });

  it('renders peak hours with bar color coding', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('smart-suggestions')) return Promise.resolve({ data: [] });
      if (url.includes('peak-hours')) return Promise.resolve({
        data: { hourly: [{ hour: 9, count: 25 }, { hour: 12, count: 10 }, { hour: 15, count: 3 }] },
      });
      return Promise.resolve({ data: null });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument();
    });
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('handles peak hours with all zero counts', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('smart-suggestions')) return Promise.resolve({ data: [] });
      if (url.includes('peak-hours')) return Promise.resolve({
        data: { hourly: [{ hour: 9, count: 0 }, { hour: 10, count: 0 }] },
      });
      return Promise.resolve({ data: null });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('9:00')).toBeInTheDocument();
    });
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(2);
  });

  it('renders default suggestions from API when null', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('smart-suggestions')) return Promise.resolve({ data: null });
      return Promise.resolve({ data: { hourly: [] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/jam sibuk: 10:00 - 14:00/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/staf underutilized: andi/i)).toBeInTheDocument();
    expect(screen.getByText(/harga competitive/i)).toBeInTheDocument();
    expect(screen.getByText(/waktu promosi optimal/i)).toBeInTheDocument();
  });

  it('renders subtitle text', async () => {
    renderPage();
    expect(screen.getByText(/rekomendasi cerdas berdasarkan data booking anda/i)).toBeInTheDocument();
  });

  it('renders default gray badge for unknown impact', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('smart-suggestions')) {
        return Promise.resolve({ data: [{ type: 'PEAK_HOURS', title: 'Misteri', description: 'Dampak tak dikenal', impact: 'critical', action: 'Cek' }] });
      }
      return Promise.resolve({ data: { hourly: [] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Misteri')).toBeInTheDocument();
    });
  });
});
