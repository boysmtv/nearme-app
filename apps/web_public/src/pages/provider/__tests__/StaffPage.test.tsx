import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StaffPage from '../StaffPage';

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

vi.mock('../../../lib/api', () => ({
  providerApi: {
    staff: { list: vi.fn(), invite: vi.fn(), update: vi.fn(), deactivate: vi.fn(), updateSchedule: vi.fn() },
  },
}));

vi.mock('../../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="provider-layout">{children}</div>,
}));

import { providerApi } from '../../../lib/api';

const mockStaffList = providerApi.staff.list as ReturnType<typeof vi.fn>;
const mockStaffInvite = providerApi.staff.invite as ReturnType<typeof vi.fn>;
const mockStaffUpdate = providerApi.staff.update as ReturnType<typeof vi.fn>;
const mockStaffDeactivate = providerApi.staff.deactivate as ReturnType<typeof vi.fn>;
const mockStaffUpdateSchedule = providerApi.staff.updateSchedule as ReturnType<typeof vi.fn>;

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
}

function renderPage(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <StaffPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const staffMembers = [
  { id: 's1', displayName: 'Andi', email: 'andi@test.com', title: 'Barber', isActive: true },
  { id: 's2', displayName: 'Rudi', email: 'rudi@test.com', title: 'Senior Barber', isActive: true },
  { id: 's3', displayName: 'Maya', email: 'maya@test.com', title: 'Receptionist', isActive: false },
];

describe('StaffPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStaffList.mockResolvedValue({ data: staffMembers });
  });

  it('renders heading, description, and invite button', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /staf/i })).toBeInTheDocument();
    expect(screen.getByText(/kelola staf dan jadwal kerja/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /undang staf/i })).toBeInTheDocument();
    expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    mockStaffList.mockReturnValue(new Promise(() => {}));
    renderPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders staff cards with avatar initials', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    expect(screen.getByText('AN')).toBeInTheDocument();
    expect(screen.getByText('RU')).toBeInTheDocument();
    expect(screen.getByText('MA')).toBeInTheDocument();
  });

  it('displays staff titles and emails', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    expect(screen.getByText('Barber')).toBeInTheDocument();
    expect(screen.getByText('Senior Barber')).toBeInTheDocument();
    expect(screen.getByText('Receptionist')).toBeInTheDocument();
  });

  it('displays active/inactive badges', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    const activeBadges = screen.getAllByText('Aktif');
    expect(activeBadges.length).toBe(2);
    expect(screen.getByText('Nonaktif')).toBeInTheDocument();
  });

  it('shows empty state when no staff', async () => {
    mockStaffList.mockResolvedValue({ data: [] });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Belum ada staf')).toBeInTheDocument();
    });
    expect(screen.getByText('Undang staf pertama Anda')).toBeInTheDocument();
  });

  it('opens invite modal when clicking Undang Staf', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /undang staf/i }));
    expect(screen.getByText('Undang Staf Baru')).toBeInTheDocument();
    expect(screen.getByText('Kirim Undangan')).toBeInTheDocument();
  });

  it('submits invite form', async () => {
    const user = userEvent.setup();
    mockStaffInvite.mockResolvedValue({ data: {} });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /undang staf/i }));
    const inputs = screen.getAllByRole('textbox');
    const nameInput = inputs.find(i => i.getAttribute('required') !== null || i.className.includes('rounded-lg'));
    if (nameInput) await user.type(nameInput, 'Budi');
    const emailInput = inputs[inputs.length - 1];
    await user.type(emailInput, 'budi@test.com');
    await user.click(screen.getByText('Kirim Undangan'));
    await waitFor(() => {
      expect(mockStaffInvite).toHaveBeenCalled();
    });
  });

  it('closes invite modal when clicking Batal', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /undang staf$/i }));
    expect(screen.getByText('Undang Staf Baru')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /batal$/i }));
    expect(screen.queryByText('Undang Staf Baru')).not.toBeInTheDocument();
  });

  it('enters edit mode when clicking Edit', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);
    expect(screen.getByDisplayValue('Andi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /simpan/i })).toBeInTheDocument();
  });

  it('saves staff name change', async () => {
    const user = userEvent.setup();
    mockStaffUpdate.mockResolvedValue({ data: {} });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);
    const input = screen.getByDisplayValue('Andi');
    await user.clear(input);
    await user.type(input, 'Andi Baru');
    await user.click(screen.getByRole('button', { name: /simpan/i }));
    await waitFor(() => {
      expect(mockStaffUpdate).toHaveBeenCalledWith('s1', { displayName: 'Andi Baru' });
    });
  });

  it('cancels edit mode when clicking Batal', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);
    expect(screen.getByDisplayValue('Andi')).toBeInTheDocument();
    const cancelButtons = screen.getAllByText('Batal');
    await user.click(cancelButtons[cancelButtons.length - 1]);
    expect(screen.queryByDisplayValue('Andi')).not.toBeInTheDocument();
  });

  it('deactivates active staff after confirmation', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => true);
    mockStaffDeactivate.mockResolvedValue({ data: {} });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    const deactivateButtons = screen.getAllByText('Nonaktifkan');
    await user.click(deactivateButtons[0]);
    expect(window.confirm).toHaveBeenCalledWith('Nonaktifkan staf ini?');
    expect(mockStaffDeactivate).toHaveBeenCalledWith('s1');
  });

  it('opens schedule panel when clicking Jadwal', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    const scheduleButtons = screen.getAllByText('Jadwal');
    await user.click(scheduleButtons[0]);
    expect(screen.getByText('Atur Jadwal Staf')).toBeInTheDocument();
    expect(screen.getByText('Minggu')).toBeInTheDocument();
    expect(screen.getByText('Senin')).toBeInTheDocument();
    expect(screen.getByText('Selasa')).toBeInTheDocument();
    expect(screen.getByText('Simpan Jadwal')).toBeInTheDocument();
  });

  it('saves schedule when clicking Simpan Jadwal', async () => {
    const user = userEvent.setup();
    mockStaffUpdateSchedule.mockResolvedValue({ data: {} });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    const scheduleButtons = screen.getAllByText('Jadwal');
    await user.click(scheduleButtons[0]);
    await user.click(screen.getByRole('button', { name: /simpan jadwal/i }));
    await waitFor(() => {
      expect(mockStaffUpdateSchedule).toHaveBeenCalled();
    });
  });

  it('closes schedule panel when clicking Tutup', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    const scheduleButtons = screen.getAllByText('Jadwal');
    await user.click(scheduleButtons[0]);
    expect(screen.getByText('Atur Jadwal Staf')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /tutup/i }));
    expect(screen.queryByText('Atur Jadwal Staf')).not.toBeInTheDocument();
  });

  it('toggles day off and edits shift times', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Andi')).toBeInTheDocument();
    });
    const scheduleButtons = screen.getAllByText('Jadwal');
    await user.click(scheduleButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Atur Jadwal Staf')).toBeInTheDocument();
    });
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBeGreaterThan(0);
    fireEvent.click(checkboxes[0]);
    const timeInputs = document.querySelectorAll('input[type="time"]');
    if (timeInputs.length >= 2) {
      fireEvent.change(timeInputs[0], { target: { value: '08:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '17:00' } });
      expect((timeInputs[0] as HTMLInputElement).value).toBe('08:00');
    }
  });
});
