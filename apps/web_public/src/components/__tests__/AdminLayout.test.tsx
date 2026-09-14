import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import AdminLayout from '../AdminLayout';

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({
    user: { name: 'Admin User', email: 'admin@dekat.id', role: 'ROLE_PLATFORM_ADMIN' },
    logout: vi.fn(),
  }),
}));

function renderAdminLayout(children?: React.ReactNode) {
  return render(
    <MemoryRouter>
      <AdminLayout>{children ?? <div data-testid="child">Child Content</div>}</AdminLayout>
    </MemoryRouter>
  );
}

describe('AdminLayout', () => {
  it('renders admin heading', () => {
    renderAdminLayout();
    expect(screen.getAllByText('DEKAT Admin').length).toBeGreaterThanOrEqual(1);
  });

  it('renders sidebar navigation items', () => {
    renderAdminLayout();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Tenants')).toBeInTheDocument();
  });

  it('renders children content', () => {
    renderAdminLayout();
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders admin panel badge', () => {
    renderAdminLayout();
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });
});
