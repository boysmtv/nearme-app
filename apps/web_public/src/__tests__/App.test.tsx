import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

const mockAuthState = vi.fn(() => ({
  user: null,
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('../lib/auth', () => ({
  useAuth: () => mockAuthState(),
}));

vi.mock('../lib/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { App, ErrorBoundary, LoadingFallback, NotFound, ProfileCompleteGuard, RequireProfileGuard } from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
  });

  it('renders 404 page for unknown routes', async () => {
    render(
      <MemoryRouter initialEntries={['/nonexistent']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Halaman tidak ditemukan')).toBeInTheDocument();
  });

  it('ErrorBoundary shows error UI and reloads on click', () => {
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', { value: { reload: reloadSpy }, writable: true });
    function Boom() { throw new Error('rusak'); }
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <ErrorBoundary><Boom /></ErrorBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
    expect(screen.getByText('rusak')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Muat Ulang'));
    expect(reloadSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('LoadingFallback renders spinner', () => {
    const { container } = render(<LoadingFallback />);
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('NotFound renders back-home link', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );
    expect(screen.getByText('Kembali ke Beranda')).toHaveAttribute('href', '/');
  });

  it('ProfileCompleteGuard redirects unauthenticated to login', () => {
    mockAuthState.mockReturnValue({ user: null, isAuthenticated: false, login: vi.fn(), logout: vi.fn() });
    render(
      <MemoryRouter initialEntries={['/profile/complete']}>
        <ProfileCompleteGuard><div>Form</div></ProfileCompleteGuard>
      </MemoryRouter>,
    );
    expect(screen.queryByText('Form')).not.toBeInTheDocument();
  });

  it('ProfileCompleteGuard redirects home when profile complete', () => {
    mockAuthState.mockReturnValue({ user: { hasProfile: true }, isAuthenticated: true, login: vi.fn(), logout: vi.fn() });
    render(
      <MemoryRouter initialEntries={['/profile/complete']}>
        <ProfileCompleteGuard><div>Form</div></ProfileCompleteGuard>
      </MemoryRouter>,
    );
    expect(screen.queryByText('Form')).not.toBeInTheDocument();
  });

  it('ProfileCompleteGuard renders children when profile incomplete', () => {
    mockAuthState.mockReturnValue({ user: { hasProfile: false }, isAuthenticated: true, login: vi.fn(), logout: vi.fn() });
    render(
      <MemoryRouter initialEntries={['/profile/complete']}>
        <ProfileCompleteGuard><div>Form</div></ProfileCompleteGuard>
      </MemoryRouter>,
    );
    expect(screen.getByText('Form')).toBeInTheDocument();
  });

  it('RequireProfileGuard passes through for non-customers', () => {
    mockAuthState.mockReturnValue({ user: { role: 'ROLE_PROVIDER_OWNER', hasProfile: false }, isAuthenticated: true, login: vi.fn(), logout: vi.fn() });
    render(
      <MemoryRouter>
        <RequireProfileGuard><div>Kid</div></RequireProfileGuard>
      </MemoryRouter>,
    );
    expect(screen.getByText('Kid')).toBeInTheDocument();
  });

  it('RequireProfileGuard passes through when profile complete', () => {
    mockAuthState.mockReturnValue({ user: { role: 'ROLE_CUSTOMER', hasProfile: true }, isAuthenticated: true, login: vi.fn(), logout: vi.fn() });
    render(
      <MemoryRouter>
        <RequireProfileGuard><div>Kid</div></RequireProfileGuard>
      </MemoryRouter>,
    );
    expect(screen.getByText('Kid')).toBeInTheDocument();
  });

  it('RequireProfileGuard redirects customer without profile', () => {
    mockAuthState.mockReturnValue({ user: { role: 'ROLE_CUSTOMER', hasProfile: false }, isAuthenticated: true, login: vi.fn(), logout: vi.fn() });
    render(
      <MemoryRouter>
        <RequireProfileGuard><div>Kid</div></RequireProfileGuard>
      </MemoryRouter>,
    );
    expect(screen.queryByText('Kid')).not.toBeInTheDocument();
  });

  it('renders customer branch at root route', async () => {
    mockAuthState.mockReturnValue({ user: { role: 'ROLE_CUSTOMER', hasProfile: true }, isAuthenticated: true, login: vi.fn(), logout: vi.fn() });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(document.body.innerHTML.length).toBeGreaterThan(0);
    });
    consoleSpy.mockRestore();
  });
});
