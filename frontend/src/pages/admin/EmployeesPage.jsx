import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { FiUsers, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import dayjs from 'dayjs';

const EmployeesPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const initialForm = { nip: '', name: '', email: '', department: '', position: '', phone: '' };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchEmployees = async (page) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/employees?page=${page}&limit=${limit}`);
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
    fetchEmployees(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData(initialForm);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (employee) => {
    setModalMode('edit');
    setSelectedEmployee(employee);
    setFormData({
      nip: employee.nip,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      phone: employee.phone || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data karyawan ${name}? User login mereka juga akan dihapus.`)) {
      try {
        await apiClient.delete(`/employees/${id}`);
        fetchEmployees(currentPage);
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus karyawan');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (modalMode === 'create') {
        await apiClient.post('/employees', formData);
      } else {
        const payload = { ...formData };
        delete payload.nip;
        await apiClient.patch(`/employees/${selectedEmployee.id}`, payload);
      }
      
      setIsModalOpen(false);
      fetchEmployees(currentPage);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setFormLoading(false);
    }
  };

  const inputClasses = "w-full py-3 px-4 bg-main border border-border rounded-md text-text-primary font-[inherit] text-[0.95rem] transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] placeholder:text-text-muted";

  const columns = [
    { header: 'NIP', accessor: 'nip', render: (row) => <span className="font-semibold text-primary">{row.nip}</span> },
    { header: 'Nama Lengkap', accessor: 'name' },
    { header: 'Email / Username', accessor: 'email', render: (row) => <div><div>{row.email}</div><div className="text-[0.8rem] text-text-secondary">user: {row.nip}</div></div> },
    { header: 'Departemen & Posisi', accessor: 'department', render: (row) => <div><div>{row.department}</div><div className="text-[0.8rem] text-text-secondary">{row.position}</div></div> },
    { header: 'Bergabung', accessor: 'created_at', render: (row) => <span className="text-text-secondary">{dayjs(row.created_at).format('DD MMM YYYY')}</span> },
    {
      header: 'Aksi',
      accessor: 'id',
      render: (row) => (
        <div className="flex gap-2">
          <button className="bg-surface text-text-primary border border-border px-2.5 py-1.5 rounded-md font-medium transition-all duration-250 hover:bg-hover hover:border-text-muted" onClick={() => openEditModal(row)} title="Edit">
            <FiEdit2 size={16} />
          </button>
          <button className="bg-transparent text-danger border border-danger px-2.5 py-1.5 rounded-sm transition-all duration-250 text-[0.85rem] font-medium hover:bg-danger/10 hover:shadow-[0_0_12px_rgba(239,68,68,0.2)]" onClick={() => handleDelete(row.id, row.name)} title="Hapus">
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex-1 py-8 px-[5%] max-w-[1400px] mx-auto w-full">
      <div className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-[1.8rem] font-semibold tracking-tight flex items-center gap-2.5">
            <FiUsers className="text-primary" /> Manajemen Karyawan
          </h1>
          <p className="text-text-secondary mt-1">Kelola data karyawan dan akses login HRIS.</p>
        </div>
        
        <button className="bg-primary text-white border-none px-6 py-2.5 rounded-md font-medium text-[0.95rem] transition-all duration-250 inline-flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(59,130,246,0.2)] hover:bg-primary-hover hover:shadow-glow hover:-translate-y-px active:translate-y-px" onClick={openCreateModal}>
          <FiPlus /> Tambah Karyawan
        </button>
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

      {/* Modal Form Create/Edit */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Tambah Karyawan Baru' : 'Edit Data Karyawan'}
      >
        {formError && (
          <div className="text-danger text-[0.8rem] mb-5 p-2.5 bg-danger/10 rounded-sm">
            {formError}
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          {modalMode === 'create' && (
            <div className="mb-5">
              <label className="block mb-2 text-[0.9rem] font-medium text-text-secondary">NIP (Nomor Induk Pegawai)</label>
              <input 
                type="text" 
                className={inputClasses}
                value={formData.nip || ''}
                onChange={(e) => setFormData({...formData, nip: e.target.value})}
                required
                placeholder="Misal: 2026001"
              />
            </div>
          )}

          <div className="mb-5">
            <label className="block mb-2 text-[0.9rem] font-medium text-text-secondary">Nama Lengkap</label>
            <input 
              type="text" 
              className={inputClasses}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="mb-5 flex-1">
              <label className="block mb-2 text-[0.9rem] font-medium text-text-secondary">Email</label>
              <input 
                type="email" 
                className={inputClasses}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="mb-5 flex-1">
              <label className="block mb-2 text-[0.9rem] font-medium text-text-secondary">Nomor HP</label>
              <input 
                type="text" 
                className={inputClasses}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="mb-5 flex-1">
              <label className="block mb-2 text-[0.9rem] font-medium text-text-secondary">Departemen</label>
              <input 
                type="text" 
                className={inputClasses}
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                required
              />
            </div>
            <div className="mb-5 flex-1">
              <label className="block mb-2 text-[0.9rem] font-medium text-text-secondary">Jabatan (Position)</label>
              <input 
                type="text" 
                className={inputClasses}
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                required
              />
            </div>
          </div>

          {modalMode === 'create' && (
             <div className="p-4 bg-surface rounded-sm border border-border mb-5">
               <div className="text-[0.85rem] text-text-secondary">
                 <strong>Catatan:</strong> Akun login akan menggunakan NIP sebagai username, dan password default `dexa2026`. Karyawan wajib mengubah password saat login pertama kali.
               </div>
             </div>
          )}

          <div className="flex justify-end gap-2.5 mt-2.5">
             <button type="button" className="bg-surface text-text-primary border border-border px-6 py-2.5 rounded-md font-medium transition-all duration-250 hover:bg-hover hover:border-text-muted" onClick={() => setIsModalOpen(false)}>Batal</button>
             <button type="submit" className="bg-primary text-white border-none px-6 py-2.5 rounded-md font-medium text-[0.95rem] transition-all duration-250 inline-flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(59,130,246,0.2)] hover:bg-primary-hover hover:shadow-glow hover:-translate-y-px active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed" disabled={formLoading}>
               {formLoading ? 'Menyimpan...' : 'Simpan Data'}
             </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
