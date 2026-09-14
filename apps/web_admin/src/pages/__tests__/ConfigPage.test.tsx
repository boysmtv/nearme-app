import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConfigPage from '../ConfigPage';

const mockToggleFlag = vi.fn().mockResolvedValue({});
const mockGetFlags = vi.fn();

vi.mock('../../lib/api', () => ({
  adminApi: {
    config: {
      getFlags: (...args: any[]) => mockGetFlags(...args),
      toggleFlag: (...args: any[]) => mockToggleFlag(...args),
    },
  },
}));

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({
    user: { name: 'Admin', email: 'admin@test.com', role: 'ROLE_PLATFORM_ADMIN' },
    logout: vi.fn(),
  }),
}));

vi.mock('../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
}

function renderConfig(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <ConfigPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('ConfigPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Configuration heading', () => {
    mockGetFlags.mockResolvedValue({ data: [] });
    renderConfig();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  it('renders subtitle description', () => {
    mockGetFlags.mockResolvedValue({ data: [] });
    renderConfig();
    expect(screen.getByText(/feature flags dan pengaturan platform/i)).toBeInTheDocument();
  });

  it('shows empty state when no flags exist', async () => {
    mockGetFlags.mockResolvedValue({ data: [] });
    renderConfig();
    await waitFor(() => {
      expect(screen.getByText(/belum ada feature flags/i)).toBeInTheDocument();
    });
  });

  it('renders flag list when data loads', async () => {
    mockGetFlags.mockResolvedValue({
      data: [
        { id: '1', key: 'enable_chat', name: 'Enable Chat', description: 'Turn on chat', enabled: true, environment: 'production' },
        { id: '2', key: 'dark_mode', name: 'Dark Mode', description: 'Dark theme', enabled: false, environment: 'staging' },
      ],
    });
    renderConfig();
    await waitFor(() => {
      expect(screen.getByText('Enable Chat')).toBeInTheDocument();
      expect(screen.getByText('enable_chat')).toBeInTheDocument();
      expect(screen.getByText('Turn on chat')).toBeInTheDocument();
      expect(screen.getByText('production')).toBeInTheDocument();
      expect(screen.getByText('Dark Mode')).toBeInTheDocument();
      expect(screen.getByText('dark_mode')).toBeInTheDocument();
    });
  });

  it('toggles a flag when toggle button clicked', async () => {
    mockGetFlags.mockResolvedValue({
      data: [
        { id: '1', key: 'enable_chat', name: 'Enable Chat', description: 'Chat', enabled: false, environment: 'production' },
      ],
    });
    mockToggleFlag.mockResolvedValue({});
    const { container } = renderConfig();
    await waitFor(() => {
      expect(screen.getByText('Enable Chat')).toBeInTheDocument();
    });
    const toggleButton = container.querySelector('button');
    expect(toggleButton).toBeTruthy();
    fireEvent.click(toggleButton!);
    await waitFor(() => {
      expect(mockToggleFlag).toHaveBeenCalledWith('1', true);
    });
  });

  it('renders AdminLayout wrapper', () => {
    mockGetFlags.mockResolvedValue({ data: [] });
    renderConfig();
    expect(screen.getByTestId('admin-layout')).toBeInTheDocument();
  });
});
