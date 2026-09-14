import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AnalyticsDeepPage from '../AnalyticsDeepPage';

vi.mock('../../../lib/api', () => ({
  api: { get: vi.fn() },
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

import { api } from '../../../lib/api';

const mockGet = api.get as ReturnType<typeof vi.fn>;

const defaultAnalytics = {
  revenue: { total: 1000000, growth: 5, daily: [] },
  bookings: { total: 50, growth: 10, completed: 45, cancelled: 5 },
  customers: { new: 10, returning: 40, churnRate: 2 },
  topServices: [
    { name: 'Potong Rambut', count: 30, revenue: 1500000 },
    { name: 'Hair Coloring', count: 15, revenue: 2250000 },
  ],
  staffPerformance: [
    { name: 'Andi', bookings: 20, rating: 4.8, repeatRate: '80%', revenue: 1000000 },
    { name: 'Rudi', bookings: 15, rating: 4.5, repeatRate: '70%', revenue: 750000 },
  ],
};

const defaultForecast = {
  nextWeek: { predicted: 42, confidence: 85 },
  nextMonth: { predicted: 180, confidence: 72 },
  recommendation: 'Tambah staf di jam sibuk.',
};

const defaultSegmentation = [
  { segment: 'VIP', count: 10, percentage: 20, color: '#FF0000', revenue: 5000000 },
  { segment: 'Regular', count: 30, percentage: 60, color: '#00FF00', revenue: 3000000 },
];

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AnalyticsDeepPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('AnalyticsDeepPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url.includes('forecast')) return Promise.resolve({ data: defaultForecast });
      if (url.includes('segmentation')) return Promise.resolve({ data: defaultSegmentation });
      return Promise.resolve({ data: defaultAnalytics });
    });
  });

  it('renders heading', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /analytics mendalam/i })).toBeInTheDocument();
  });

  it('shows forecast cards', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/42 booking/)).toBeInTheDocument();
    });
    expect(screen.getByText(/180 booking/)).toBeInTheDocument();
    expect(screen.getByText(/Tambah staf di jam sibuk/)).toBeInTheDocument();
  });

  it('shows segmentation data', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('VIP')).toBeInTheDocument();
    });
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Regular')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('shows period selector', async () => {
    renderPage();
    expect(screen.getByDisplayValue('30 Hari')).toBeInTheDocument();
  });

  it('shows top services section', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    expect(screen.getByText('Layanan Terlaris')).toBeInTheDocument();
    expect(screen.getByText('Hair Coloring')).toBeInTheDocument();
    expect(screen.getByText('30x')).toBeInTheDocument();
    expect(screen.getByText('15x')).toBeInTheDocument();
  });

  it('shows staff performance table', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    expect(screen.getByText('Performa Staf')).toBeInTheDocument();
    expect(screen.getByText('Rudi')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('shows revenue in top services', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    expect(screen.getByText('Rp 1.500.000')).toBeInTheDocument();
    expect(screen.getByText('Rp 2.250.000')).toBeInTheDocument();
  });

  it('shows revenue in staff performance', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    expect(screen.getAllByText(/1\.000\.000/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/750\.000/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows segmentation percentage', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('VIP')).toBeInTheDocument();
    });
    expect(screen.getByText('20% dari total')).toBeInTheDocument();
    expect(screen.getByText('60% dari total')).toBeInTheDocument();
  });

  it('shows segmentation revenue', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('VIP')).toBeInTheDocument();
    });
    expect(screen.getByText('Rp 5.000.000')).toBeInTheDocument();
    expect(screen.getByText('Rp 3.000.000')).toBeInTheDocument();
  });

  it('changes period selector', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue('30 Hari')).toBeInTheDocument();
    });
    const select = screen.getByDisplayValue('30 Hari');
    await userEvent.selectOptions(select, '7d');
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('period=7d'));
    });
  });

  it('shows forecast confidence percentages', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Confidence: 85%')).toBeInTheDocument();
    });
    expect(screen.getByText('Confidence: 72%')).toBeInTheDocument();
  });

  it('shows week prediction label', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Prediksi Minggu Depan')).toBeInTheDocument();
    });
    expect(screen.getByText('Prediksi Bulan Depan')).toBeInTheDocument();
  });

  it('shows staff rating with star', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    expect(screen.getAllByText('★').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('shows staff bookings and rating columns', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Performa Staf')).toBeInTheDocument();
    });
    expect(screen.getByText('Booking')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Repeat Rate')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('handles empty analytics data', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('forecast')) return Promise.resolve({ data: defaultForecast });
      if (url.includes('segmentation')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: { ...defaultAnalytics, topServices: [], staffPerformance: [] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Layanan Terlaris')).toBeInTheDocument();
    });
    expect(screen.getByText('Performa Staf')).toBeInTheDocument();
  });

  it('handles forecast API returning null', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('forecast')) return Promise.resolve({ data: null });
      if (url.includes('segmentation')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: defaultAnalytics });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('0 booking').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getAllByText('Confidence: 0%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Belum cukup data untuk prediksi.')).toBeInTheDocument();
  });

  it('handles segmentation with zero revenue', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('forecast')) return Promise.resolve({ data: defaultForecast });
      if (url.includes('segmentation')) return Promise.resolve({ data: [{ segment: 'New', count: 5, percentage: 100, color: '#0000FF', revenue: 0 }] });
      return Promise.resolve({ data: { ...defaultAnalytics, topServices: [], staffPerformance: [] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('New')).toBeInTheDocument();
    });
    const segSection = screen.getByText('Segmentasi Pelanggan').closest('div')!;
    expect(segSection.textContent).not.toMatch(/Rp/);
  });

  it('changes period to 90d and triggers re-fetch', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue('30 Hari')).toBeInTheDocument();
    });
    const select = screen.getByDisplayValue('30 Hari');
    await userEvent.selectOptions(select, '90d');
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('period=90d'));
    });
  });

  it('changes period to 1y and triggers re-fetch', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue('30 Hari')).toBeInTheDocument();
    });
    const select = screen.getByDisplayValue('30 Hari');
    await userEvent.selectOptions(select, '1y');
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('period=1y'));
    });
  });

  it('shows all four period options', async () => {
    renderPage();
    expect(screen.getByRole('option', { name: '7 Hari' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '30 Hari' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '90 Hari' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '1 Tahun' })).toBeInTheDocument();
  });

  it('renders default values when all APIs return null', async () => {
    mockGet.mockResolvedValue({ data: null });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Analytics Mendalam')).toBeInTheDocument();
    });
    expect(screen.getAllByText('0 booking').length).toBeGreaterThanOrEqual(1);
  });

  it('displays segmentation color correctly', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('forecast')) return Promise.resolve({ data: defaultForecast });
      if (url.includes('segmentation')) return Promise.resolve({ data: [{ segment: 'VIP', count: 10, percentage: 100, color: '#FF5733', revenue: 1000000 }] });
      return Promise.resolve({ data: defaultAnalytics });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('VIP')).toBeInTheDocument();
    });
    const colorDiv = screen.getByText('10').closest('div');
    expect(colorDiv).toHaveStyle({ backgroundColor: '#FF573320' });
  });

  it('shows staff rating with yellow star for each staff member', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    const stars = screen.getAllByText('★');
    expect(stars.length).toBeGreaterThanOrEqual(2);
  });

  it('shows single staff member in performance table', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('forecast')) return Promise.resolve({ data: defaultForecast });
      if (url.includes('segmentation')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: { ...defaultAnalytics, staffPerformance: [{ name: 'Solo', bookings: 5, rating: 5.0, repeatRate: '100%', revenue: 200000 }] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Solo')).toBeInTheDocument();
    });
    expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1);
  });

  it('shows single service in top services', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('forecast')) return Promise.resolve({ data: defaultForecast });
      if (url.includes('segmentation')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: { ...defaultAnalytics, topServices: [{ name: 'OnlyService', count: 85, revenue: 9999999 }] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('OnlyService')).toBeInTheDocument();
    });
    expect(screen.getByText('85x')).toBeInTheDocument();
    expect(screen.getByText('Rp 9.999.999')).toBeInTheDocument();
  });

  it('displays multiple segmentation segments with different colors', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('forecast')) return Promise.resolve({ data: defaultForecast });
      if (url.includes('segmentation')) return Promise.resolve({
        data: [
          { segment: 'VIP', count: 5, percentage: 10, color: '#FF0000', revenue: 5000000 },
          { segment: 'Regular', count: 20, percentage: 40, color: '#00FF00', revenue: 3000000 },
          { segment: 'New', count: 15, percentage: 30, color: '#0000FF', revenue: 1000000 },
          { segment: 'Lapsed', count: 10, percentage: 20, color: '#FFFF00', revenue: 0 },
        ],
      });
      return Promise.resolve({ data: { ...defaultAnalytics, topServices: [], staffPerformance: [] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('VIP')).toBeInTheDocument();
    });
    expect(screen.getByText('Regular')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Lapsed')).toBeInTheDocument();
    expect(screen.getByText('10% dari total')).toBeInTheDocument();
    expect(screen.getByText('40% dari total')).toBeInTheDocument();
    expect(screen.getByText('30% dari total')).toBeInTheDocument();
    expect(screen.getByText('20% dari total')).toBeInTheDocument();
  });

  it('handles forecast with zero predictions', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('forecast')) return Promise.resolve({
        data: { nextWeek: { predicted: 0, confidence: 0 }, nextMonth: { predicted: 0, confidence: 0 }, recommendation: 'No data yet' },
      });
      if (url.includes('segmentation')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: { ...defaultAnalytics, topServices: [], staffPerformance: [] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('No data yet')).toBeInTheDocument();
    });
    expect(screen.getAllByText('0 booking').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Confidence: 0%').length).toBeGreaterThanOrEqual(1);
  });

  it('renders all recommendation text from forecast', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Tambah staf di jam sibuk/)).toBeInTheDocument();
    });
  });

  it('handles API returning undefined data gracefully', async () => {
    mockGet.mockResolvedValue({});
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Analytics Mendalam')).toBeInTheDocument();
    });
    expect(screen.getAllByText('0 booking').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Layanan Terlaris')).toBeInTheDocument();
    expect(screen.getByText('Performa Staf')).toBeInTheDocument();
  });

  it('shows segmentation section heading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Segmentasi Pelanggan')).toBeInTheDocument();
    });
  });

  it('handles forecast returning undefined data', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('forecast')) return Promise.resolve({ data: undefined });
      if (url.includes('segmentation')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: { ...defaultAnalytics, topServices: [], staffPerformance: [] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('0 booking').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('handles analytics returning undefined data', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('forecast')) return Promise.resolve({ data: defaultForecast });
      if (url.includes('segmentation')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: undefined });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Layanan Terlaris')).toBeInTheDocument();
    });
  });

  it('displays segmentation with large revenue values', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('forecast')) return Promise.resolve({ data: defaultForecast });
      if (url.includes('segmentation')) return Promise.resolve({
        data: [{ segment: 'Whale', count: 2, percentage: 5, color: '#FF0000', revenue: 99999999 }],
      });
      return Promise.resolve({ data: { ...defaultAnalytics, topServices: [], staffPerformance: [] } });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Whale')).toBeInTheDocument();
    });
    expect(screen.getByText('Rp 99.999.999')).toBeInTheDocument();
  });

  it('shows segmentation with count values', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('VIP')).toBeInTheDocument();
    });
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('renders service count badges in top services', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('30x')).toBeInTheDocument();
    });
    expect(screen.getByText('15x')).toBeInTheDocument();
  });

  it('renders all table header columns', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Staf')).toBeInTheDocument();
    });
    expect(screen.getByText('Booking')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Repeat Rate')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });
});
