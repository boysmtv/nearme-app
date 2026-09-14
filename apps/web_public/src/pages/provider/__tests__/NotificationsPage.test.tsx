import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotificationsPage from '../NotificationsPage';

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

vi.mock('../../../lib/api', () => ({
  providerApi: {
    notifications: { list: vi.fn(), markAllRead: vi.fn() },
  },
}));

vi.mock('../../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="provider-layout">{children}</div>,
}));

import { providerApi } from '../../../lib/api';
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderNotifications() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <NotificationsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('NotificationsPage (provider)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders Notifications heading', () => {
    (providerApi.notifications.list as any).mockResolvedValue({ data: { data: [] } });
    renderNotifications();
    expect(screen.getByText(/notifikasi/i)).toBeInTheDocument();
  });

  it('renders ProviderLayout', () => {
    (providerApi.notifications.list as any).mockResolvedValue({ data: { data: [] } });
    renderNotifications();
    expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
  });
});
