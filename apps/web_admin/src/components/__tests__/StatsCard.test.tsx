import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatsCard from '../StatsCard';

describe('StatsCard', () => {
  it('renders label and value', () => {
    render(<StatsCard label="Total Users" value={1234} icon="users" color="blue" />);

    expect(screen.getByText('1234')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(<StatsCard label="Revenue" value="Rp 50M" icon="currency" color="green" />);

    expect(screen.getByText('Rp 50M')).toBeInTheDocument();
  });

  it('renders positive change indicator', () => {
    render(
      <StatsCard
        label="Bookings"
        value={100}
        icon="calendar"
        color="purple"
        change={{ value: 12, isPositive: true }}
      />,
    );

    expect(screen.getByText(/↑/)).toBeInTheDocument();
    expect(screen.getByText(/12%/)).toBeInTheDocument();
  });

  it('renders negative change indicator', () => {
    render(
      <StatsCard
        label="Churn"
        value={5}
        icon="users"
        color="red"
        change={{ value: 3, isPositive: false }}
      />,
    );

    expect(screen.getByText(/↓/)).toBeInTheDocument();
    expect(screen.getByText(/3%/)).toBeInTheDocument();
  });

  it('does not render change when not provided', () => {
    const { container } = render(
      <StatsCard label="Tenants" value={42} icon="building" color="amber" />,
    );

    expect(container.querySelector('.text-green-600')).not.toBeInTheDocument();
    expect(container.querySelector('.text-red-600')).not.toBeInTheDocument();
  });

  it('maps icon names to emoji', () => {
    const { container } = render(
      <StatsCard label="Test" value={0} icon="star" color="blue" />,
    );

    expect(container.textContent).toContain('⭐');
  });
});
