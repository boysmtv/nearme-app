import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MediaPage from '../MediaPage';

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

vi.mock('../../../lib/api', () => ({
  mediaApi: { list: vi.fn(), upload: vi.fn(), reorder: vi.fn(), delete: vi.fn() },
}));

vi.mock('../../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="provider-layout">{children}</div>,
}));

import { mediaApi } from '../../../lib/api';

const mockList = mediaApi.list as ReturnType<typeof vi.fn>;
const mockUpload = mediaApi.upload as ReturnType<typeof vi.fn>;
const mockDelete = mediaApi.delete as ReturnType<typeof vi.fn>;

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
}

function renderPage(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <MediaPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const mediaItems = [
  { id: 'm1', url: 'https://example.com/photo1.jpg', fileName: 'photo1.jpg', sortOrder: 0, ownerType: 'provider', ownerId: 't1' },
  { id: 'm2', url: 'https://example.com/photo2.jpg', fileName: 'photo2.jpg', sortOrder: 1, ownerType: 'provider', ownerId: 't1' },
  { id: 'm3', url: 'https://example.com/photo3.jpg', fileName: 'photo3.jpg', sortOrder: 2, ownerType: 'provider', ownerId: 't1' },
];

const mockResponse = { data: mediaItems };

describe('MediaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockList.mockResolvedValue(mockResponse);
  });

  it('renders heading and ProviderLayout', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /galeri/i })).toBeInTheDocument();
    expect(screen.getByText(/kelola foto galeri provider/i)).toBeInTheDocument();
    expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    mockList.mockReturnValue(new Promise(() => {}));
    renderPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders media grid when data loads', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByAltText('photo1.jpg')).toBeInTheDocument();
    });
    expect(screen.getByAltText('photo2.jpg')).toBeInTheDocument();
    expect(screen.getByAltText('photo3.jpg')).toBeInTheDocument();
  });

  it('displays media images with correct src', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByAltText('photo1.jpg')).toBeInTheDocument();
    });
    expect(screen.getByAltText('photo1.jpg')).toHaveAttribute('src', 'https://example.com/photo1.jpg');
    expect(screen.getByAltText('photo2.jpg')).toHaveAttribute('src', 'https://example.com/photo2.jpg');
    expect(screen.getByAltText('photo3.jpg')).toHaveAttribute('src', 'https://example.com/photo3.jpg');
  });

  it('displays sort order labels', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByAltText('photo1.jpg')).toBeInTheDocument();
    });
    expect(screen.getByText('#0')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
  });

  it('shows delete button for each media item', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByAltText('photo1.jpg')).toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByLabelText('Delete');
    expect(deleteButtons.length).toBe(3);
  });

  it('deletes media item after confirmation', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => true);
    mockDelete.mockResolvedValue({ data: {} });
    renderPage();
    await waitFor(() => {
      expect(screen.getByAltText('photo1.jpg')).toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByLabelText('Delete');
    await user.click(deleteButtons[0]);
    expect(window.confirm).toHaveBeenCalledWith('Hapus foto ini?');
    expect(mockDelete).toHaveBeenCalledWith('m1');
  });

  it('does not delete media when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => false);
    renderPage();
    await waitFor(() => {
      expect(screen.getByAltText('photo1.jpg')).toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByLabelText('Delete');
    await user.click(deleteButtons[0]);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('shows upload file input', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByAltText('photo1.jpg')).toBeInTheDocument();
    });
    expect(screen.getByText(/upload foto \(jpeg\/png\/webp/i)).toBeInTheDocument();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput.accept).toBe('image/jpeg,image/png,image/webp');
  });

  it('shows empty state when no photos', async () => {
    mockList.mockResolvedValue({ data: [] });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/belum ada foto/i)).toBeInTheDocument();
    });
  });

  it('shows drag and drop hint text', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByAltText('photo1.jpg')).toBeInTheDocument();
    });
    expect(screen.getByText(/drag & drop untuk mengubah urutan/i)).toBeInTheDocument();
  });

  it('shows uploading status when file is selected', async () => {
    mockUpload.mockReturnValue(new Promise(() => {}));
    renderPage();
    await waitFor(() => {
      expect(screen.getByAltText('photo1.jpg')).toBeInTheDocument();
    });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await waitFor(() => {
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });
  });
});
