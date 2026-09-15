import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileCompletePage from '../ProfileCompletePage';

const mockNavigate = vi.fn();
const mockCompleteProfile = vi.fn();
let authState: { user: any; completeProfile: Function } = { user: null, completeProfile: mockCompleteProfile };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../lib/auth', () => ({
  useAuth: () => authState,
}));

function renderPage(userOverride?: Record<string, unknown> | null) {
  const defaultUser = {
    id: 'u1',
    name: 'Budi',
    email: 'budi@test.com',
    hasProfile: false,
  };
  authState = {
    user: userOverride === null ? null : { ...defaultUser, ...(userOverride ?? {}) },
    completeProfile: mockCompleteProfile,
  };
  return render(
    <MemoryRouter>
      <ProfileCompletePage />
    </MemoryRouter>,
  );
}

describe('ProfileCompletePage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockCompleteProfile.mockReset();
    mockCompleteProfile.mockResolvedValue(undefined);
    authState = { user: null, completeProfile: mockCompleteProfile };
  });

  it('shows login link when no user', () => {
    renderPage(null);
    const link = screen.getByText('Silakan login terlebih dahulu');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/login');
  });

  it('navigates to / when user hasProfile', () => {
    renderPage({ hasProfile: true });
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('renders form with name and phone fields', () => {
    renderPage();
    expect(screen.getByPlaceholderText('Masukkan nama Anda')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('08xxxxxxxxxx')).toBeInTheDocument();
  });

  it('shows DEKAT brand and Lengkapi Profil heading', () => {
    renderPage();
    expect(screen.getByText('DEKAT')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Lengkapi Profil' })).toBeInTheDocument();
  });

  it('validates name min 2 chars', async () => {
    renderPage();
    const nameInput = screen.getByPlaceholderText('Masukkan nama Anda');
    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan & lanjutkan/i }));
    await waitFor(() => {
      expect(screen.getByText('Nama harus minimal 2 karakter')).toBeInTheDocument();
    });
    expect(mockCompleteProfile).not.toHaveBeenCalled();
  });

  it('validates phone min 10 digits', async () => {
    renderPage();
    const nameInput = screen.getByPlaceholderText('Masukkan nama Anda');
    const phoneInput = screen.getByPlaceholderText('08xxxxxxxxxx');
    fireEvent.change(nameInput, { target: { value: 'Budi' } });
    fireEvent.change(phoneInput, { target: { value: '123456789' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan & lanjutkan/i }));
    await waitFor(() => {
      expect(screen.getByText('Nomor telepon minimal 10 digit')).toBeInTheDocument();
    });
    expect(mockCompleteProfile).not.toHaveBeenCalled();
  });

  it('validates phone regex for invalid format', async () => {
    renderPage();
    const nameInput = screen.getByPlaceholderText('Masukkan nama Anda');
    const phoneInput = screen.getByPlaceholderText('08xxxxxxxxxx');
    fireEvent.change(nameInput, { target: { value: 'Budi' } });
    fireEvent.change(phoneInput, { target: { value: 'abcdefghij' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan & lanjutkan/i }));
    await waitFor(() => {
      expect(screen.getByText(/nomor telepon tidak valid/i)).toBeInTheDocument();
    });
    expect(mockCompleteProfile).not.toHaveBeenCalled();
  });

  it('shows default name from user.name', () => {
    renderPage({ name: 'Andi' });
    const nameInput = screen.getByPlaceholderText('Masukkan nama Anda') as HTMLInputElement;
    expect(nameInput.value).toBe('Andi');
  });

  it('submits form successfully and calls completeProfile', async () => {
    renderPage();
    const nameInput = screen.getByPlaceholderText('Masukkan nama Anda');
    const phoneInput = screen.getByPlaceholderText('08xxxxxxxxxx');
    fireEvent.change(nameInput, { target: { value: 'Budi Santoso' } });
    fireEvent.change(phoneInput, { target: { value: '081234567890' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan & lanjutkan/i }));
    await waitFor(() => {
      expect(mockCompleteProfile).toHaveBeenCalledWith({
        nickname: 'Budi Santoso',
        name: 'Budi Santoso',
        phone: '081234567890',
      });
    });
  });

  it('shows server error on failure', async () => {
    mockCompleteProfile.mockRejectedValue(new Error('Server error'));
    renderPage();
    const nameInput = screen.getByPlaceholderText('Masukkan nama Anda');
    const phoneInput = screen.getByPlaceholderText('08xxxxxxxxxx');
    fireEvent.change(nameInput, { target: { value: 'Budi Santoso' } });
    fireEvent.change(phoneInput, { target: { value: '081234567890' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan & lanjutkan/i }));
    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('shows Menyimpan... loading state during submission', async () => {
    mockCompleteProfile.mockReturnValue(new Promise(() => {}));
    renderPage();
    const nameInput = screen.getByPlaceholderText('Masukkan nama Anda');
    const phoneInput = screen.getByPlaceholderText('08xxxxxxxxxx');
    fireEvent.change(nameInput, { target: { value: 'Budi Santoso' } });
    fireEvent.change(phoneInput, { target: { value: '081234567890' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan & lanjutkan/i }));
    await waitFor(() => {
      expect(screen.getByText('Menyimpan...')).toBeInTheDocument();
    });
  });

  it('navigates to / after save when hasProfile becomes true', async () => {
    authState = {
      user: { id: 'u1', name: 'Budi', email: 'budi@test.com', hasProfile: false },
      completeProfile: mockCompleteProfile,
    };
    const { rerender } = render(
      <MemoryRouter>
        <ProfileCompletePage />
      </MemoryRouter>,
    );
    const nameInput = screen.getByPlaceholderText('Masukkan nama Anda');
    const phoneInput = screen.getByPlaceholderText('08xxxxxxxxxx');
    fireEvent.change(nameInput, { target: { value: 'Budi Santoso' } });
    fireEvent.change(phoneInput, { target: { value: '081234567890' } });
    mockCompleteProfile.mockImplementation(async () => {
      authState = {
        user: { id: 'u1', name: 'Budi', email: 'budi@test.com', hasProfile: true },
        completeProfile: mockCompleteProfile,
      };
    });
    fireEvent.click(screen.getByRole('button', { name: /simpan & lanjutkan/i }));
    await waitFor(() => {
      expect(mockCompleteProfile).toHaveBeenCalled();
    });
    rerender(
      <MemoryRouter>
        <ProfileCompletePage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('shows user email in the form header', () => {
    renderPage({ email: 'test@example.com' });
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('phone accepts +62 prefix format', async () => {
    renderPage();
    const nameInput = screen.getByPlaceholderText('Masukkan nama Anda');
    const phoneInput = screen.getByPlaceholderText('08xxxxxxxxxx');
    fireEvent.change(nameInput, { target: { value: 'Budi Santoso' } });
    fireEvent.change(phoneInput, { target: { value: '+6281234567890' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan & lanjutkan/i }));
    await waitFor(() => {
      expect(mockCompleteProfile).toHaveBeenCalledWith({
        nickname: 'Budi Santoso',
        name: 'Budi Santoso',
        phone: '+6281234567890',
      });
    });
  });

  it('shows non-Error exception as generic message', async () => {
    mockCompleteProfile.mockRejectedValue('unknown');
    renderPage();
    const nameInput = screen.getByPlaceholderText('Masukkan nama Anda');
    const phoneInput = screen.getByPlaceholderText('08xxxxxxxxxx');
    fireEvent.change(nameInput, { target: { value: 'Budi Santoso' } });
    fireEvent.change(phoneInput, { target: { value: '081234567890' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan & lanjutkan/i }));
    await waitFor(() => {
      expect(screen.getByText('Gagal menyimpan profil')).toBeInTheDocument();
    });
  });
});
