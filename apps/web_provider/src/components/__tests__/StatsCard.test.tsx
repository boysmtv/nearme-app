import { render, screen } from '@testing-library/react';
import StatsCard from '../StatsCard';

describe('StatsCard', () => {
  const defaultProps = {
    label: 'Total Bookings',
    value: 128,
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    color: 'blue' as const,
  };

  it('renders label and value', () => {
    render(<StatsCard {...defaultProps} />);
    expect(screen.getByText('Total Bookings')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(<StatsCard {...defaultProps} value="Rp 5.2M" />);
    expect(screen.getByText('Rp 5.2M')).toBeInTheDocument();
  });

  it('renders positive percentage change with green color', () => {
    render(
      <StatsCard
        {...defaultProps}
        change={{ value: 12, isPositive: true }}
      />,
    );
    const badge = screen.getByText('12%');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-green-600');
  });

  it('renders negative percentage change with red color', () => {
    render(
      <StatsCard
        {...defaultProps}
        change={{ value: 5, isPositive: false }}
      />,
    );
    const badge = screen.getByText('5%');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-red-600');
  });

  it('does not render change badge when change is undefined', () => {
    render(<StatsCard {...defaultProps} />);
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });

  it('applies correct color class for each color variant', () => {
    const colors = ['blue', 'green', 'purple', 'amber', 'red'] as const;
    colors.forEach((color) => {
      const { container, unmount } = render(<StatsCard {...defaultProps} color={color} />);
      const svgIcon = container.querySelector('svg');
      const iconDiv = svgIcon?.parentElement;
      expect(iconDiv).not.toBeNull();
      expect(iconDiv!.className).toContain(`${color}-50`);
      expect(iconDiv!.className).toContain(`${color}-600`);
      unmount();
    });
  });

  it('displays absolute value of negative change', () => {
    render(
      <StatsCard
        {...defaultProps}
        change={{ value: -8, isPositive: false }}
      />,
    );
    expect(screen.getByText('8%')).toBeInTheDocument();
  });
});
