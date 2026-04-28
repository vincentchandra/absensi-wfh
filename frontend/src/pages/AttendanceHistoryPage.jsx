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
        <span className="font-semibold text-text-primary">{row.clockIn}</span>
      )
    },
    {
      header: 'Clock Out',
      accessor: 'clockOut',
      render: (row) => row.clockOut ? (
        <span className="font-semibold text-text-primary">{row.clockOut}</span>
      ) : (
        <span className="px-2.5 py-1 rounded-full text-[0.75rem] font-semibold tracking-wide bg-warning/15 text-warning border border-warning/30">Sedang Bekerja</span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <span className="px-2.5 py-1 rounded-full text-[0.75rem] font-semibold tracking-wide bg-primary/15 text-primary border border-primary/30">{row.status}</span>
    },
    {
      header: 'Catatan',
      accessor: 'notes',
      render: (row) => <span className="text-text-secondary">{row.notes || '-'}</span>
    }
  ];

  return (
    <div className="flex-1 py-8 px-[5%] max-w-[1400px] mx-auto w-full">
      <div className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-[1.8rem] font-semibold tracking-tight flex items-center gap-2.5">
            <FiClock className="text-primary" /> Riwayat Absensi Saya
          </h1>
          <p className="text-text-secondary mt-1">Detail riwayat clock-in dan clock-out Anda selama WFH.</p>
        </div>
      </div>

      <div className="bg-card backdrop-blur-[12px] border border-border shadow-main rounded-lg p-8 animate-fade-in">
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
