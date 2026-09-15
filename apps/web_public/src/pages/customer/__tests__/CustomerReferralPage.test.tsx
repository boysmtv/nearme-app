import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CustomerReferralPage from '../CustomerReferralPage';

const { mockGetProfile } = vi.hoisted(() => ({
  mockGetProfile: vi.fn(),
}));

vi.mock('../../../lib/api', () => ({
  publicApi: {
    customer: { getProfile: mockGetProfile },
  },
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Siti', role: 'ROLE_CUSTOMER' }, logout: vi.fn() }),
}));

vi.mock('../../../components/CustomerLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="customer-layout">{children}</div>,
}));

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <CustomerReferralPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('CustomerReferralPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'open').mockImplementation(() => null);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders CustomerLayout wrapper', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'c1', referralCode: 'DEKAT-ABC123' } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
    });
  });

  it('shows loading skeleton', () => {
    mockGetProfile.mockReturnValue(new Promise(() => {}));
    renderPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders hero card with referral code', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'c1', referralCode: 'DEKAT-ABC123' } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Kode Referral Anda')).toBeInTheDocument();
      expect(screen.getByText('DEKAT-ABC123')).toBeInTheDocument();
    });
  });

  it('generates fallback referral code from id', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'cust-abce', referralCount: 0 } });
    renderPage();
    await waitFor(() => {
      const el = screen.getByText(/DEKAT-CUST/i);
      expect(el).toBeInTheDocument();
      expect(el.textContent).toMatch(/^DEKAT-CUST-/);
    });
  });

  it('copy code button copies to clipboard', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'c1', referralCode: 'DEKAT-ABC123' } });
    renderPage();
    await waitFor(() => { expect(screen.getByText('DEKAT-ABC123')).toBeInTheDocument(); });
    fireEvent.click(screen.getByRole('button', { name: /salin$/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('DEKAT-ABC123');
  });

  it('copy code shows Tersalin feedback', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'c1', referralCode: 'DEKAT-ABC123' } });
    renderPage();
    await waitFor(() => { expect(screen.getByText('DEKAT-ABC123')).toBeInTheDocument(); });
    fireEvent.click(screen.getByRole('button', { name: /salin$/i }));
    expect(screen.getByText('Tersalin!')).toBeInTheDocument();
  });

  it('copy link copies referral link to clipboard', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'c1', referralCode: 'DEKAT-ABC123' } });
    renderPage();
    await waitFor(() => { expect(screen.getByText('WhatsApp')).toBeInTheDocument(); });
    fireEvent.click(screen.getByRole('button', { name: /salin tautan/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://dekat.id/register?ref=DEKAT-ABC123');
  });

  it('copy link shows Tersalin feedback', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'c1', referralCode: 'DEKAT-ABC123' } });
    renderPage();
    await waitFor(() => { expect(screen.getByText('WhatsApp')).toBeInTheDocument(); });
    fireEvent.click(screen.getByRole('button', { name: /salin tautan/i }));
    expect(screen.getByText('Tersalin!')).toBeInTheDocument();
  });

  it('share WhatsApp opens wa.me link', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'c1', referralCode: 'DEKAT-ABC123' } });
    renderPage();
    await waitFor(() => { expect(screen.getByText('WhatsApp')).toBeInTheDocument(); });
    fireEvent.click(screen.getByRole('button', { name: /whatsapp/i }));
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('wa.me/'), '_blank');
  });

  it('share Instagram copies to clipboard and alerts', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'c1', referralCode: 'DEKAT-ABC123' } });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Instagram')).toBeInTheDocument(); });
    fireEvent.click(screen.getByRole('button', { name: /instagram/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Tautan tersalin! Buka Instagram dan tempel di Story atau DM.');
  });

  it('share Twitter opens intent link', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'c1', referralCode: 'DEKAT-ABC123' } });
    renderPage();
    await waitFor(() => { expect(screen.getByText('Twitter / X')).toBeInTheDocument(); });
    fireEvent.click(screen.getByRole('button', { name: /twitter/i }));
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('twitter.com/intent/tweet'), '_blank');
  });

  it('shows referral count and points', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'c1', referralCode: 'DEKAT-ABC123', referralCount: 5 } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('250')).toBeInTheDocument();
      expect(screen.getByText('Teman Diundang')).toBeInTheDocument();
      expect(screen.getByText('Poin Didapat')).toBeInTheDocument();
    });
  });

  it('shows zero stats by default', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'c1', referralCode: 'DEKAT-ABC123', referralCount: 0 } });
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('Teman Diundang')).toBeInTheDocument();
      expect(screen.getByText('Poin Didapat')).toBeInTheDocument();
    });
  });

  it('shows how it works section with 3 steps', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'c1', referralCode: 'DEKAT-ABC123' } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Bagaimana Cara Kerjanya?')).toBeInTheDocument();
      expect(screen.getByText('Bagikan Kode Referral')).toBeInTheDocument();
      expect(screen.getByText('Teman Mendaftar')).toBeInTheDocument();
      expect(screen.getByText('Dapat 50 Poin')).toBeInTheDocument();
    });
  });

  it('shows empty referral history', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'c1', referralCode: 'DEKAT-ABC123' } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Riwayat Referral')).toBeInTheDocument();
      expect(screen.getByText('Belum Ada Referral')).toBeInTheDocument();
    });
  });

  it('shows share section heading', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'c1', referralCode: 'DEKAT-ABC123' } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Bagikan ke Teman')).toBeInTheDocument();
    });
  });

  it('shows share description text', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'c1', referralCode: 'DEKAT-ABC123' } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/bagikan kode ini kepada teman/i)).toBeInTheDocument();
    });
  });

  it('points calculated as referralCount * 50', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'c1', referralCode: 'DEKAT-ABC123', referralCount: 3 } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
    });
  });

  it('shows empty referral history description', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'c1', referralCode: 'DEKAT-ABC123' } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/bagikan kode referral anda kepada teman/i)).toBeInTheDocument();
    });
  });

  it('step numbers 1, 2, 3 are displayed', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'c1', referralCode: 'DEKAT-ABC123' } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('step descriptions are shown', async () => {
    mockGetProfile.mockResolvedValue({ data: { id: 'c1', referralCode: 'DEKAT-ABC123' } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/kirim kode referral anda kepada teman/i)).toBeInTheDocument();
      expect(screen.getByText(/teman anda mendaftar di dekat/i)).toBeInTheDocument();
      expect(screen.getByText(/anda dan teman masing-masing mendapatkan 50 poin/i)).toBeInTheDocument();
    });
  });
});
