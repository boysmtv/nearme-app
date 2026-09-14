import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import CustomerLayout from '../CustomerLayout';

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({
    user: { name: 'Siti', email: 'siti@gmail.com', role: 'ROLE_CUSTOMER' },
    logout: vi.fn(),
  }),
}));

function renderCustomerLayout(children?: React.ReactNode) {
  return render(
    <MemoryRouter>
      <CustomerLayout>{children ?? <div data-testid="child">Child Content</div>}</CustomerLayout>
    </MemoryRouter>
  );
}

describe('CustomerLayout', () => {
  it('renders brand name', () => {
    renderCustomerLayout();
    expect(screen.getAllByText('DEKAT').length).toBeGreaterThanOrEqual(1);
  });

  it('renders sidebar navigation items', () => {
    renderCustomerLayout();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Cari Layanan')).toBeInTheDocument();
    expect(screen.getByText('Booking Saya')).toBeInTheDocument();
  });

  it('renders children content', () => {
    renderCustomerLayout();
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders customer badge', () => {
    renderCustomerLayout();
    expect(screen.getByText('Customer')).toBeInTheDocument();
  });
});
