import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const DataTable = ({ columns, data, loading, onPageChange, currentPage = 1, totalPages = 1 }) => {

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        Memuat data...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        Data tidak ditemukan
      </div>
    );
  }

  return (
    <div>
      <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
              {columns.map((col, index) => (
                <th key={index} style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="table-row" style={{ borderBottom: '1px solid var(--border-color)' }}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} style={{ padding: '16px', fontSize: '0.95rem' }}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .table-row:last-child {
          border-bottom: none;
        }
        .table-row:hover {
          background-color: var(--bg-surface);
        }
      `}</style>
      
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px' }}>
          <button 
            className="btn-secondary" 
            style={{ padding: '8px 12px' }}
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <FiChevronLeft size={18} /> Prev
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', margin: '0 10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Page {currentPage} of {totalPages}
          </div>

          <button 
            className="btn-secondary" 
            style={{ padding: '8px 12px' }}
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
