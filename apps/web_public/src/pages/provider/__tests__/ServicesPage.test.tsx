import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServicesPage from '../ServicesPage';

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

const mockServiceList = vi.fn();
const mockServiceCreate = vi.fn();
const mockServiceUpdate = vi.fn();
const mockServiceDelete = vi.fn();

vi.mock('../../../lib/api', () => ({
  providerApi: {
    services: {
      list: (...args: unknown[]) => mockServiceList(...args),
      create: (...args: unknown[]) => mockServiceCreate(...args),
      update: (...args: unknown[]) => mockServiceUpdate(...args),
      delete: (...args: unknown[]) => mockServiceDelete(...args),
    },
  },
}));

vi.mock('../../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="provider-layout">{children}</div>,
}));

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderServices(qc?: ReturnType<typeof createQueryClient>) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <ServicesPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('ServicesPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders Services heading', async () => {
    mockServiceList.mockResolvedValue({ data: [] });
    renderServices();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /layanan/i })).toBeInTheDocument();
    });
  });

  it('renders ProviderLayout', () => {
    mockServiceList.mockResolvedValue({ data: [] });
    renderServices();
    expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
  });

  it('renders service list when data loads', async () => {
    mockServiceList.mockResolvedValue({
      data: [{ id: '1', name: 'Haircut', price: 50000, duration: 30, active: true, description: 'Potong rapi' }],
    });
    renderServices();
    await waitFor(() => {
      expect(screen.getByText('Haircut')).toBeInTheDocument();
    });
  });

  it('shows empty state when no services', async () => {
    mockServiceList.mockResolvedValue({ data: [] });
    renderServices();
    await waitFor(() => {
      expect(screen.getByText(/belum ada layanan/i)).toBeInTheDocument();
    });
  });

  it('shows loading skeletons', async () => {
    mockServiceList.mockReturnValue(new Promise(() => {}));
    renderServices();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('add service button opens modal and creates service', async () => {
    mockServiceCreate.mockResolvedValue({ success: true });
    mockServiceList.mockResolvedValue({ data: [] });
    renderServices();
    await waitFor(() => { expect(screen.getByText(/belum ada layanan/i)).toBeInTheDocument(); });
    fireEvent.click(screen.getByText(/tambah layanan/i));
    await waitFor(() => { expect(screen.getByText('Tambah Layanan')).toBeInTheDocument(); });
    fireEvent.change(document.querySelector('input[name="name"]') as HTMLInputElement, { target: { value: 'Haircut' } });
    fireEvent.change(document.querySelector('textarea[name="description"]') as HTMLInputElement, { target: { value: 'Potong rapi dan bersih' } });
    fireEvent.change(document.querySelector('input[name="duration"]') as HTMLInputElement, { target: { value: '30' } });
    fireEvent.change(document.querySelector('input[name="price"]') as HTMLInputElement, { target: { value: '50000' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan$/i }));
    await waitFor(() => {
      expect(mockServiceCreate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Haircut' }));
    });
  });

  it('edit service opens pre-filled modal and updates', async () => {
    mockServiceList.mockResolvedValue({
      data: [{ id: '1', name: 'Old Service', price: 30000, duration: 20, active: true, description: 'Old description here' }],
    });
    mockServiceUpdate.mockResolvedValue({ success: true });
    renderServices();
    await waitFor(() => { expect(screen.getByText('Old Service')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Edit'));
    await waitFor(() => { expect(screen.getByText('Edit Layanan')).toBeInTheDocument(); });
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
    expect(nameInput.value).toBe('Old Service');
    fireEvent.change(nameInput, { target: { value: 'Updated Service' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan$/i }));
    await waitFor(() => {
      expect(mockServiceUpdate).toHaveBeenCalledWith('1', expect.objectContaining({ name: 'Updated Service' }));
    });
  });

  it('delete service calls API after confirm', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockServiceList.mockResolvedValue({
      data: [{ id: '1', name: 'Delete Me', price: 50000, duration: 30, active: true, description: 'To be deleted' }],
    });
    mockServiceDelete.mockResolvedValue({ success: true });
    renderServices();
    await waitFor(() => { expect(screen.getByText('Delete Me')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Hapus'));
    await waitFor(() => {
      expect(mockServiceDelete).toHaveBeenCalledWith('1');
    });
    vi.restoreAllMocks();
  });

  it('add-on button opens add-on panel', async () => {
    mockServiceList.mockResolvedValue({
      data: [{ id: '1', name: 'Haircut', price: 50000, duration: 30, active: true, description: 'Potong rapi' }],
    });
    renderServices();
    await waitFor(() => { expect(screen.getByText('Haircut')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Add-on'));
    await waitFor(() => {
      expect(screen.getByText('Atur Add-on Layanan')).toBeInTheDocument();
      expect(screen.getByText('Belum ada add-on')).toBeInTheDocument();
    });
  });

  it('add-on: add and remove addon items', async () => {
    mockServiceList.mockResolvedValue({
      data: [{ id: '1', name: 'Haircut', price: 50000, duration: 30, active: true, description: 'Potong rapi' }],
    });
    renderServices();
    await waitFor(() => { expect(screen.getByText('Haircut')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Add-on'));
    await waitFor(() => { expect(screen.getByText('Atur Add-on Layanan')).toBeInTheDocument(); });
    const nameInput = screen.getByPlaceholderText('Nama add-on');
    const priceInput = screen.getByPlaceholderText('Harga');
    fireEvent.change(nameInput, { target: { value: 'Hair Wax' } });
    fireEvent.change(priceInput, { target: { value: '25000' } });
    fireEvent.click(screen.getByText(/\+ tambah$/i));
    await waitFor(() => {
      expect(screen.getByText(/hair wax/i)).toBeInTheDocument();
    });
    const addonRemoveBtn = screen.getAllByText('Hapus').find(el => el.closest('.rounded.border'));
    fireEvent.click(addonRemoveBtn!);
    await waitFor(() => {
      expect(screen.getByText('Belum ada add-on')).toBeInTheDocument();
    });
  });

  it('modal close button works', async () => {
    mockServiceList.mockResolvedValue({ data: [] });
    renderServices();
    await waitFor(() => { expect(screen.getByText(/belum ada layanan/i)).toBeInTheDocument(); });
    fireEvent.click(screen.getByText(/tambah layanan/i));
    await waitFor(() => { expect(screen.getByText('Tambah Layanan')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('\u00d7'));
    await waitFor(() => { expect(screen.queryByText('Tambah Layanan')).not.toBeInTheDocument(); });
  });
});
