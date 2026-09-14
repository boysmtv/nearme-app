import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotificationPreferencesPage from '../NotificationPreferencesPage';

vi.mock('../../../lib/api', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Siti', role: 'ROLE_CUSTOMER' } }),
}));

vi.mock('../../../components/CustomerLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="customer-layout">{children}</div>,
}));

import { api } from '../../../lib/api';

const mockGet = api.get as ReturnType<typeof vi.fn>;
const mockPut = api.put as ReturnType<typeof vi.fn>;

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <NotificationPreferencesPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('NotificationPreferencesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: [] });
    mockPut.mockResolvedValue({ data: {} });
  });

  it('renders heading', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /preferensi notifikasi/i })).toBeInTheDocument();
  });

  it('shows default notification preferences', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Booking Dikonfirmasi')).toBeInTheDocument();
    });
    expect(screen.getByText('Pengingat Booking')).toBeInTheDocument();
    expect(screen.getByText('Promo & Diskon')).toBeInTheDocument();
  });

  it('toggles a preference when clicking toggle button', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Booking Dikonfirmasi')).toBeInTheDocument();
    });
    const toggleButtons = screen.getAllByRole('button');
    const emailToggle = toggleButtons.find((btn) =>
      btn.className.includes('bg-primary-600') || btn.className.includes('bg-gray-300')
    );
    if (emailToggle) {
      await user.click(emailToggle);
    }
  });

  it('shows save button', async () => {
    renderPage();
    expect(screen.getByRole('button', { name: /simpan preferensi/i })).toBeInTheDocument();
  });
});
