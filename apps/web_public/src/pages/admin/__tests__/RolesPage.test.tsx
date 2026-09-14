import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RolesPage from '../RolesPage';

vi.mock('../../../lib/api', () => ({
  api: { get: vi.fn(), put: vi.fn() },
}));

import { api } from '../../../lib/api';

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
}

function renderRoles(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <RolesPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const mockUsers = [
  { id: 'u1', name: 'Budi', email: 'budi@test.com', role: 'ROLE_CUSTOMER' },
  { id: 'u2', name: 'Admin', email: 'admin@test.com', role: 'ROLE_PLATFORM_ADMIN' },
  { id: 'u3', name: 'Owner', email: 'owner@test.com', role: 'ROLE_PROVIDER_OWNER' },
  { id: 'u4', name: 'Staff', email: 'staff@test.com', role: 'ROLE_PROVIDER_STAFF' },
  { id: 'u5', name: 'Another Customer', email: 'another@test.com', role: 'ROLE_CUSTOMER' },
];

describe('web_public admin RolesPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders heading and role cards', async () => {
    (api.get as any).mockResolvedValue({ data: { data: [] } });
    renderRoles();
    await waitFor(() => {
      expect(screen.getByText('Manajemen Role')).toBeInTheDocument();
    });
    expect(screen.getByText('Platform Admin')).toBeInTheDocument();
    expect(screen.getByText('Provider Owner')).toBeInTheDocument();
    expect(screen.getByText('Provider Staff')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    // Role descriptions
    expect(screen.getByText('Akses penuh ke seluruh platform')).toBeInTheDocument();
    expect(screen.getByText('Mengelola bisnis dan booking')).toBeInTheDocument();
    expect(screen.getByText('Staf yang melayani booking')).toBeInTheDocument();
    expect(screen.getByText('Pengguna yang melakukan booking')).toBeInTheDocument();
  });

  it('shows zero counts when no users', async () => {
    (api.get as any).mockResolvedValue({ data: { data: [] } });
    renderRoles();
    await waitFor(() => {
      expect(screen.getByText('Manajemen Role')).toBeInTheDocument();
    });
    const countElements = document.querySelectorAll('.text-3xl.font-bold');
    expect(countElements.length).toBe(4);
    countElements.forEach((el) => {
      expect(el.textContent).toBe('0');
    });
  });

  it('shows correct role counts from user data', async () => {
    (api.get as any).mockResolvedValue({ data: { data: mockUsers } });
    renderRoles();
    // Wait for user data to load (renders user list)
    await waitFor(() => {
      expect(screen.getByText('Budi')).toBeInTheDocument();
    });
    // Now role counts should be computed from loaded users
    const countElements = document.querySelectorAll('.text-3xl.font-bold');
    expect(countElements.length).toBe(4);
    const counts = Array.from(countElements).map((el) => parseInt(el.textContent || '0', 10));
    expect(counts.every((c) => !isNaN(c))).toBe(true);
    // Total users: 5, so sum of counts should be 5
    expect(counts.reduce((a, b) => a + b, 0)).toBe(5);
  });

  it('renders user list section heading', async () => {
    (api.get as any).mockResolvedValue({ data: { data: mockUsers } });
    renderRoles();
    await waitFor(() => {
      expect(screen.getByText('Semua Pengguna')).toBeInTheDocument();
    });
  });

  it('renders user list with names and emails', async () => {
    (api.get as any).mockResolvedValue({ data: { data: mockUsers } });
    renderRoles();
    await waitFor(() => {
      expect(screen.getByText('Budi')).toBeInTheDocument();
    });
    expect(screen.getByText('budi@test.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('owner@test.com')).toBeInTheDocument();
    expect(screen.getByText('Staff')).toBeInTheDocument();
    expect(screen.getByText('staff@test.com')).toBeInTheDocument();
  });

  it('renders role select dropdowns for each user', async () => {
    (api.get as any).mockResolvedValue({ data: { data: mockUsers } });
    renderRoles();
    await waitFor(() => {
      expect(screen.getByText('Budi')).toBeInTheDocument();
    });
    // Each user row has a <select> with role options
    const selects = document.querySelectorAll('select');
    expect(selects.length).toBe(mockUsers.length);
    // Each select should have 4 options (the 4 roles)
    selects.forEach((select) => {
      expect(select.querySelectorAll('option').length).toBe(4);
    });
  });

  it('calls api.put when role changed', async () => {
    (api.get as any).mockResolvedValue({ data: { data: mockUsers } });
    (api.put as any).mockResolvedValue({});
    const user = userEvent.setup();
    renderRoles();
    await waitFor(() => {
      expect(screen.getByText('Budi')).toBeInTheDocument();
    });
    const selects = document.querySelectorAll('select');
    // Change first user's role to Platform Admin
    await user.selectOptions(selects[0], 'ROLE_PLATFORM_ADMIN');
    expect(api.put).toHaveBeenCalledWith('/admin/users/u1/role', { role: 'ROLE_PLATFORM_ADMIN' });
  });

  it('renders loading skeleton while fetching', () => {
    (api.get as any).mockReturnValue(new Promise(() => {}));
    renderRoles();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders user avatar initial from name', async () => {
    (api.get as any).mockResolvedValue({ data: { data: mockUsers } });
    renderRoles();
    await waitFor(() => {
      expect(screen.getByText('Budi')).toBeInTheDocument();
    });
    // Each user has an avatar with first letter
    const avatars = document.querySelectorAll('.bg-primary-100.rounded-full');
    expect(avatars.length).toBe(mockUsers.length);
    // First avatar should have 'B' (first letter of Budi)
    expect(avatars[0].textContent?.trim()).toBe('B');
  });
});
