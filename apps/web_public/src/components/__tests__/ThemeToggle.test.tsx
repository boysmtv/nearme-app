import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ThemeToggle from '../ThemeToggle';

const mockSetTheme = vi.fn();
const mockUseTheme = vi.fn();

vi.mock('../../lib/theme', () => ({
  useTheme: () => mockUseTheme(),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sun icon when theme is dark', () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: 'dark', setTheme: mockSetTheme });
    const { container } = render(<ThemeToggle />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders moon icon when theme is light', () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: 'light', setTheme: mockSetTheme });
    const { container } = render(<ThemeToggle />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('calls setTheme with light when clicked in dark mode', () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: 'dark', setTheme: mockSetTheme });
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('calls setTheme with dark when clicked in light mode', () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: 'light', setTheme: mockSetTheme });
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('has correct title for dark mode', () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: 'dark', setTheme: mockSetTheme });
    render(<ThemeToggle />);
    expect(screen.getByTitle('Mode Terang')).toBeInTheDocument();
  });

  it('has correct title for light mode', () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: 'light', setTheme: mockSetTheme });
    render(<ThemeToggle />);
    expect(screen.getByTitle('Mode Gelap')).toBeInTheDocument();
  });
});
