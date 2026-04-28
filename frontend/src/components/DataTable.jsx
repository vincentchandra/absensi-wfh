import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const DataTable = ({ columns, data, loading, onPageChange, currentPage = 1, totalPages = 1 }) => {

  if (loading) {
    return (
      <div className="text-center p-10 text-text-secondary">
        Memuat data...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-10 text-text-secondary">
        Data tidak ditemukan
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto bg-card rounded-lg border border-border">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-main border-b border-border">
              {columns.map((col, index) => (
                <th key={index} className="p-4 font-semibold text-text-secondary text-[0.9rem]">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border last:border-b-0 hover:bg-surface transition-colors duration-200">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="p-4 text-[0.95rem]">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-end mt-5 gap-2.5">
          <button 
            className="bg-surface text-text-primary border border-border px-3 py-2 rounded-md font-medium transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-hover hover:border-text-muted disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <FiChevronLeft size={18} /> Prev
          </button>
          
          <div className="flex items-center mx-2.5 text-[0.9rem] text-text-secondary">
            Page {currentPage} of {totalPages}
          </div>

          <button 
            className="bg-surface text-text-primary border border-border px-3 py-2 rounded-md font-medium transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-hover hover:border-text-muted disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next <FiChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
