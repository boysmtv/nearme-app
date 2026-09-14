import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AnalyticsPage from '../AnalyticsPage';

vi.mock('../../lib/api', () => ({
  adminApi: {
    analytics: { get: vi.fn() },
  },
}));

vi.mock('../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

import { adminApi } from '../../lib/api';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderAnalytics() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AnalyticsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('AnalyticsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders Analytics heading', () => {
    (adminApi.analytics.get as any).mockResolvedValue({ data: {} });
    renderAnalytics();
    expect(screen.getByText(/analytics/i)).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    (adminApi.analytics.get as any).mockReturnValue(new Promise(() => {}));
    const { container } = renderAnalytics();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
