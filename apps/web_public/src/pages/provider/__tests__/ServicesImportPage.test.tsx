import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServicesImportPage from '../ServicesImportPage';

vi.mock('../../../lib/api', () => ({
  api: { post: vi.fn() },
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

import { api } from '../../../lib/api';

const mockPost = api.post as ReturnType<typeof vi.fn>;

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <ServicesImportPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('ServicesImportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders heading', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /import layanan/i })).toBeInTheDocument();
  });

  it('shows CSV format instructions', async () => {
    renderPage();
    expect(screen.getByText(/format csv/i)).toBeInTheDocument();
    expect(screen.getAllByText(/name,description,duration,price,category/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows file upload button', async () => {
    renderPage();
    expect(screen.getByRole('button', { name: /pilih file csv/i })).toBeInTheDocument();
  });

  it('shows no preview initially', async () => {
    renderPage();
    expect(screen.queryByText(/preview/i)).not.toBeInTheDocument();
  });

  it('parses CSV and shows preview', async () => {
    renderPage();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csvContent = 'name,description,duration,price,category\nPotong Rambut,Potong rambut pria,60,50000,Rambut\nHair Coloring,Pewarnaan rambut,120,300000,Rambut';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'services.csv', { type: 'text/csv' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);
    await waitFor(() => {
      expect(screen.getByText(/preview/i)).toBeInTheDocument();
    });
    expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    expect(screen.getByText('Hair Coloring')).toBeInTheDocument();
    expect(screen.getByText('Rp 50.000')).toBeInTheDocument();
    expect(screen.getByText('Rp 300.000')).toBeInTheDocument();
  });

  it('shows row count in preview header', async () => {
    renderPage();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csvContent = 'name,description,duration,price,category\nPotong Rambut,Potong rambut pria,60,50000,Rambut\nHair Coloring,Pewarnaan rambut,120,300000,Rambut';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'services.csv', { type: 'text/csv' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);
    await waitFor(() => {
      expect(screen.getByText(/preview \(2 layanan\)/i)).toBeInTheDocument();
    });
  });

  it('shows duration in minutes format', async () => {
    renderPage();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csvContent = 'name,description,duration,price,category\nPotong Rambut,Potong rambut pria,60,50000,Rambut';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'services.csv', { type: 'text/csv' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);
    await waitFor(() => {
      expect(screen.getByText('60m')).toBeInTheDocument();
    });
  });

  it('shows category column', async () => {
    renderPage();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csvContent = 'name,description,duration,price,category\nPotong Rambut,Potong rambut pria,60,50000,Rambut';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'services.csv', { type: 'text/csv' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);
    await waitFor(() => {
      expect(screen.getByText('Rambut')).toBeInTheDocument();
    });
  });

  it('cancels preview and clears data', async () => {
    renderPage();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csvContent = 'name,description,duration,price,category\nPotong Rambut,Potong rambut pria,60,50000,Rambut';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'services.csv', { type: 'text/csv' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);
    await waitFor(() => {
      expect(screen.getByText(/preview/i)).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Batal'));
    await waitFor(() => {
      expect(screen.queryByText(/preview/i)).not.toBeInTheDocument();
    });
  });

  it('imports all rows when Import Semua is clicked', async () => {
    mockPost.mockResolvedValue({ data: { success: true } });
    renderPage();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csvContent = 'name,description,duration,price,category\nPotong Rambut,Potong rambut pria,60,50000,Rambut';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'services.csv', { type: 'text/csv' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);
    await waitFor(() => {
      expect(screen.getByText(/preview/i)).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Import Semua'));
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/provider/services/bulk', {
        services: [{ name: 'Potong Rambut', description: 'Potong rambut pria', duration: 60, price: 50000, category: 'Rambut', status: 'pending' }],
      });
    });
  });

  it('filters out empty rows', async () => {
    renderPage();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csvContent = 'name,description,duration,price,category\nPotong Rambut,Potong rambut pria,60,50000,Rambut\n\nHair Coloring,Pewarnaan rambut,120,300000,Rambut';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'services.csv', { type: 'text/csv' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);
    await waitFor(() => {
      expect(screen.getByText(/preview \(2 layanan\)/i)).toBeInTheDocument();
    });
  });

  it('disables import button while pending', async () => {
    mockPost.mockReturnValue(new Promise(() => {}));
    renderPage();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csvContent = 'name,description,duration,price,category\nPotong Rambut,Potong rambut pria,60,50000,Rambut';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'services.csv', { type: 'text/csv' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);
    await waitFor(() => {
      expect(screen.getByText(/preview/i)).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Import Semua'));
    await waitFor(() => {
      expect(screen.getByText('Mengimport...')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /mengimport/i })).toBeDisabled();
  });

  it('shows description column in preview', async () => {
    renderPage();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csvContent = 'name,description,duration,price,category\nPotong Rambut,Potong rambut pria,60,50000,Rambut';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'services.csv', { type: 'text/csv' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);
    await waitFor(() => {
      expect(screen.getByText('Potong rambut pria')).toBeInTheDocument();
    });
  });
});
