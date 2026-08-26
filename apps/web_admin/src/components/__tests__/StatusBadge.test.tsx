import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders success variant for ACTIVE status', () => {
    render(<StatusBadge status="ACTIVE" />);
    const badge = screen.getByText('Aktif');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-700');
  });

  it('renders warning variant for PENDING status', () => {
    render(<StatusBadge status="PENDING" />);
    const badge = screen.getByText('Menunggu');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-yellow-100');
  });

  it('renders error variant for CANCELLED status', () => {
    render(<StatusBadge status="CANCELLED" />);
    const badge = screen.getByText('Dibatalkan');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-red-100');
  });

  it('renders info variant for SUBMITTED status', () => {
    render(<StatusBadge status="SUBMITTED" />);
    const badge = screen.getByText('Diajukan');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-blue-100');
  });

  it('renders neutral variant for unknown status', () => {
    render(<StatusBadge status="UNKNOWN_STATUS" />);
    const badge = screen.getByText('UNKNOWN_STATUS');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-gray-100');
  });

  it('renders custom label when provided', () => {
    render(<StatusBadge status="ACTIVE" customLabel="Custom Active" />);
    expect(screen.getByText('Custom Active')).toBeInTheDocument();
    expect(screen.queryByText('Aktif')).not.toBeInTheDocument();
  });

  it('renders all success statuses with correct labels', () => {
    const successStatuses: [string, string][] = [
      ['APPROVED', 'Disetujui'],
      ['PAID', 'Dibayar'],
      ['COMPLETED', 'Selesai'],
      ['RESOLVED', 'Selesai'],
      ['CLOSED', 'Ditutup'],
    ];

    successStatuses.forEach(([status, label]) => {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });
});
