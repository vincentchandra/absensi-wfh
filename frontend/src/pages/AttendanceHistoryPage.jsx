import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import DataTable from '../components/DataTable';
import dayjs from 'dayjs';
import { FiClock } from 'react-icons/fi';

const AttendanceHistoryPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchHistory = async (page) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/attendances/my?page=${page}&limit=${limit}`);
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
    fetchHistory(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Define how the data table should render these columns
  const columns = [
    {
      header: 'Tanggal',
      accessor: 'attendanceDate',
      render: (row) => dayjs(row.attendanceDate).format('DD MMMM YYYY')
    },
    {
      header: 'Clock In',
      accessor: 'clockIn',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.clockIn}</span>
      )
    },
    {
      header: 'Clock Out',
      accessor: 'clockOut',
      render: (row) => row.clockOut ? (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.clockOut}</span>
      ) : (
        <span className="badge badge-warning">Sedang Bekerja</span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <span className="badge badge-info">{row.status}</span>
    },
    {
      header: 'Catatan',
      accessor: 'notes',
      render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.notes || '-'}</span>
    }
  ];

  return (
    <div className="content-wrap">
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiClock color="var(--primary-color)" /> Riwayat Absensi Saya
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Detail riwayat clock-in dan clock-out Anda selama WFH.</p>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ padding: '30px' }}>
        <DataTable 
          columns={columns} 
          data={data} 
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default AttendanceHistoryPage;
