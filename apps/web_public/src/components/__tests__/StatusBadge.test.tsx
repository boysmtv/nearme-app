import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusBadge from '../admin/StatusBadge';

describe('StatusBadge', () => {
  it('renders ACTIVE with success variant', () => {
    render(<StatusBadge status="ACTIVE" />);
    expect(screen.getByText('Aktif')).toBeInTheDocument();
  });

  it('renders PENDING with warning variant', () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByText('Menunggu')).toBeInTheDocument();
  });

  it('renders FAILED with error variant', () => {
    render(<StatusBadge status="FAILED" />);
    expect(screen.getByText('Gagal')).toBeInTheDocument();
  });

  it('renders DRAFT with neutral variant', () => {
    render(<StatusBadge status="DRAFT" />);
    expect(screen.getByText('Draf')).toBeInTheDocument();
  });

  it('renders SUBMITTED with info variant', () => {
    render(<StatusBadge status="SUBMITTED" />);
    expect(screen.getByText('Diajukan')).toBeInTheDocument();
  });

  it('renders custom label when provided', () => {
    render(<StatusBadge status="ACTIVE" customLabel="Custom Active" />);
    expect(screen.getByText('Custom Active')).toBeInTheDocument();
  });

  it('renders raw status when not in labelMap', () => {
    render(<StatusBadge status="UNKNOWN_STATUS" />);
    expect(screen.getByText('UNKNOWN_STATUS')).toBeInTheDocument();
  });

  it('renders all known status labels', () => {
    const statuses = [
      { status: 'ACTIVE', label: 'Aktif' },
      { status: 'APPROVED', label: 'Disetujui' },
      { status: 'PAID', label: 'Dibayar' },
      { status: 'COMPLETED', label: 'Selesai' },
      { status: 'PENDING', label: 'Menunggu' },
      { status: 'PENDING_PAYMENT', label: 'Menunggu Bayar' },
      { status: 'PENDING_APPROVAL', label: 'Menunggu Approval' },
      { status: 'FAILED', label: 'Gagal' },
      { status: 'REJECTED', label: 'Ditolak' },
      { status: 'CANCELLED', label: 'Dibatalkan' },
      { status: 'SUSPENDED', label: 'Ditangguhkan' },
      { status: 'OPEN', label: 'Terbuka' },
      { status: 'IN_PROGRESS', label: 'Dalam Proses' },
      { status: 'RESOLVED', label: 'Selesai' },
      { status: 'CLOSED', label: 'Ditutup' },
      { status: 'NO_SHOW', label: 'Tidak Datang' },
      { status: 'EXPIRED', label: 'Kedaluwarsa' },
      { status: 'REFUNDED', label: 'Dikembalikan' },
      { status: 'INACTIVE', label: 'Nonaktif' },
    ];
    statuses.forEach(({ status, label }) => {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });
});
