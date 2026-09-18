import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ProtectedRoute from '../ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('../auth', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderWithRouter(ui: React.ReactElement, initialEntries = ['/protected']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null });
    const { container } = renderWithRouter(
      <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
    );
    expect(container.innerHTML).not.toContain('Protected Content');
  });

  it('renders children when authenticated without role requirement', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'ROLE_CUSTOMER' } });
    renderWithRouter(
      <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when user has required role', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'ROLE_PLATFORM_ADMIN' } });
    renderWithRouter(
      <ProtectedRoute requiredRole="ROLE_PLATFORM_ADMIN"><div>Admin Content</div></ProtectedRoute>
    );
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('redirects customer to / when accessing admin route', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'ROLE_CUSTOMER' } });
    const { container } = renderWithRouter(
      <ProtectedRoute requiredRole="ROLE_PLATFORM_ADMIN"><div>Admin Content</div></ProtectedRoute>
    );
    expect(container.innerHTML).not.toContain('Admin Content');
  });

  it('redirects provider to /provider/dashboard when accessing admin route', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'ROLE_PROVIDER_OWNER' } });
    const { container } = renderWithRouter(
      <ProtectedRoute requiredRole="ROLE_PLATFORM_ADMIN"><div>Admin Content</div></ProtectedRoute>
    );
    expect(container.innerHTML).not.toContain('Admin Content');
  });

  it('allows provider to access provider route', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'ROLE_PROVIDER_OWNER' } });
    renderWithRouter(
      <ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><div>Provider Content</div></ProtectedRoute>
    );
    expect(screen.getByText('Provider Content')).toBeInTheDocument();
  });

  it('allows staff to access provider route (startsWith check)', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'ROLE_PROVIDER_STAFF' } });
    renderWithRouter(
      <ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><div>Provider Content</div></ProtectedRoute>
    );
    expect(screen.getByText('Provider Content')).toBeInTheDocument();
  });

  it('redirects admin to /admin/dashboard when accessing provider route', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'ROLE_PLATFORM_ADMIN' } });
    const { container } = renderWithRouter(
      <ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><div>Provider Content</div></ProtectedRoute>
    );
    expect(container.innerHTML).not.toContain('Provider Content');
  });

  it('redirects unknown role to / as final fallback', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'ROLE_GHOST' } });
    const { container } = renderWithRouter(
      <ProtectedRoute requiredRole="ROLE_PLATFORM_ADMIN"><div>Admin Content</div></ProtectedRoute>
    );
    expect(container.innerHTML).not.toContain('Admin Content');
  });
});
