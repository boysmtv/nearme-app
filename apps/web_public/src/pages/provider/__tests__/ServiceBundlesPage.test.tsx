import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServiceBundlesPage from '../ServiceBundlesPage';

vi.mock('../../../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

import { api } from '../../../lib/api';

const mockGet = api.get as ReturnType<typeof vi.fn>;
const mockPost = api.post as ReturnType<typeof vi.fn>;
const mockDelete = api.delete as ReturnType<typeof vi.fn>;

const servicesList = [
  { id: 's1', name: 'Potong Rambut', price: 50000, duration: 30 },
  { id: 's2', name: 'Hair Coloring', price: 150000, duration: 90 },
  { id: 's3', name: 'Shaving', price: 30000, duration: 20 },
];

const bundlesList = [
  {
    id: 'b1',
    name: 'Paket Hemat',
    description: 'Hemat 10%',
    discount: 10,
    discountType: 'PERCENTAGE',
    services: [{ serviceId: 's1', serviceName: 'Potong Rambut', originalPrice: 50000 }, { serviceId: 's2', serviceName: 'Hair Coloring', originalPrice: 150000 }],
    finalPrice: 180000,
  },
  {
    id: 'b2',
    name: 'Paket Premium',
    description: 'Diskon Rp 20.000',
    discount: 20000,
    discountType: 'FIXED',
    services: [{ serviceId: 's1', serviceName: 'Potong Rambut', originalPrice: 50000 }, { serviceId: 's3', serviceName: 'Shaving', originalPrice: 30000 }],
    finalPrice: 60000,
  },
];

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <ServiceBundlesPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('ServiceBundlesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url.includes('services')) return Promise.resolve({ data: servicesList });
      if (url.includes('bundles')) return Promise.resolve({ data: bundlesList });
      return Promise.resolve({ data: [] });
    });
    mockPost.mockResolvedValue({ data: { id: 'b3' } });
    mockDelete.mockResolvedValue({ data: true });
  });

  it('renders heading', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /paket layanan/i })).toBeInTheDocument();
  });

  it('shows empty state when no bundles', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('services')) return Promise.resolve({ data: servicesList });
      if (url.includes('bundles')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/belum ada paket layanan/i)).toBeInTheDocument();
    });
  });

  it('shows Buat Paket button', async () => {
    renderPage();
    expect(screen.getByRole('button', { name: /buat paket/i })).toBeInTheDocument();
  });

  it('renders bundle cards when data exists', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Paket Hemat')).toBeInTheDocument();
    });
    expect(screen.getByText('Paket Premium')).toBeInTheDocument();
    expect(screen.getByText('Hemat 10%')).toBeInTheDocument();
    expect(screen.getByText('Diskon Rp 20.000')).toBeInTheDocument();
  });

  it('shows bundle discount percentage', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Paket Hemat')).toBeInTheDocument();
    });
    expect(screen.getByText('Diskon 10%')).toBeInTheDocument();
  });

  it('shows bundle services count', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Paket Hemat')).toBeInTheDocument();
    });
    expect(screen.getAllByText('2 layanan dalam paket').length).toBeGreaterThanOrEqual(1);
  });

  it('shows bundle final price', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Paket Hemat')).toBeInTheDocument();
    });
    expect(screen.getByText('Rp 180.000')).toBeInTheDocument();
  });

  it('opens create form when Buat Paket is clicked', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Paket Hemat')).toBeInTheDocument();
    });
    const buatButtons = screen.getAllByRole('button', { name: /buat paket/i });
    await userEvent.click(buatButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Buat Paket Layanan')).toBeInTheDocument();
      expect(screen.getByText('Nama Paket')).toBeInTheDocument();
      expect(screen.getByText('Deskripsi')).toBeInTheDocument();
      expect(screen.getByText('Diskon')).toBeInTheDocument();
      expect(screen.getByText('Pilih Layanan')).toBeInTheDocument();
    });
  });

  it('shows services in create form', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Paket Hemat')).toBeInTheDocument();
    });
    const buatButtons = screen.getAllByRole('button', { name: /buat paket/i });
    await userEvent.click(buatButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    });
    expect(screen.getByText('Hair Coloring')).toBeInTheDocument();
    expect(screen.getByText('Shaving')).toBeInTheDocument();
  });

  it('selects services in create form', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Paket Hemat')).toBeInTheDocument();
    });
    const buatButtons = screen.getAllByRole('button', { name: /buat paket/i });
    await userEvent.click(buatButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Pilih Layanan')).toBeInTheDocument();
    });
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    await userEvent.click(checkboxes[0]);
    await userEvent.click(checkboxes[1]);
    expect(screen.getByText(/Total Harga Normal/)).toBeInTheDocument();
  });

  it('closes create form when Batal is clicked', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Paket Hemat')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: /buat paket/i }));
    await waitFor(() => {
      expect(screen.getByText('Buat Paket Layanan')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Batal'));
    await waitFor(() => {
      expect(screen.queryByText('Buat Paket Layanan')).not.toBeInTheDocument();
    });
  });

  it('creates bundle when form is submitted', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Paket Hemat')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: /buat paket/i }));
    await waitFor(() => {
      expect(screen.getByText('Buat Paket Layanan')).toBeInTheDocument();
    });
    const nameInput = screen.getByPlaceholderText('Contoh: Paket Hemat Rambut');
    await userEvent.type(nameInput, 'Paket Baru');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    await userEvent.click(checkboxes[0]);
    await userEvent.click(checkboxes[1]);
    const submitButtons = screen.getAllByRole('button', { name: /buat paket/i });
    await userEvent.click(submitButtons[submitButtons.length - 1]);
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled();
    });
  });

  it('deletes bundle when Hapus is clicked', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Paket Hemat')).toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByText('Hapus');
    await userEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/provider/bundles/b1');
    });
  });

  it('shows loading state for bundles', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('services')) return Promise.resolve({ data: servicesList });
      if (url.includes('bundles')) return new Promise(() => {});
      return Promise.resolve({ data: [] });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /paket layanan/i })).toBeInTheDocument();
    });
    const skeletonPulse = document.querySelectorAll('.animate-pulse');
    expect(skeletonPulse.length).toBeGreaterThanOrEqual(1);
  });

  it('shows loading state for services in form', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('services')) return new Promise(() => {});
      if (url.includes('bundles')) return Promise.resolve({ data: bundlesList });
      return Promise.resolve({ data: [] });
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Paket Hemat')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: /buat paket/i }));
    await waitFor(() => {
      expect(screen.getByText('Pilih Layanan')).toBeInTheDocument();
    });
    const skeletonPulse = document.querySelectorAll('.animate-pulse');
    expect(skeletonPulse.length).toBeGreaterThanOrEqual(1);
  });

  it('computes FIXED discount final price', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Paket Hemat')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: /buat paket/i }));
    await waitFor(() => {
      expect(screen.getByText('Buat Paket Layanan')).toBeInTheDocument();
    });
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    // s1 + s2 = Rp 200.000 normal
    fireEvent.change(screen.getByPlaceholderText('10'), { target: { value: '50000' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'FIXED' } });
    await waitFor(() => {
      expect(screen.getByText('Rp 150.000')).toBeInTheDocument();
    });
  });

  it('updates bundle description field', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Paket Hemat')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: /buat paket/i }));
    await waitFor(() => {
      expect(screen.getByText('Buat Paket Layanan')).toBeInTheDocument();
    });
    const desc = screen.getByPlaceholderText('Deskripsi singkat paket') as HTMLTextAreaElement;
    fireEvent.change(desc, { target: { value: 'Deskripsi paket baru' } });
    expect(desc.value).toBe('Deskripsi paket baru');
  });

  it('deselects a service when unchecked', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Paket Hemat')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: /buat paket/i }));
    await waitFor(() => {
      expect(screen.getByText('Pilih Layanan')).toBeInTheDocument();
    });
    const checkboxes = document.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    await waitFor(() => {
      expect(screen.getByText(/Total Harga Normal/)).toBeInTheDocument();
    });
    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1].checked).toBe(false);
    expect(checkboxes[0].checked).toBe(true);
  });

  it('closes form when clicking backdrop', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Paket Hemat')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: /buat paket/i }));
    await waitFor(() => {
      expect(screen.getByText('Buat Paket Layanan')).toBeInTheDocument();
    });
    const backdrop = document.querySelector('.fixed.inset-0') as HTMLElement;
    fireEvent.click(backdrop);
    await waitFor(() => {
      expect(screen.queryByText('Buat Paket Layanan')).not.toBeInTheDocument();
    });
  });
});
