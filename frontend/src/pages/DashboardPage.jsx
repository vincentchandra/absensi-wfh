import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import apiClient from '../api/client';
import PhotoCapture from '../components/PhotoCapture';
import { FiClock, FiCalendar, FiMapPin, FiCheckCircle, FiLogOut, FiActivity } from 'react-icons/fi';

dayjs.locale('id');

const DashboardPage = () => {
  const [time, setTime] = useState(dayjs());
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [photo, setPhoto] = useState(null);
  const [photoConfirmed, setPhotoConfirmed] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const res = await apiClient.get('/attendances/today');
      setTodayAttendance(res.data);
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
    <div className="flex-1 py-12 px-[5%] max-w-[1400px] mx-auto w-full">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-[1.8rem] font-semibold tracking-tight">Dashboard Absensi WFH</h1>
          <p className="text-text-secondary">Welcome back! Jangan lupa absen ya.</p>
        </div>
      </div>

      <div className="flex gap-8 flex-wrap">
        {/* Left Column - Live Clock & Status */}
        <div className="flex-[1_1_400px]">
          <div className="bg-card backdrop-blur-[12px] border border-border shadow-main rounded-lg p-8 text-center mb-8 animate-fade-in">
            <div className="text-text-secondary text-[1.2rem] mb-2.5">
              <FiCalendar className="inline mr-2" />
              {time.format('dddd, DD MMMM YYYY')}
            </div>
            <div className="text-[4rem] font-extrabold text-primary leading-none tracking-[-2px]">
              {time.format('HH:mm:ss')}
            </div>
            <div className="mt-5 flex justify-center gap-4">
              <div className="px-5 py-2.5 bg-main rounded-md border border-border">
                <div className="text-[0.8rem] text-text-secondary">Status Saat Ini</div>
                <div className={`font-semibold ${
                  todayAttendance 
                    ? (todayAttendance.clockOut ? 'text-warning' : 'text-success') 
                    : 'text-text-primary'
                }`}>
                  {!todayAttendance && 'Belum Absen'}
                  {todayAttendance && !todayAttendance.clockOut && 'Sedang Bekerja (WFH)'}
                  {todayAttendance && todayAttendance.clockOut && 'Selesai Bekerja'}
                </div>
              </div>
            </div>
          </div>

          {/* Clock In / Out Records */}
          {todayAttendance && (
             <div className="bg-card backdrop-blur-[12px] border border-border shadow-main rounded-lg p-8 animate-fade-in [animation-delay:0.1s]">
                <h3 className="mb-5 text-[1.2rem]">Perekaman Hari Ini</h3>
                
                <div className="flex flex-col gap-5">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center">
                      <FiClock size={20} />
                    </div>
                    <div>
                      <div className="text-[0.9rem] text-text-secondary">Jam Masuk</div>
                      <div className="font-semibold text-[1.1rem]">{todayAttendance.clockIn}</div>
                    </div>
                  </div>

                  {todayAttendance.clockOut && (
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full bg-danger/10 text-danger flex items-center justify-center">
                        <FiLogOut size={20} />
                      </div>
                      <div>
                        <div className="text-[0.9rem] text-text-secondary">Jam Keluar</div>
                        <div className="font-semibold text-[1.1rem]">{todayAttendance.clockOut}</div>
                      </div>
                    </div>
                  )}
                </div>
             </div>
          )}
        </div>

        {/* Right Column - Action Form */}
        <div className="flex-[1_1_500px]">
          <div className="bg-card backdrop-blur-[12px] border border-border shadow-main rounded-lg p-8 h-full animate-fade-in [animation-delay:0.2s]">
            
            {!todayAttendance ? (
              // CLOCK IN FLOW
              <div>
                <h3 className="mb-5 text-[1.3rem] flex items-center gap-2.5">
                  <FiMapPin className="text-primary" /> Clock In WFH
                </h3>

                {error && <div className="text-danger text-[0.8rem] mb-4 p-2.5 bg-danger/10 rounded-sm">{error}</div>}

                <div className="mb-6">
                  <label className="block mb-4 text-[0.9rem] font-medium text-text-secondary">Foto Bukti WFH (Wajib)</label>
                  <PhotoCapture 
                    onPhotoTaken={(file) => {
                      setPhoto(file);
                      setPhotoConfirmed(!!file);
                    }} 
                  />
                </div>

                {photoConfirmed && (
                  <>
                    <div className="mb-5 animate-fade-in">
                      <label className="block mb-2 text-[0.9rem] font-medium text-text-secondary">Catatan Kegiatan (Opsional)</label>
                      <textarea
                        className="w-full py-3 px-4 bg-main border border-border rounded-md text-text-primary font-[inherit] text-[0.95rem] transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] placeholder:text-text-muted"
                        rows="3"
                        placeholder="Rencana kegiatan hari ini..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      ></textarea>
                    </div>

                    <button 
                      className="w-full py-4 bg-success text-white border-none rounded-md font-medium text-[1.05rem] transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] inline-flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(59,130,246,0.2)] hover:brightness-110 hover:-translate-y-px active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
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
              <div className="flex flex-col h-full justify-center items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <FiActivity size={40} />
                </div>
                <h3 className="text-[1.4rem] mb-2.5">Waktunya Selesai Bekerja?</h3>
                <p className="text-text-secondary mb-8 max-w-[300px]">
                  Pekerjaan hari ini sudah usai. Jangan lupa untuk clock-out ya.
                </p>

                {error && <div className="text-danger text-[0.8rem] mb-4">{error}</div>}

                <button 
                  className="py-4 px-10 bg-warning text-white border-none rounded-md font-medium text-[1.1rem] transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] inline-flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(59,130,246,0.2)] hover:brightness-110 hover:-translate-y-px active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleClockOut}
                  disabled={processing}
                >
                  {processing ? 'Memproses...' : 'Akhiri Hari Kerja (Clock Out)'}
                </button>
              </div>
            ) : (
                // DONE FOR TODAY
                <div className="flex flex-col h-full justify-center items-center text-center">
                <div className="w-20 h-20 rounded-full bg-success/10 text-success flex items-center justify-center mb-5">
                  <FiCheckCircle size={40} />
                </div>
                <h3 className="text-[1.4rem] mb-2.5">Terima Kasih!</h3>
                <p className="text-text-secondary max-w-[300px]">
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

export default DashboardPage;
