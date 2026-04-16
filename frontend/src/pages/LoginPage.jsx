import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { AuthContext } from '../contexts/AuthContext';
import { FiLock, FiUser, FiLogIn } from 'react-icons/fi';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Username dan password wajib diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', formData);
      const { access_token, user } = response.data;
      
      // Save globally
      login(access_token, user);

      // Route based on role
      // Note: ProtectedRoute handles needResetPassword interception automatically
      if (user.role === 'ADMIN') {
        navigate('/admin/employees', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login gagal. Periksa username dan password Anda.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-glow)',
            color: 'var(--primary-color)',
            marginBottom: '15px'
          }}>
            <FiLock size={28} />
          </div>
          <h1 className="page-title" style={{ marginBottom: '5px' }}>Selamat Datang</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Masuk ke Portal Karyawan Dexa</p>
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
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <FiUser style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Masukkan username"
                style={{ paddingLeft: '44px' }}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-control"
                placeholder="Masukkan password"
                style={{ paddingLeft: '44px' }}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '14px' }}
            disabled={loading}
          >
            {loading ? 'Memproses...' : (
              <>
                <FiLogIn /> Masuk sekarang
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
