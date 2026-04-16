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
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
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
      nip: employee.nip, // We cannot edit NIP according to backend DTO, but we need it here for context
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
        const payload = {
          nip: formData.nip, // Add NIP manually if they typed it
          name: formData.name,
          email: formData.email,
          department: formData.department,
          position: formData.position,
          phone: formData.phone
        };
        // Backend auto-generates NIP if not provided, but since we didn't add it to form state, we rely on backend
        await apiClient.post('/employees', formData);
      } else {
        // Edit mode
        const payload = { ...formData };
        delete payload.nip; // remove NIP because update-employee dto doesn't permit it
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

  const columns = [
    { header: 'NIP', accessor: 'nip', render: (row) => <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{row.nip}</span> },
    { header: 'Nama Lengkap', accessor: 'name' },
    { header: 'Email / Username', accessor: 'email', render: (row) => <div><div>{row.email}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>user: {row.nip}</div></div> },
    { header: 'Departemen & Posisi', accessor: 'department', render: (row) => <div><div>{row.department}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.position}</div></div> },
    { header: 'Bergabung', accessor: 'created_at', render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{dayjs(row.created_at).format('DD MMM YYYY')}</span> },
    {
      header: 'Aksi',
      accessor: 'id',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" style={{ padding: '6px 10px' }} onClick={() => openEditModal(row)} title="Edit">
            <FiEdit2 size={16} />
          </button>
          <button className="btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleDelete(row.id, row.name)} title="Hapus">
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="content-wrap">
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiUsers color="var(--primary-color)" /> Manajemen Karyawan
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Kelola data karyawan dan akses login HRIS.</p>
        </div>
        
        <button className="btn-primary" onClick={openCreateModal}>
          <FiPlus /> Tambah Karyawan
        </button>
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

      {/* Modal Form Create/Edit */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Tambah Karyawan Baru' : 'Edit Data Karyawan'}
      >
        {formError && (
          <div className="form-error" style={{ marginBottom: '20px', padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          {modalMode === 'create' && (
            <div className="form-group">
              <label className="form-label">NIP (Nomor Induk Pegawai)</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.nip || ''}
                onChange={(e) => setFormData({...formData, nip: e.target.value})}
                required
                placeholder="Misal: 2026001"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-control" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Nomor HP</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Departemen</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Jabatan (Position)</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                required
              />
            </div>
          </div>

          {modalMode === 'create' && (
             <div style={{ padding: '15px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
               <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                 <strong>Catatan:</strong> Akun login akan menggunakan NIP sebagai username, dan password default `dexa2026`. Karyawan wajib mengubah password saat login pertama kali.
               </div>
             </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
             <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
             <button type="submit" className="btn-primary" disabled={formLoading}>
               {formLoading ? 'Menyimpan...' : 'Simpan Data'}
             </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
