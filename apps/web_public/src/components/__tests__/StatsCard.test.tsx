import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatsCard from '../StatsCard';

describe('StatsCard', () => {
  it('renders label and numeric value', () => {
    render(<StatsCard label="Total Users" value={1234} icon="M12 4v16m8-8H4" color="blue" />);
    expect(screen.getByText('1234')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(<StatsCard label="Revenue" value="Rp 50M" icon="M12 4v16m8-8H4" color="green" />);
    expect(screen.getByText('Rp 50M')).toBeInTheDocument();
  });

  it('renders positive change indicator', () => {
    render(
      <StatsCard label="Bookings" value={100} icon="M12 4v16m8-8H4" color="purple" change={{ value: 12, isPositive: true }} />
    );
    expect(screen.getByText(/12%/)).toBeInTheDocument();
  });

  it('renders negative change indicator', () => {
    render(
      <StatsCard label="Churn" value={5} icon="M12 4v16m8-8H4" color="red" change={{ value: 3, isPositive: false }} />
    );
    expect(screen.getByText(/3%/)).toBeInTheDocument();
  });

  it('does not render change when not provided', () => {
    const { container } = render(
      <StatsCard label="Tenants" value={42} icon="M12 4v16m8-8H4" color="amber" />
    );
    expect(container.querySelector('.text-green-600')).not.toBeInTheDocument();
    expect(container.querySelector('.text-red-600')).not.toBeInTheDocument();
  });

  it('renders with all color variants', () => {
    const colors = ['blue', 'green', 'purple', 'amber', 'red'] as const;
    colors.forEach((color) => {
      const { unmount } = render(
        <StatsCard label={`Test ${color}`} value={0} icon="M12 4v16m8-8H4" color={color} />
      );
      expect(screen.getByText(`Test ${color}`)).toBeInTheDocument();
      unmount();
    });
  });
});
