import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WaitlistPage from '../WaitlistPage';

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' }, logout: vi.fn() }),
}));

vi.mock('../../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="provider-layout">{children}</div>,
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function renderWaitlist() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <WaitlistPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

const waitlistEntries = [
  { id: 'w1', position: 1, customerName: 'Andi', customerPhone: '08123', preferredDate: '2026-09-15', preferredTime: '10:00', status: 'WAITING' },
  { id: 'w2', position: 2, customerName: 'Budi', customerPhone: '08456', preferredDate: '2026-09-15', preferredTime: '11:00', status: 'NOTIFIED' },
  { id: 'w3', position: 3, customerName: 'Rudi', customerPhone: '08789', preferredDate: '2026-09-16', preferredTime: '09:00', status: 'SERVED' },
];

function wrapJson(data) {
  return { json: () => ({ data }) };
}

describe('WaitlistPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders heading', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(wrapJson([])));
    renderWaitlist();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /daftar tunggu/i })).toBeInTheDocument();
    });
  });

  it('renders ProviderLayout', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(wrapJson([])));
    renderWaitlist();
    await waitFor(() => {
      expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
    });
  });

  it('shows empty state when no entries', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(wrapJson([])));
    renderWaitlist();
    await waitFor(() => {
      expect(screen.getByText('Belum ada daftar tunggu')).toBeInTheDocument();
    });
  });

  it('renders waitlist entries when data is available', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(wrapJson(waitlistEntries)));
    renderWaitlist();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
      expect(screen.getByText('Menunggu')).toBeInTheDocument();
    });
  });

  it('shows phone numbers', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(wrapJson(waitlistEntries)));
    renderWaitlist();
    await waitFor(() => {
      expect(screen.getByText('08123')).toBeInTheDocument();
    });
    expect(screen.getByText('08456')).toBeInTheDocument();
    expect(screen.getByText('08789')).toBeInTheDocument();
  });

  it('shows dates and times', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(wrapJson(waitlistEntries)));
    renderWaitlist();
    await waitFor(() => {
      expect(screen.getAllByText('2026-09-15').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('11:00')).toBeInTheDocument();
  });

  it('shows NOTIFIED status badge', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(wrapJson(waitlistEntries)));
    renderWaitlist();
    await waitFor(() => {
      expect(screen.getByText('Diberitahu')).toBeInTheDocument();
    });
  });

  it('shows SERVED status badge', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(wrapJson(waitlistEntries)));
    renderWaitlist();
    await waitFor(() => {
      expect(screen.getByText('Selesai')).toBeInTheDocument();
    });
  });

  it('shows notify button for WAITING entries', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(wrapJson(waitlistEntries)));
    renderWaitlist();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    const beritahuButtons = screen.getAllByText('Beritahu');
    expect(beritahuButtons.length).toBe(1);
  });

  it('calls notify endpoint when Beritahu is clicked', async () => {
    mockFetch.mockImplementationOnce(() => Promise.resolve(wrapJson(waitlistEntries)));
    mockFetch.mockImplementationOnce(() => Promise.resolve(wrapJson(true)));
    renderWaitlist();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Beritahu'));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/provider/waitlist/w1/notify',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('opens add form when Tambah ke Daftar Tunggu is clicked', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(wrapJson([])));
    renderWaitlist();
    await userEvent.click(screen.getByRole('button', { name: /tambah ke daftar tunggu/i }));
    await waitFor(() => {
      expect(screen.getByText('Tambah ke Daftar Tunggu')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Nama Pelanggan')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Telepon')).toBeInTheDocument();
    });
  });

  it('closes form when Batal is clicked', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(wrapJson([])));
    renderWaitlist();
    await userEvent.click(screen.getByRole('button', { name: /tambah ke daftar tunggu/i }));
    await waitFor(() => {
      expect(screen.getByText('Tambah ke Daftar Tunggu')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Batal'));
    await waitFor(() => {
      expect(screen.queryByText('Tambah ke Daftar Tunggu')).not.toBeInTheDocument();
    });
  });

  it('submits form data when Tambahkan is clicked', async () => {
    mockFetch.mockImplementationOnce(() => Promise.resolve(wrapJson([])));
    mockFetch.mockImplementationOnce(() => Promise.resolve(wrapJson({ id: 'w4' })));
    renderWaitlist();
    await userEvent.click(screen.getByRole('button', { name: /tambah ke daftar tunggu/i }));
    await waitFor(() => {
      expect(screen.getByText('Tambah ke Daftar Tunggu')).toBeInTheDocument();
    });
    await userEvent.type(screen.getByPlaceholderText('Nama Pelanggan'), 'Siti');
    await userEvent.type(screen.getByPlaceholderText('Telepon'), '081111');
    await userEvent.click(screen.getByRole('button', { name: /tambahkan/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/provider/waitlist',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('shows table headers', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(wrapJson([])));
    renderWaitlist();
    await waitFor(() => {
      expect(screen.getByText('#')).toBeInTheDocument();
    });
    expect(screen.getByText('Nama')).toBeInTheDocument();
    expect(screen.getByText('Telepon')).toBeInTheDocument();
    expect(screen.getByText('Tanggal')).toBeInTheDocument();
    expect(screen.getByText('Waktu')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Aksi')).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    renderWaitlist();
    await waitFor(() => {
      expect(screen.getByText('Memuat...')).toBeInTheDocument();
    });
  });

  it('shows position numbers', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(wrapJson(waitlistEntries)));
    renderWaitlist();
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
