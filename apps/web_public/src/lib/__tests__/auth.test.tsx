import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../../lib/auth';
import React from 'react';

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

function wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter><AuthProvider>{children}</AuthProvider></MemoryRouter>;
}

describe('auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('useAuth throws when used outside provider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within AuthProvider');
  });

  it('provides initial user from localStorage', () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: '1', email: 'test@test.com', name: 'Test', role: 'ROLE_CUSTOMER', hasProfile: true }));
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user?.email).toBe('test@test.com');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('provides null user when no localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('logout clears user and localStorage', () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: '1', email: 'test@test.com', name: 'Test', role: 'ROLE_CUSTOMER', hasProfile: true }));
    localStorage.setItem('auth_token', 'some-token');
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
      result.current.logout();
    });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
