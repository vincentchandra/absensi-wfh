import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { AuthContext } from '../contexts/AuthContext';
import { FiShield, FiKey, FiCheckCircle } from 'react-icons/fi';

const ChangePasswordPage = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Semua field wajib diisi');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password baru minimal 8 karakter');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiClient.post('/auth/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      
      // Update local state and skip needResetPassword routing block
      updateUser({ needResetPassword: false });

      // Redirect to correct dashboard
      if (user.role === 'ADMIN') {
        navigate('/admin/employees', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Gagal mengubah password. Pastikan password lama benar.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            color: 'var(--warning-color)',
            marginBottom: '15px'
          }}>
            <FiShield size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Ubah Password Anda</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Demi keamanan, Anda diwajibkan untuk mengganti password default (sementara) sebelum mengakses aplikasi.
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderLeft: '4px solid var(--danger-color)',
            color: 'var(--danger-color)',
            marginBottom: '20px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Password Lama</label>
            <div style={{ position: 'relative' }}>
              <FiKey style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-control"
                placeholder="Masukkan password default"
                style={{ paddingLeft: '44px' }}
                value={formData.oldPassword}
                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password Baru</label>
            <div style={{ position: 'relative' }}>
              <FiLockIconWrapper />
              <input
                type="password"
                className="form-control"
                placeholder="Minimal 8 karakter"
                style={{ paddingLeft: '44px' }}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="form-label">Konfirmasi Password Baru</label>
            <div style={{ position: 'relative' }}>
               <FiLockIconWrapper />
              <input
                type="password"
                className="form-control"
                placeholder="Ulangi password baru"
                style={{ paddingLeft: '44px' }}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '14px', backgroundColor: 'var(--warning-color)' }}
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : (
              <>
                <FiCheckCircle /> Simpan & Lanjutkan
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// Quick wrapper for lock icon to map the correct icon
import { FiLock } from 'react-icons/fi';
const FiLockIconWrapper = () => (
    <FiLock style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
);

export default ChangePasswordPage;
