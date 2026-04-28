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
      setCurrentPage(1);
    }
  };

  const handleClearFilters = () => {
    setFilterDate('');
    setFilterEmployeeId('');
    if (currentPage === 1) {
      setTimeout(() => fetchAttendances(1), 0);
    } else {
      setCurrentPage(1);
    }
  };

  const inputClasses = "w-full py-2 px-3 bg-main border border-border rounded-md text-text-primary font-[inherit] text-[0.95rem] transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] placeholder:text-text-muted";

  const columns = [
    { 
      header: 'Tanggal', 
      accessor: 'attendanceDate',
      render: (row) => <span className="font-medium">{dayjs(row.attendanceDate).format('DD MMM YYYY')}</span>
    },
    { 
      header: 'Karyawan', 
      accessor: 'employee',
      render: (row) => (
        <div>
          <div className="font-semibold">{row.employee?.name || 'Unknown'}</div>
          <div className="text-[0.8rem] text-text-secondary">NIP: {row.employee?.nip}</div>
        </div>
      )
    },
    { header: 'Clock In', accessor: 'clockIn', render: (row) => <span className="text-success font-semibold">{row.clockIn}</span> },
    { header: 'Clock Out', accessor: 'clockOut', render: (row) => row.clockOut ? <span className="text-warning font-semibold">{row.clockOut}</span> : <span className="px-2.5 py-1 rounded-full text-[0.75rem] font-semibold tracking-wide bg-primary/15 text-primary border border-primary/30">Masih Bekerja</span> },
    { 
      header: 'Foto WFH',
      accessor: 'photoUrl',
      render: (row) => (
        row.photoUrl ? (
          <button 
            className="bg-surface text-text-primary border border-border px-3 py-1.5 rounded-md font-medium text-[0.85rem] transition-all duration-250 hover:bg-hover hover:border-text-muted inline-flex items-center gap-1.5"
            onClick={() => setPhotoUrl(`http://localhost:3001${row.photoUrl}`)}
          >
            <FiImage /> Lihat Foto
          </button>
        ) : <span className="text-text-muted">Tidak ada data</span>
      )
    },
    { header: 'Status', accessor: 'status', render: (row) => <span className="px-2.5 py-1 rounded-full text-[0.75rem] font-semibold tracking-wide bg-success/15 text-success border border-success/30">{row.status}</span> },
    { header: 'Catatan', accessor: 'notes', render: (row) => <span className="text-[0.9rem] text-text-secondary">{row.notes || '-'}</span> },
  ];

  return (
    <div className="flex-1 py-8 px-[5%] max-w-[1400px] mx-auto w-full">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-[1.8rem] font-semibold tracking-tight flex items-center gap-2.5">
            <FiActivity className="text-primary" /> Monitoring Absensi
          </h1>
          <p className="text-text-secondary mt-1">Semua pergerakan absensi WFH karyawan terekam di sini.</p>
        </div>
      </div>

      <div className="bg-card backdrop-blur-[12px] border border-border shadow-main rounded-lg p-5 mb-8 animate-fade-in">
         <form onSubmit={handleFilterSubmit} className="flex gap-4 items-end">
            <div className="flex-1 max-w-[200px]">
              <label className="block mb-2 text-[0.85rem] font-medium text-text-secondary">Tanggal</label>
              <input 
                type="date" 
                className={inputClasses}
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <div className="flex-1 max-w-[200px]">
              <label className="block mb-2 text-[0.85rem] font-medium text-text-secondary">ID Karyawan</label>
              <input 
                type="number" 
                className={inputClasses}
                placeholder="Misal: 1"
                value={filterEmployeeId}
                onChange={(e) => setFilterEmployeeId(e.target.value)}
              />
            </div>
            <div className="flex gap-2.5">
               <button type="submit" className="bg-primary text-white border-none px-5 py-2 rounded-md font-medium transition-all duration-250 inline-flex items-center gap-2 hover:bg-primary-hover hover:shadow-glow hover:-translate-y-px">
                 <FiSearch /> Filter
               </button>
               {(filterDate || filterEmployeeId) && (
                  <button type="button" className="bg-surface text-text-primary border border-border px-5 py-2 rounded-md font-medium transition-all duration-250 hover:bg-hover hover:border-text-muted" onClick={handleClearFilters}>
                     Reset
                  </button>
               )}
            </div>
         </form>
      </div>

      <div className="bg-card backdrop-blur-[12px] border border-border shadow-main rounded-lg p-8 animate-fade-in [animation-delay:0.1s]">
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
        <div className="flex justify-center">
           {photoUrl && (
             <img src={photoUrl} alt="Bukti WFH" className="max-w-full rounded-sm" />
           )}
        </div>
      </Modal>
    </div>
  );
};

export default AttendanceMonitorPage;
