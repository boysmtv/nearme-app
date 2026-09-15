import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DataTable from '../admin/DataTable';

interface TestItem { id: string; name: string; email: string; role: string; }

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
];

const data: TestItem[] = [
  { id: '1', name: 'Alice', email: 'alice@test.com', role: 'Admin' },
  { id: '2', name: 'Bob', email: 'bob@test.com', role: 'User' },
];

describe('DataTable', () => {
  it('shows loading spinner when isLoading', () => {
    render(<DataTable columns={columns} data={[]} isLoading />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText('Tidak ada data')).toBeInTheDocument();
  });

  it('shows custom empty message', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="Kosong" />);
    expect(screen.getByText('Kosong')).toBeInTheDocument();
  });

  it('renders table headers from columns', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('bob@test.com')).toBeInTheDocument();
  });

  it('renders cell with custom render function', () => {
    const customColumns = [
      { key: 'name', label: 'Name', render: (item: TestItem) => <strong>{item.name.toUpperCase()}</strong> },
    ];
    render(<DataTable columns={customColumns} data={data} />);
    expect(screen.getByText('ALICE')).toBeInTheDocument();
    expect(screen.getByText('BOB')).toBeInTheDocument();
  });

  it('applies column className', () => {
    const styledColumns = [
      { key: 'name', label: 'Name', className: 'text-red-500' },
    ];
    render(<DataTable columns={styledColumns} data={data} />);
    const th = screen.getByText('Name').closest('th');
    expect(th?.className).toContain('text-red-500');
  });

  it('shows pagination when totalPages > 1', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        pagination={{ page: 1, totalPages: 3, total: 30 }}
      />
    );
    expect(screen.getByText(/Halaman 1 dari 3/)).toBeInTheDocument();
  });

  it('does not show pagination when totalPages = 1', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        pagination={{ page: 1, totalPages: 1, total: 5 }}
      />
    );
    expect(screen.queryByText(/Halaman/)).not.toBeInTheDocument();
  });

  it('calls onPageChange when page clicked', () => {
    const onPageChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        pagination={{ page: 1, totalPages: 3, total: 30 }}
        onPageChange={onPageChange}
      />
    );
    fireEvent.click(screen.getByText('2'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('highlights current page in pagination', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        pagination={{ page: 2, totalPages: 5, total: 50 }}
      />
    );
    const page2Btn = screen.getByText('2');
    expect(page2Btn.className).toContain('bg-primary-600');
    expect(page2Btn.className).toContain('text-white');
  });

  it('shows total count in pagination text', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        pagination={{ page: 1, totalPages: 5, total: 42 }}
      />
    );
    expect(screen.getByText(/42 total/)).toBeInTheDocument();
  });
});
