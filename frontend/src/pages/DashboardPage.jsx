import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import apiClient from '../api/client';
import PhotoCapture from '../components/PhotoCapture';
import { FiClock, FiCalendar, FiMapPin, FiCheckCircle } from 'react-icons/fi';

dayjs.locale('id');

const DashboardPage = () => {
  const [time, setTime] = useState(dayjs());
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Custom states for Clock In flow
  const [photo, setPhoto] = useState(null);
  const [photoConfirmed, setPhotoConfirmed] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today status
  const fetchTodayStatus = async () => {
    try {
      const res = await apiClient.get('/attendances/today');
      setTodayAttendance(res.data); // will be null if no clock in
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const handleClockIn = async () => {
    if (!photo) {
      setError("Silakan ambil foto bukti WFH terlebih dahulu.");
      return;
    }

    setProcessing(true);
    setError('');

    const formData = new FormData();
    formData.append('photo', photo);
    if (notes) formData.append('notes', notes);

    try {
      await apiClient.post('/attendances/clock-in', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchTodayStatus();
      setPhoto(null);
      setPhotoConfirmed(false);
      setNotes('');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal melakukan Clock In');
    } finally {
      setProcessing(false);
    }
  };

  const handleClockOut = async () => {
    setProcessing(true);
    setError('');
    try {
      await apiClient.patch('/attendances/clock-out');
      await fetchTodayStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal melakukan Clock Out');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return null;

  return (
    <div className="content-wrap" style={{ paddingTop: '50px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Absensi WFH</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back! Jangan lupa absen ya.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Left Column - Live Clock & Status */}
        <div style={{ flex: '1 1 400px' }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '30px', textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '10px' }}>
              <FiCalendar style={{ marginRight: '8px' }} />
              {time.format('dddd, DD MMMM YYYY')}
            </div>
            <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary-color)', lineHeight: 1, letterSpacing: '-2px' }}>
              {time.format('HH:mm:ss')}
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <div style={{ padding: '10px 20px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status Saat Ini</div>
                <div style={{ fontWeight: 600, color: todayAttendance ? (todayAttendance.clockOut ? 'var(--warning-color)' : 'var(--success-color)') : 'var(--text-primary)' }}>
                  {!todayAttendance && 'Belum Absen'}
                  {todayAttendance && !todayAttendance.clockOut && 'Sedang Bekerja (WFH)'}
                  {todayAttendance && todayAttendance.clockOut && 'Selesai Bekerja'}
                </div>
              </div>
            </div>
          </div>

          {/* Clock In / Out Records */}
          {todayAttendance && (
             <div className="glass-panel animate-fade-in" style={{ padding: '30px', animationDelay: '0.1s' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Perekaman Hari Ini</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', 
                      backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                      <FiClock size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Jam Masuk</div>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{todayAttendance.clockIn}</div>
                    </div>
                  </div>

                  {todayAttendance.clockOut && (
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', 
                        backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                      }}>
                        <FiLogOut size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Jam Keluar</div>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{todayAttendance.clockOut}</div>
                      </div>
                    </div>
                  )}
                </div>
             </div>
          )}
        </div>

        {/* Right Column - Action Form */}
        <div style={{ flex: '1 1 500px' }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '30px', animationDelay: '0.2s', height: '100%' }}>
            
            {!todayAttendance ? (
              // CLOCK IN FLOW
              <div>
                <h3 style={{ marginBottom: '20px', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiMapPin color="var(--primary-color)" /> Clock In WFH
                </h3>

                {error && <div className="form-error" style={{ marginBottom: '15px', padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>{error}</div>}

                <div style={{ marginBottom: '25px' }}>
                  <label className="form-label" style={{ marginBottom: '15px' }}>Foto Bukti WFH (Wajib)</label>
                  <PhotoCapture 
                    onPhotoTaken={(file) => {
                      setPhoto(file);
                      setPhotoConfirmed(!!file);
                    }} 
                  />
                </div>

                {photoConfirmed && (
                  <>
                    <div className="form-group animate-fade-in">
                      <label className="form-label">Catatan Kegiatan (Opsional)</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Rencana kegiatan hari ini..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      ></textarea>
                    </div>

                    <button 
                      className="btn-primary animate-fade-in" 
                      style={{ width: '100%', padding: '15px', fontSize: '1.05rem', backgroundColor: 'var(--success-color)' }}
                      onClick={handleClockIn}
                      disabled={processing}
                    >
                      {processing ? 'Memproses...' : (
                        <>
                          <FiCheckCircle size={20} /> Konfirmasi Clock In
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            ) : !todayAttendance.clockOut ? (
              // CLOCK OUT FLOW
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', 
                  backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px' 
                }}>
                  <FiActivity size={40} />
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>Waktunya Selesai Bekerja?</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', maxWidth: '300px' }}>
                  Pekerjaan hari ini sudah usai. Jangan lupa untuk clock-out ya.
                </p>

                {error && <div className="form-error" style={{ marginBottom: '15px' }}>{error}</div>}

                <button 
                  className="btn-primary" 
                  style={{ padding: '15px 40px', fontSize: '1.1rem', backgroundColor: 'var(--warning-color)' }}
                  onClick={handleClockOut}
                  disabled={processing}
                >
                  {processing ? 'Memproses...' : 'Akhiri Hari Kerja (Clock Out)'}
                </button>
              </div>
            ) : (
                // DONE FOR TODAY
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', 
                  backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px' 
                }}>
                  <FiCheckCircle size={40} />
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>Terima Kasih!</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>
                  Anda sudah menyelesaikan hari kerja hari ini. Selamat beristirahat!
                </p>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
};

// Simple manual wrapper for missing icon import
import { FiLogOut, FiActivity } from 'react-icons/fi';

export default DashboardPage;
