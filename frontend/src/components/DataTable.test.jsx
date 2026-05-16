import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTable from './DataTable';

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiChevronLeft: () => <span data-testid="icon-left">←</span>,
  FiChevronRight: () => <span data-testid="icon-right">→</span>,
}));

const mockColumns = [
  { header: 'Name', accessor: 'name' },
  { header: 'Email', accessor: 'email' },
  { header: 'Action', render: (row) => <button>{`Edit ${row.name}`}</button> },
];

const mockData = [
  { name: 'John Doe', email: 'john@example.com' },
  { name: 'Jane Smith', email: 'jane@example.com' },
];

describe('DataTable', () => {
  it('should render loading state', () => {
    render(
      <DataTable columns={mockColumns} data={[]} loading={true} currentPage={1} totalPages={1} />
    );

    expect(screen.getByText('Memuat data...')).toBeInTheDocument();
  });

  it('should render empty state when data is empty', () => {
    render(
      <DataTable columns={mockColumns} data={[]} loading={false} currentPage={1} totalPages={1} />
    );

    expect(screen.getByText('Data tidak ditemukan')).toBeInTheDocument();
  });

  it('should render empty state when data is null', () => {
    render(
      <DataTable columns={mockColumns} data={null} loading={false} currentPage={1} totalPages={1} />
    );

    expect(screen.getByText('Data tidak ditemukan')).toBeInTheDocument();
  });

  it('should render table with data', () => {
    render(
      <DataTable columns={mockColumns} data={mockData} loading={false} currentPage={1} totalPages={1} />
    );

    // Headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();

    // Data rows
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Custom render column
    expect(screen.getByText('Edit John Doe')).toBeInTheDocument();
  });

  it('should not render pagination when totalPages is 1', () => {
    render(
      <DataTable columns={mockColumns} data={mockData} loading={false} currentPage={1} totalPages={1} />
    );

    expect(screen.queryByText(/Page/)).not.toBeInTheDocument();
  });

  it('should render pagination when totalPages > 1', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        loading={false}
        currentPage={2}
        totalPages={5}
        onPageChange={() => {}}
      />
    );

    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
  });

  it('should call onPageChange with previous page when clicking Prev', () => {
    const onPageChange = vi.fn();

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        loading={false}
        currentPage={3}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByText(/Prev/));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange with next page when clicking Next', () => {
    const onPageChange = vi.fn();

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        loading={false}
        currentPage={2}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByText(/Next/));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('should disable Prev button on first page', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        loading={false}
        currentPage={1}
        totalPages={3}
        onPageChange={() => {}}
      />
    );

    const prevButton = screen.getByText(/Prev/).closest('button');
    expect(prevButton).toBeDisabled();
  });

  it('should disable Next button on last page', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        loading={false}
        currentPage={3}
        totalPages={3}
        onPageChange={() => {}}
      />
    );

    const nextButton = screen.getByText(/Next/).closest('button');
    expect(nextButton).toBeDisabled();
  });
});
