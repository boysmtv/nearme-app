import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FeatureFlagsPage from '../FeatureFlagsPage';

vi.mock('../../../lib/api', () => ({
  adminApi: { config: { getFlags: vi.fn(), toggleFlag: vi.fn(), createFlag: vi.fn(), deleteFlag: vi.fn() } },
}));

vi.mock('../../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

import { adminApi } from '../../../lib/api';

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
}

function renderFlags(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <FeatureFlagsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const mockFlags = [
  { id: 'f1', name: 'enable_chat', key: 'enable-chat', enabled: true, description: 'Chat feature', environment: 'development' },
  { id: 'f2', name: 'dark_mode', key: 'dark-mode', enabled: false, description: 'Dark mode', environment: 'production', targetEnvironment: 'production' },
];

describe('web_public admin FeatureFlagsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders heading and create button', async () => {
    (adminApi.config.getFlags as any).mockResolvedValue({ data: [] });
    renderFlags();
    await waitFor(() => {
      expect(screen.getByText('Feature Flags')).toBeInTheDocument();
    });
    expect(screen.getByText('Kelola fitur dan pengaturan platform')).toBeInTheDocument();
    expect(screen.getByText('+ Buat Flag')).toBeInTheDocument();
  });

  it('shows empty state when no flags', async () => {
    (adminApi.config.getFlags as any).mockResolvedValue({ data: [] });
    renderFlags();
    await waitFor(() => {
      expect(screen.getByText('Belum ada feature flags')).toBeInTheDocument();
    });
  });

  it('renders flag list with toggle and delete buttons', async () => {
    (adminApi.config.getFlags as any).mockResolvedValue({ data: mockFlags });
    renderFlags();
    await waitFor(() => {
      expect(screen.getByText('enable_chat')).toBeInTheDocument();
    });
    expect(screen.getByText('Chat feature')).toBeInTheDocument();
    expect(screen.getByText('enable-chat')).toBeInTheDocument();
    expect(screen.getByText('development')).toBeInTheDocument();
    expect(screen.getByText('dark_mode')).toBeInTheDocument();
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
    expect(screen.getByText('production')).toBeInTheDocument();
    // Toggle buttons exist (2 flags)
    const toggleButtons = document.querySelectorAll('.relative.inline-flex');
    expect(toggleButtons.length).toBe(2);
  });

  it('shows loading skeleton while fetching', () => {
    (adminApi.config.getFlags as any).mockReturnValue(new Promise(() => {}));
    renderFlags();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('opens create modal when Buat Flag clicked', async () => {
    (adminApi.config.getFlags as any).mockResolvedValue({ data: [] });
    const user = userEvent.setup();
    renderFlags();
    await waitFor(() => {
      expect(screen.getByText('+ Buat Flag')).toBeInTheDocument();
    });
    await user.click(screen.getByText('+ Buat Flag'));
    expect(screen.getByText('Buat Feature Flag')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nama flag')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Deskripsi')).toBeInTheDocument();
    expect(screen.getByText('Batal')).toBeInTheDocument();
    expect(screen.getByText('Buat')).toBeInTheDocument();
  });

  it('closes create modal when Batal clicked', async () => {
    (adminApi.config.getFlags as any).mockResolvedValue({ data: [] });
    const user = userEvent.setup();
    renderFlags();
    await waitFor(() => {
      expect(screen.getByText('+ Buat Flag')).toBeInTheDocument();
    });
    await user.click(screen.getByText('+ Buat Flag'));
    await user.click(screen.getByText('Batal'));
    expect(screen.queryByText('Buat Feature Flag')).not.toBeInTheDocument();
  });

  it('calls toggleFlag when toggle clicked', async () => {
    (adminApi.config.getFlags as any).mockResolvedValue({ data: mockFlags });
    (adminApi.config.toggleFlag as any).mockResolvedValue({});
    const user = userEvent.setup();
    renderFlags();
    await waitFor(() => {
      expect(screen.getByText('enable_chat')).toBeInTheDocument();
    });
    const toggleButtons = document.querySelectorAll('.relative.inline-flex');
    await user.click(toggleButtons[0]);
    expect(adminApi.config.toggleFlag).toHaveBeenCalledWith('f1', false);
  });

  it('calls deleteFlag when delete button clicked', async () => {
    (adminApi.config.getFlags as any).mockResolvedValue({ data: mockFlags });
    (adminApi.config.deleteFlag as any).mockResolvedValue({});
    const user = userEvent.setup();
    renderFlags();
    await waitFor(() => {
      expect(screen.getByText('enable_chat')).toBeInTheDocument();
    });
    // Each flag has a delete button with SVG
    const deleteButtons = document.querySelectorAll('button.text-gray-400');
    expect(deleteButtons.length).toBe(2);
    await user.click(deleteButtons[0]);
    expect(adminApi.config.deleteFlag).toHaveBeenCalledWith('f1');
  });

  it('calls createFlag with form data when Buat clicked', async () => {
    (adminApi.config.getFlags as any).mockResolvedValue({ data: [] });
    (adminApi.config.createFlag as any).mockResolvedValue({});
    const user = userEvent.setup();
    renderFlags();
    await waitFor(() => {
      expect(screen.getByText('+ Buat Flag')).toBeInTheDocument();
    });
    await user.click(screen.getByText('+ Buat Flag'));
    await user.type(screen.getByPlaceholderText('Nama flag'), 'new_flag');
    await user.type(screen.getByPlaceholderText('Deskripsi'), 'A new flag');
    await user.click(screen.getByText('Buat'));
    expect(adminApi.config.createFlag).toHaveBeenCalledWith({
      name: 'new_flag',
      key: '',
      description: 'A new flag',
      enabled: false,
      environment: 'development',
    });
  });

  it('disables Buat button when name is empty', async () => {
    (adminApi.config.getFlags as any).mockResolvedValue({ data: [] });
    renderFlags();
    await waitFor(() => {
      expect(screen.getByText('+ Buat Flag')).toBeInTheDocument();
    });
    const user = userEvent.setup();
    await user.click(screen.getByText('+ Buat Flag'));
    const buatButton = screen.getByText('Buat');
    expect(buatButton).toBeDisabled();
  });
});
