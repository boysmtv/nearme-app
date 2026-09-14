import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import AdminLayout from '../AdminLayout';

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({
    user: { name: 'Admin User', email: 'admin@test.com', role: 'ROLE_PLATFORM_ADMIN' },
    logout: vi.fn(),
  }),
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderLayout() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdminLayout><div>Test Content</div></AdminLayout>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('AdminLayout', () => {
  it('renders sidebar with DEKAT Admin branding', () => {
    renderLayout();
    expect(screen.getAllByText('DEKAT Admin').length).toBeGreaterThan(0);
  });

  it('renders children content', () => {
    renderLayout();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders admin user name', () => {
    renderLayout();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('renders admin user email', () => {
    renderLayout();
    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
  });

  it('renders sidebar navigation items', () => {
    renderLayout();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Tenants')).toBeInTheDocument();
    expect(screen.getByText('Bookings')).toBeInTheDocument();
  });

  it('renders Admin Panel badge', () => {
    renderLayout();
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });
});
