import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { AuthContext } from '../contexts/AuthContext';
import { FiLock, FiUser, FiLogIn, FiShield } from 'react-icons/fi';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [totpCode, setTotpCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [requireMfaSetup, setRequireMfaSetup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Username dan password wajib diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', formData);
      const { tempToken: token, requireMfaSetup: needSetup, qrCode: qr, message } = response.data;
      
      setTempToken(token);
      setRequireMfaSetup(needSetup);
      if (qr) {
        setQrCode(qr);
      }
      setStep(2);
      setError('');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login gagal. Periksa username dan password Anda.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTotpSubmit = async (e) => {
    e.preventDefault();
    if (!totpCode) {
      setError('Kode TOTP wajib diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/verify-totp', {
        tempToken,
        totpCode,
      });
      const { access_token, user } = response.data;
      
      login(access_token, user);

      if (user.role === 'ADMIN') {
        navigate('/admin/employees', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Kode TOTP tidak valid. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
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
              backgroundColor: 'var(--primary-glow)',
              color: 'var(--primary-color)',
              marginBottom: '15px'
            }}>
              <FiShield size={28} />
            </div>
            <h1 className="page-title" style={{ marginBottom: '5px' }}>Verifikasi MFA</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {requireMfaSetup 
                ? 'Scan QR code dengan aplikasi authenticator Anda' 
                : 'Masukkan kode dari aplikasi authenticator Anda'}
            </p>
          </div>

          {requireMfaSetup && qrCode && (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img src={qrCode} alt="QR Code" style={{ maxWidth: '200px', margin: '0 auto' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '10px' }}>
                Gunakan Google Authenticator atau aplikasi TOTP lainnya
              </p>
            </div>
          )}

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

          <form onSubmit={handleTotpSubmit}>
            <div className="form-group" style={{ marginBottom: '30px' }}>
              <label className="form-label">Kode TOTP (6 digit)</label>
              <div style={{ position: 'relative' }}>
                <FiShield style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Masukkan kode 6 digit"
                  style={{ paddingLeft: '44px', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.3em' }}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '14px' }}
              disabled={loading || totpCode.length !== 6}
            >
              {loading ? 'Memverifikasi...' : (
                <>
                  <FiLogIn /> Verifikasi & Masuk
                </>
              )}
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{ width: '100%', padding: '14px', marginTop: '10px' }}
              onClick={() => {
                setStep(1);
                setTotpCode('');
                setError('');
              }}
              disabled={loading}
            >
              Kembali
            </button>
          </form>
        </div>
      </div>
    );
  }

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

        <form onSubmit={handleLoginSubmit}>
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
                <FiLogIn /> Lanjutkan
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
