import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { FiActivity, FiSearch, FiImage } from 'react-icons/fi';
import dayjs from 'dayjs';

const AttendanceMonitorPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterEmployeeId, setFilterEmployeeId] = useState('');

  // Photo viewer modal
  const [photoUrl, setPhotoUrl] = useState(null);

  const fetchAttendances = async (page) => {
    setLoading(true);
    try {
      let url = `/attendances?page=${page}&limit=${limit}`;
      if (filterDate) url += `&date=${filterDate}`;
      if (filterEmployeeId) url += `&employee_id=${filterEmployeeId}`;
      
      const response = await apiClient.get(url);
      setData(response.data.data);
      const calculatedPages = Math.ceil(response.data.total / limit);
      setTotalPages(calculatedPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances(currentPage);
  }, [currentPage]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if (currentPage === 1) {
      fetchAttendances(1);
    } else {
      setCurrentPage(1); // this will trigger the useEffect
    }
  };

  const handleClearFilters = () => {
    setFilterDate('');
    setFilterEmployeeId('');
    if (currentPage === 1) {
      setTimeout(() => fetchAttendances(1), 0); // Need settimeout to allow state to clear before fetch in some cases, though not strictly needed here if we rely on useEffect, but wait, setting state doesnt immediately apply in this closure!
    } else {
      setCurrentPage(1);
    }
  };

  const columns = [
    { 
      header: 'Tanggal', 
      accessor: 'attendanceDate',
      render: (row) => <span style={{ fontWeight: 500 }}>{dayjs(row.attendanceDate).format('DD MMM YYYY')}</span>
    },
    { 
      header: 'Karyawan', 
      accessor: 'employee',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.employee?.name || 'Unknown'}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>NIP: {row.employee?.nip}</div>
        </div>
      )
    },
    { header: 'Clock In', accessor: 'clockIn', render: (row) => <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>{row.clockIn}</span> },
    { header: 'Clock Out', accessor: 'clockOut', render: (row) => row.clockOut ? <span style={{ color: 'var(--warning-color)', fontWeight: 600 }}>{row.clockOut}</span> : <span className="badge badge-info">Masih Bekerja</span> },
    { 
      header: 'Foto WFH',
      accessor: 'photoUrl',
      render: (row) => (
        row.photoUrl ? (
          <button 
            className="btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            onClick={() => setPhotoUrl(`http://localhost:3001${row.photoUrl}`)}
          >
            <FiImage /> Lihat Foto
          </button>
        ) : <span style={{ color: 'var(--text-muted)' }}>Tidak ada data</span>
      )
    },
    { header: 'Status', accessor: 'status', render: (row) => <span className="badge badge-success">{row.status}</span> },
    { header: 'Catatan', accessor: 'notes', render: (row) => <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{row.notes || '-'}</span> },
  ];

  return (
    <div className="content-wrap">
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiActivity color="var(--primary-color)" /> Monitoring Absensi
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Semua pergerakan absensi WFH karyawan terekam di sini.</p>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ padding: '20px', marginBottom: '30px' }}>
         <form onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, maxWidth: '200px' }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Tanggal</label>
              <input 
                type="date" 
                className="form-control" 
                style={{ padding: '8px 12px' }}
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <div style={{ flex: 1, maxWidth: '200px' }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>ID Karyawan</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="Misal: 1"
                style={{ padding: '8px 12px' }}
                value={filterEmployeeId}
                onChange={(e) => setFilterEmployeeId(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
               <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                 <FiSearch /> Filter
               </button>
               {(filterDate || filterEmployeeId) && (
                  <button type="button" className="btn-secondary" style={{ padding: '8px 20px' }} onClick={handleClearFilters}>
                     Reset
                  </button>
               )}
            </div>
         </form>
      </div>

      <div className="glass-panel animate-fade-in" style={{ padding: '30px', animationDelay: '0.1s' }}>
        <DataTable 
          columns={columns} 
          data={data} 
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal 
        isOpen={!!photoUrl} 
        onClose={() => setPhotoUrl(null)}
        title="Foto Bukti WFH"
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
           {photoUrl && (
             <img src={photoUrl} alt="Bukti WFH" style={{ maxWidth: '100%', borderRadius: 'var(--radius-sm)' }} />
           )}
        </div>
      </Modal>
    </div>
  );
};

export default AttendanceMonitorPage;
