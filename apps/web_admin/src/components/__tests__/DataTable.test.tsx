import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable from '../DataTable';

interface TestRow {
  id: string;
  name: string;
  email: string;
}

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
];

const sampleData: TestRow[] = [
  { id: '1', name: 'Alice', email: 'alice@test.com' },
  { id: '2', name: 'Bob', email: 'bob@test.com' },
];

describe('DataTable', () => {
  it('renders table headers and rows', () => {
    render(<DataTable columns={columns} data={sampleData} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('bob@test.com')).toBeInTheDocument();
  });

  it('renders empty state with default message', () => {
    render(<DataTable columns={columns} data={[]} />);

    expect(screen.getByText('Tidak ada data')).toBeInTheDocument();
  });

  it('renders custom empty message', () => {
    render(
      <DataTable columns={columns} data={[]} emptyMessage="No records found" />,
    );

    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  it('shows loading spinner when isLoading is true', () => {
    const { container } = render(
      <DataTable columns={columns} data={[]} isLoading />,
    );

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('does not show pagination when totalPages is 1', () => {
    render(
      <DataTable
        columns={columns}
        data={sampleData}
        pagination={{ page: 1, totalPages: 1, total: 2 }}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.queryByText(/Halaman/)).not.toBeInTheDocument();
  });

  it('renders pagination buttons and calls onPageChange', async () => {
    const onPageChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={sampleData}
        pagination={{ page: 1, totalPages: 3, total: 30 }}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText('Halaman 1 dari 3 (30 total)')).toBeInTheDocument();

    const page2Btn = screen.getByText('2');
    await userEvent.click(page2Btn);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('uses custom render function for columns', () => {
    const customColumns = [
      { key: 'name', label: 'Name', render: (item: TestRow) => <strong>{item.name}</strong> },
    ];

    render(<DataTable columns={customColumns} data={sampleData} />);

    const strong = screen.getByText('Alice');
    expect(strong.tagName).toBe('STRONG');
  });
});
