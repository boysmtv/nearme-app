import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '../theme';

function TestComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('provides default system theme', () => {
    render(<ThemeProvider><TestComponent /></ThemeProvider>);
    expect(screen.getByTestId('theme')).toHaveTextContent('system');
  });

  it('reads theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    render(<ThemeProvider><TestComponent /></ThemeProvider>);
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('updates theme on setTheme call', () => {
    render(<ThemeProvider><TestComponent /></ThemeProvider>);
    fireEvent.click(screen.getByText('Dark'));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('persists theme to localStorage', () => {
    render(<ThemeProvider><TestComponent /></ThemeProvider>);
    fireEvent.click(screen.getByText('Light'));
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('resolves dark theme correctly', () => {
    render(<ThemeProvider><TestComponent /></ThemeProvider>);
    fireEvent.click(screen.getByText('Dark'));
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  });

  it('resolves light theme correctly', () => {
    render(<ThemeProvider><TestComponent /></ThemeProvider>);
    fireEvent.click(screen.getByText('Light'));
    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
  });

  it('toggles dark class on document element', () => {
    render(<ThemeProvider><TestComponent /></ThemeProvider>);
    fireEvent.click(screen.getByText('Dark'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    fireEvent.click(screen.getByText('Light'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('default context setTheme is a safe noop outside provider', () => {
    function NoProviderCaller() {
      const { theme, setTheme, resolvedTheme } = useTheme();
      return (
        <div>
          <span data-testid="dtheme">{theme}</span>
          <span data-testid="dresolved">{resolvedTheme}</span>
          <button onClick={() => setTheme('dark')}>SetDefault</button>
        </div>
      );
    }
    render(<NoProviderCaller />);
    expect(screen.getByTestId('dtheme')).toHaveTextContent('system');
    expect(screen.getByTestId('dresolved')).toHaveTextContent('light');
    fireEvent.click(screen.getByText('SetDefault'));
    expect(screen.getByTestId('dtheme')).toHaveTextContent('system');
  });
});


