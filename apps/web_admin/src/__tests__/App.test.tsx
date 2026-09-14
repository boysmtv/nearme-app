import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { App } from '../App';

vi.mock('../lib/api', () => ({
  adminApi: {
    auth: { login: vi.fn(), logout: vi.fn() },
    dashboard: { getStats: vi.fn() },
    users: { list: vi.fn() },
    tenants: { list: vi.fn() },
    bookings: { list: vi.fn() },
    payments: { list: vi.fn() },
    cases: { list: vi.fn() },
    config: { getFlags: vi.fn() },
    auditLogs: { list: vi.fn() },
    subscriptions: { list: vi.fn(), listPlans: vi.fn() },
    export: { users: vi.fn(), bookings: vi.fn() },
  },
}));

vi.mock('../lib/auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({ user: null, isAuthenticated: false, login: vi.fn(), logout: vi.fn() }),
}));

vi.mock('../pages/LoginPage', () => ({ default: () => <div>Login Page</div> }));
vi.mock('../pages/DashboardPage', () => ({ default: () => <div>Dashboard Page</div> }));
vi.mock('../pages/UsersPage', () => ({ default: () => <div>Users Page</div> }));
vi.mock('../pages/TenantsPage', () => ({ default: () => <div>Tenants Page</div> }));
vi.mock('../pages/BookingsPage', () => ({ default: () => <div>Bookings Page</div> }));
vi.mock('../pages/PaymentsPage', () => ({ default: () => <div>Payments Page</div> }));
vi.mock('../pages/CasesPage', () => ({ default: () => <div>Cases Page</div> }));
vi.mock('../pages/ConfigPage', () => ({ default: () => <div>Config Page</div> }));
vi.mock('../pages/AnalyticsPage', () => ({ default: () => <div>Analytics Page</div> }));
vi.mock('../pages/AuditLogPage', () => ({ default: () => <div>Audit Log Page</div> }));
vi.mock('../pages/SubscriptionsPage', () => ({ default: () => <div>Subscriptions Page</div> }));
vi.mock('../pages/FeatureFlagsPage', () => ({ default: () => <div>Feature Flags Page</div> }));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', async () => {
    renderApp();
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });

  it('renders login page at /login', async () => {
    renderApp('/login');
    expect(await screen.findByText('Login Page')).toBeInTheDocument();
  });

  it('redirects unauthenticated user from /dashboard to /login', async () => {
    renderApp('/dashboard');
    expect(await screen.findByText('Login Page')).toBeInTheDocument();
  });

  it('redirects unknown routes to /login when unauthenticated', async () => {
    renderApp('/unknown');
    expect(await screen.findByText('Login Page')).toBeInTheDocument();
  });

  it('redirects / to /login when unauthenticated', async () => {
    renderApp('/');
    expect(await screen.findByText('Login Page')).toBeInTheDocument();
  });

  it('renders dashboard page when authenticated', async () => {
    localStorage.setItem('auth_token', 'valid-token');
    renderApp('/dashboard');
    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
  });

  it('shows users page when authenticated', async () => {
    localStorage.setItem('auth_token', 'valid-token');
    renderApp('/users');
    expect(await screen.findByText('Users Page')).toBeInTheDocument();
  });

  it('shows tenants page when authenticated', async () => {
    localStorage.setItem('auth_token', 'valid-token');
    renderApp('/tenants');
    expect(await screen.findByText('Tenants Page')).toBeInTheDocument();
  });

  it('shows bookings page when authenticated', async () => {
    localStorage.setItem('auth_token', 'valid-token');
    renderApp('/bookings');
    expect(await screen.findByText('Bookings Page')).toBeInTheDocument();
  });

  it('shows payments page when authenticated', async () => {
    localStorage.setItem('auth_token', 'valid-token');
    renderApp('/payments');
    expect(await screen.findByText('Payments Page')).toBeInTheDocument();
  });

  it('shows cases page when authenticated', async () => {
    localStorage.setItem('auth_token', 'valid-token');
    renderApp('/cases');
    expect(await screen.findByText('Cases Page')).toBeInTheDocument();
  });

  it('shows config page when authenticated', async () => {
    localStorage.setItem('auth_token', 'valid-token');
    renderApp('/config');
    expect(await screen.findByText('Config Page')).toBeInTheDocument();
  });

  it('shows analytics page when authenticated', async () => {
    localStorage.setItem('auth_token', 'valid-token');
    renderApp('/analytics');
    expect(await screen.findByText('Analytics Page')).toBeInTheDocument();
  });

  it('shows audit-logs page when authenticated', async () => {
    localStorage.setItem('auth_token', 'valid-token');
    renderApp('/audit-logs');
    expect(await screen.findByText('Audit Log Page')).toBeInTheDocument();
  });

  it('shows subscriptions page when authenticated', async () => {
    localStorage.setItem('auth_token', 'valid-token');
    renderApp('/subscriptions');
    expect(await screen.findByText('Subscriptions Page')).toBeInTheDocument();
  });

  it('shows feature-flags page when authenticated', async () => {
    localStorage.setItem('auth_token', 'valid-token');
    renderApp('/feature-flags');
    expect(await screen.findByText('Feature Flags Page')).toBeInTheDocument();
  });

  it('redirects unknown route to /dashboard when authenticated', async () => {
    localStorage.setItem('auth_token', 'valid-token');
    renderApp('/unknown');
    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
  });
});
