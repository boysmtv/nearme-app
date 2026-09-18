import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ProviderLayout from '../ProviderLayout';

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({
    user: { name: 'Budi', email: 'budi@test.com', role: 'ROLE_PROVIDER_OWNER' },
    logout: vi.fn(),
  }),
}));

function renderProviderLayout(children?: React.ReactNode) {
  return render(
    <MemoryRouter>
      <ProviderLayout>{children ?? <div data-testid="child">Child Content</div>}</ProviderLayout>
    </MemoryRouter>
  );
}

describe('ProviderLayout', () => {
  it('renders brand name', () => {
    renderProviderLayout();
    expect(screen.getByText('DEKAT Provider')).toBeInTheDocument();
  });

  it('renders sidebar navigation items', () => {
    renderProviderLayout();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Kalender')).toBeInTheDocument();
    expect(screen.getByText('Layanan')).toBeInTheDocument();
  });

  it('renders children content', () => {
    renderProviderLayout();
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    renderProviderLayout();
    expect(screen.getByText('Keluar')).toBeInTheDocument();
  });

  it('navigates home when clicking Lihat Publik', () => {
    renderProviderLayout();
    fireEvent.click(screen.getByText('Lihat Publik'));
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('calls logout when clicking Keluar', () => {
    renderProviderLayout();
    fireEvent.click(screen.getByText('Keluar'));
  });
});
