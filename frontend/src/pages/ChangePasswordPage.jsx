import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { AuthContext } from '../contexts/AuthContext';
import { FiShield, FiKey, FiCheckCircle, FiLock } from 'react-icons/fi';

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
      
      updateUser({ needResetPassword: false });

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

  const inputClasses = "w-full py-3 pr-4 pl-11 bg-main border border-border rounded-md text-text-primary font-[inherit] text-[0.95rem] transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] placeholder:text-text-muted";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-[450px] p-10 bg-card backdrop-blur-[12px] border border-border shadow-main rounded-lg animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-[60px] h-[60px] rounded-full bg-warning/15 text-warning mb-4">
            <FiShield size={28} />
          </div>
          <h2 className="text-[1.5rem] mb-2.5">Ubah Password Anda</h2>
          <p className="text-text-secondary text-[0.9rem]">
            Demi keamanan, Anda diwajibkan untuk mengganti password default (sementara) sebelum mengakses aplikasi.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-danger/10 border-l-4 border-l-danger text-danger mb-5 rounded-sm text-[0.9rem]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block mb-2 text-[0.9rem] font-medium text-text-secondary">Password Lama</label>
            <div className="relative">
              <FiKey className="absolute top-1/2 left-4 -translate-y-1/2 text-text-muted" />
              <input
                type="password"
                className={inputClasses}
                placeholder="Masukkan password default"
                value={formData.oldPassword}
                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-[0.9rem] font-medium text-text-secondary">Password Baru</label>
            <div className="relative">
              <FiLock className="absolute top-1/2 left-4 -translate-y-1/2 text-text-muted" />
              <input
                type="password"
                className={inputClasses}
                placeholder="Minimal 8 karakter"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block mb-2 text-[0.9rem] font-medium text-text-secondary">Konfirmasi Password Baru</label>
            <div className="relative">
              <FiLock className="absolute top-1/2 left-4 -translate-y-1/2 text-text-muted" />
              <input
                type="password"
                className={inputClasses}
                placeholder="Ulangi password baru"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-warning text-white border-none rounded-md font-medium text-[0.95rem] transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] inline-flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(59,130,246,0.2)] hover:brightness-110 hover:-translate-y-px active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
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

export default ChangePasswordPage;
