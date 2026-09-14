import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ProfileCompletePage from '../ProfileCompletePage';

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: '', email: 'siti@gmail.com', hasProfile: false },
    completeProfile: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe('ProfileCompletePage', () => {
  it('renders profile form', () => {
    render(
      <MemoryRouter>
        <ProfileCompletePage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Lengkapi Profil')).toBeInTheDocument();
    expect(screen.getByText('Simpan & Lanjutkan')).toBeInTheDocument();
  });

  it('shows email', () => {
    render(
      <MemoryRouter>
        <ProfileCompletePage />
      </MemoryRouter>,
    );
    expect(screen.getByText('siti@gmail.com')).toBeInTheDocument();
  });

  it('renders form fields', () => {
    render(
      <MemoryRouter>
        <ProfileCompletePage />
      </MemoryRouter>,
    );
    expect(screen.getByPlaceholderText('Masukkan nama Anda')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('08xxxxxxxxxx')).toBeInTheDocument();
  });

  it('shows DEKAT brand', () => {
    render(
      <MemoryRouter>
        <ProfileCompletePage />
      </MemoryRouter>,
    );
    expect(screen.getByText('DEKAT')).toBeInTheDocument();
  });
});
