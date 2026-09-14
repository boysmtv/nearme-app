import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FeatureFlagsPage from '../FeatureFlagsPage';

vi.mock('../../lib/api', () => ({
  adminApi: {
    config: {
      getFlags: vi.fn(),
      createFlag: vi.fn(),
      updateFlag: vi.fn(),
      toggleFlag: vi.fn(),
    },
  },
}));

vi.mock('../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

import { adminApi } from '../../lib/api';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderFeatureFlags() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <FeatureFlagsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('FeatureFlagsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders Feature Flags heading', () => {
    (adminApi.config.getFlags as any).mockResolvedValue({ data: [] });
    renderFeatureFlags();
    expect(screen.getByText(/feature flags/i)).toBeInTheDocument();
  });

  it('renders flag list when data loads', async () => {
    (adminApi.config.getFlags as any).mockResolvedValue({
      data: [{ id: '1', name: 'enable_chat', enabled: true, description: 'Enable chat feature' }],
    });
    renderFeatureFlags();
    await waitFor(() => {
      expect(screen.getByText('enable_chat')).toBeInTheDocument();
      expect(screen.getByText('Enable chat feature')).toBeInTheDocument();
    });
  });

  it('shows empty state when no flags', async () => {
    (adminApi.config.getFlags as any).mockResolvedValue({ data: [] });
    renderFeatureFlags();
    await waitFor(() => {
      expect(screen.getByText(/belum ada/i)).toBeInTheDocument();
    });
  });
});
