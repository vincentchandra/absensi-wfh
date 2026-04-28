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
      
      login(access_token, user);

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
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-[400px] p-10 bg-card backdrop-blur-[12px] border border-border shadow-main rounded-lg animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-[60px] h-[60px] rounded-full bg-primary-glow text-primary mb-4">
            <FiLock size={28} />
          </div>
          <h1 className="text-[1.8rem] font-semibold tracking-tight mb-1">Selamat Datang</h1>
          <p className="text-text-secondary">Masuk ke Portal Karyawan Dexa</p>
        </div>

        {error && (
          <div className="p-3 bg-danger/10 border-l-4 border-l-danger text-danger mb-5 rounded-sm text-[0.9rem]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block mb-2 text-[0.9rem] font-medium text-text-secondary">Username</label>
            <div className="relative">
              <FiUser className="absolute top-1/2 left-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                className="w-full py-3 pr-4 pl-11 bg-main border border-border rounded-md text-text-primary font-[inherit] text-[0.95rem] transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] placeholder:text-text-muted"
                placeholder="Masukkan username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block mb-2 text-[0.9rem] font-medium text-text-secondary">Password</label>
            <div className="relative">
              <FiLock className="absolute top-1/2 left-4 -translate-y-1/2 text-text-muted" />
              <input
                type="password"
                className="w-full py-3 pr-4 pl-11 bg-main border border-border rounded-md text-text-primary font-[inherit] text-[0.95rem] transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] placeholder:text-text-muted"
                placeholder="Masukkan password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-primary text-white border-none rounded-md font-medium text-[0.95rem] transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] inline-flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(59,130,246,0.2)] hover:bg-primary-hover hover:shadow-glow hover:-translate-y-px active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
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
