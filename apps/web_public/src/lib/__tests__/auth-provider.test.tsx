import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { AuthProvider, useAuth } from '../../lib/auth';

vi.mock('../../lib/api', () => ({
  publicApi: {
    auth: {
      login: vi.fn(),
      register: vi.fn(),
    },
    customer: {
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
    },
  },
}));

import { publicApi } from '../../lib/api';

function makeToken(overrides: Record<string, unknown> = {}) {
  const payload = btoa(
    JSON.stringify({
      sub: 'u1',
      email: 'test@test.com',
      name: 'Test User',
      roles: ['ROLE_CUSTOMER'],
      ...overrides,
    }),
  );
  return `header.${payload}.sig`;
}

const mockLogin = vi.mocked(publicApi.auth.login);
const mockRegister = vi.mocked(publicApi.auth.register);
const mockGetProfile = vi.mocked(publicApi.customer.getProfile);
const mockUpdateProfile = vi.mocked(publicApi.customer.updateProfile);

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

describe('auth-provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within AuthProvider');
  });

  it('initializes user from localStorage', () => {
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: 'u1',
        email: 'a@b.com',
        name: 'Alice',
        role: 'ROLE_CUSTOMER',
        hasProfile: true,
      }),
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toEqual({
      id: 'u1',
      email: 'a@b.com',
      name: 'Alice',
      role: 'ROLE_CUSTOMER',
      hasProfile: true,
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('initializes with null user when no localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('login success for ROLE_CUSTOMER with hasProfile navigates /', async () => {
    const token = makeToken({ roles: ['ROLE_CUSTOMER'] });
    mockLogin.mockResolvedValue({
      data: { accessToken: token, refreshToken: 'rt', expiresIn: 900, tokenType: 'Bearer' },
    } as never);
    mockGetProfile.mockResolvedValue({
      success: true,
      data: { exists: true, nickname: 'Alice', phone: '0812' },
    } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@test.com', 'pass');
    });

    expect(result.current.user).toBeTruthy();
    expect(result.current.user?.role).toBe('ROLE_CUSTOMER');
  });

  it('login success for ROLE_CUSTOMER without hasProfile navigates /profile/complete', async () => {
    const token = makeToken({ roles: ['ROLE_CUSTOMER'] });
    mockLogin.mockResolvedValue({
      data: { accessToken: token, refreshToken: 'rt', expiresIn: 900, tokenType: 'Bearer' },
    } as never);
    mockGetProfile.mockResolvedValue({
      success: true,
      data: { exists: false, nickname: '', name: '', phone: '' },
    } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@test.com', 'pass');
    });

    expect(result.current.user).toBeTruthy();
    expect(result.current.user?.hasProfile).toBe(false);
    expect(localStorage.getItem('auth_user')).toBeTruthy();
  });

  it('login success for ROLE_PROVIDER_OWNER navigates /provider/dashboard', async () => {
    const token = makeToken({ roles: ['ROLE_PROVIDER_OWNER'] });
    mockLogin.mockResolvedValue({
      data: { accessToken: token, refreshToken: 'rt', expiresIn: 900, tokenType: 'Bearer' },
    } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('prov@test.com', 'pass');
    });

    expect(result.current.user?.role).toBe('ROLE_PROVIDER_OWNER');
  });

  it('login success for ROLE_PLATFORM_ADMIN navigates /admin/dashboard', async () => {
    const token = makeToken({ roles: ['ROLE_PLATFORM_ADMIN'] });
    mockLogin.mockResolvedValue({
      data: { accessToken: token, refreshToken: 'rt', expiresIn: 900, tokenType: 'Bearer' },
    } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('admin@test.com', 'pass');
    });

    expect(result.current.user?.role).toBe('ROLE_PLATFORM_ADMIN');
  });

  it('login stores auth_token and auth_refresh in localStorage', async () => {
    const token = makeToken();
    mockLogin.mockResolvedValue({
      data: { accessToken: token, refreshToken: 'refresh123', expiresIn: 900, tokenType: 'Bearer' },
    } as never);
    mockGetProfile.mockResolvedValue({
      success: true,
      data: { exists: true, nickname: 'T', phone: '081' },
    } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@test.com', 'pass');
    });

    expect(localStorage.getItem('auth_token')).toBe(token);
    expect(localStorage.getItem('auth_refresh')).toBe('refresh123');
  });

  it('login failure propagates error', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.login('test@test.com', 'wrong');
      }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('register success navigates /profile/complete and sets hasProfile=false', async () => {
    const token = makeToken();
    mockRegister.mockResolvedValue({
      data: { accessToken: token, refreshToken: 'rt', expiresIn: 900, tokenType: 'Bearer' },
    } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register('New User', 'new@test.com', '08123', 'pass');
    });

    expect(result.current.user).toBeTruthy();
    expect(result.current.user?.hasProfile).toBe(false);
    expect(localStorage.getItem('has_profile')).toBe('false');
    expect(localStorage.getItem('auth_token')).toBe(token);
  });

  it('register failure propagates error', async () => {
    mockRegister.mockRejectedValue(new Error('Email taken'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.register('User', 'dup@test.com', '0812', 'pass');
      }),
    ).rejects.toThrow('Email taken');
  });

  it('logout clears localStorage and sets user null', async () => {
    const token = makeToken();
    mockLogin.mockResolvedValue({
      data: { accessToken: token, refreshToken: 'rt', expiresIn: 900, tokenType: 'Bearer' },
    } as never);
    mockGetProfile.mockResolvedValue({
      success: true,
      data: { exists: true, nickname: 'T', phone: '081' },
    } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@test.com', 'pass');
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_refresh')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
    expect(localStorage.getItem('has_profile')).toBeNull();
  });

  it('refreshUser reads token and rebuilds user', async () => {
    const token = makeToken({ sub: 'u2', name: 'Refreshed' });
    localStorage.setItem('auth_token', token);
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: 'u1',
        email: 'old@test.com',
        name: 'Old',
        role: 'ROLE_CUSTOMER',
        hasProfile: true,
      }),
    );
    mockGetProfile.mockResolvedValue({
      success: true,
      data: { exists: true, nickname: 'Refreshed', phone: '081' },
    } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user?.name).toBe('Old');

    await act(async () => {
      result.current.refreshUser();
    });

    expect(result.current.user?.id).toBe('u2');
    expect(result.current.user?.name).toBe('Refreshed');
  });

  it('refreshUser with no token does nothing', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.refreshUser();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('completeProfile calls API and sets hasProfile=true', async () => {
    const token = makeToken();
    localStorage.setItem('auth_token', token);
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: 'u1',
        email: 'test@test.com',
        name: 'Test',
        role: 'ROLE_CUSTOMER',
        hasProfile: false,
      }),
    );
    mockUpdateProfile.mockResolvedValue({ success: true, data: {} } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user?.hasProfile).toBe(false);

    await act(async () => {
      await result.current.completeProfile({ name: 'Test', phone: '0812' });
    });

    expect(mockUpdateProfile).toHaveBeenCalledWith({ name: 'Test', phone: '0812' });
    expect(result.current.user?.hasProfile).toBe(true);
    expect(localStorage.getItem('has_profile')).toBe('true');
  });

  it('completeProfile with no token does not crash', async () => {
    mockUpdateProfile.mockResolvedValue({ success: true, data: {} } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.completeProfile({ name: 'Test' });
    });

    expect(mockUpdateProfile).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });

  it('syncHasProfile with existing profile sets hasProfile=true', async () => {
    const token = makeToken();
    localStorage.setItem('auth_token', token);
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: 'u1',
        email: 'test@test.com',
        name: 'Test',
        role: 'ROLE_CUSTOMER',
        hasProfile: false,
      }),
    );
    localStorage.setItem('has_profile', 'false');
    mockGetProfile.mockResolvedValue({
      success: true,
      data: { exists: true, nickname: 'Alice', phone: '0812' },
    } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      result.current.refreshUser();
    });

    expect(result.current.user?.hasProfile).toBe(true);
    expect(localStorage.getItem('has_profile')).toBe('true');
  });

  it('syncHasProfile API failure keeps existing localStorage value', async () => {
    const token = makeToken();
    localStorage.setItem('auth_token', token);
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: 'u1',
        email: 'test@test.com',
        name: 'Test',
        role: 'ROLE_CUSTOMER',
        hasProfile: true,
      }),
    );
    localStorage.setItem('has_profile', 'true');
    mockGetProfile.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      result.current.refreshUser();
    });

    expect(localStorage.getItem('has_profile')).toBe('true');
    expect(result.current.user?.hasProfile).toBe(true);
  });

  it('useEffect runs syncHasProfile on mount when token exists', async () => {
    const token = makeToken();
    localStorage.setItem('auth_token', token);
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: 'u1',
        email: 'test@test.com',
        name: 'Test',
        role: 'ROLE_CUSTOMER',
        hasProfile: false,
      }),
    );
    mockGetProfile.mockResolvedValue({
      success: true,
      data: { exists: true, nickname: 'Alice', phone: '0812' },
    } as never);

    renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(mockGetProfile).toHaveBeenCalled();
  });

  it('login for ROLE_PROVIDER_STAFF navigates /provider/dashboard', async () => {
    const token = makeToken({ roles: ['ROLE_PROVIDER_STAFF'] });
    mockLogin.mockResolvedValue({
      data: { accessToken: token, refreshToken: 'rt', expiresIn: 900, tokenType: 'Bearer' },
    } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('staff@test.com', 'pass');
    });

    expect(result.current.user?.role).toBe('ROLE_PROVIDER_STAFF');
  });

  it('register stores auth_token and auth_refresh', async () => {
    const token = makeToken();
    mockRegister.mockResolvedValue({
      data: { accessToken: token, refreshToken: 'refreshReg', expiresIn: 900, tokenType: 'Bearer' },
    } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register('User', 'u@test.com', '0812', 'pass');
    });

    expect(localStorage.getItem('auth_token')).toBe(token);
    expect(localStorage.getItem('auth_refresh')).toBe('refreshReg');
  });

  it('syncHasProfile with incomplete profile sets hasProfile=false', async () => {
    const token = makeToken();
    localStorage.setItem('auth_token', token);
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: 'u1',
        email: 'test@test.com',
        name: 'Test',
        role: 'ROLE_CUSTOMER',
        hasProfile: false,
      }),
    );
    localStorage.setItem('has_profile', 'false');
    mockGetProfile.mockResolvedValue({
      success: true,
      data: { exists: false, nickname: '', name: '', phone: '' },
    } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      result.current.refreshUser();
    });

    expect(result.current.user?.hasProfile).toBe(false);
    expect(localStorage.getItem('has_profile')).toBe('false');
  });

  it('syncHasProfile failure with no existing has_profile returns null', async () => {
    const token = makeToken();
    localStorage.setItem('auth_token', token);
    localStorage.setItem('has_profile', 'true');
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: 'u1',
        email: 'test@test.com',
        name: 'Test',
        role: 'ROLE_CUSTOMER',
        hasProfile: true,
      }),
    );
    mockGetProfile.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      result.current.refreshUser();
    });

    expect(result.current.user?.hasProfile).toBe(true);
  });

  it('completeProfile updates auth_user in localStorage', async () => {
    const token = makeToken();
    localStorage.setItem('auth_token', token);
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: 'u1',
        email: 'test@test.com',
        name: 'Test',
        role: 'ROLE_CUSTOMER',
        hasProfile: false,
      }),
    );
    mockUpdateProfile.mockResolvedValue({ success: true, data: {} } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.completeProfile({ nickname: 'Ali' });
    });

    const stored = JSON.parse(localStorage.getItem('auth_user')!);
    expect(stored.hasProfile).toBe(true);
  });

  it('login navigates / for unknown role', async () => {
    const token = makeToken({ roles: ['ROLE_UNKNOWN'] });
    mockLogin.mockResolvedValue({
      data: { accessToken: token, refreshToken: 'rt', expiresIn: 900, tokenType: 'Bearer' },
    } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('x@test.com', 'pass');
    });

    expect(result.current.user?.role).toBe('ROLE_UNKNOWN');
  });
});
