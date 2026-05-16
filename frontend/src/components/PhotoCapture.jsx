import React, { useRef, useState } from 'react';
import { FiCamera, FiX, FiCheck } from 'react-icons/fi';

const PhotoCapture = ({ onPhotoTaken }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Tolong unggah file gambar (JPG/PNG).');
        return;
      }
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearPhoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onPhotoTaken(null);
  };

  const confirmPhoto = () => {
    onPhotoTaken(photoFile);
  };

  return (
    <div style={{ width: '100%' }}>
      <input
        type="file"
        accept="image/*"
        capture="environment" // Native mobile prompt
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {!previewUrl ? (
        <div 
          onClick={handleCaptureClick}
          style={{
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: 'var(--bg-surface)',
            transition: 'var(--transition)'
          }}
          className="capture-container"
        >
          <div style={{
            width: '60px', height: '60px', 
            backgroundColor: 'var(--primary-glow)',
            color: 'var(--primary-color)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px'
          }}>
            <FiCamera size={28} />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Ambil Foto Bukti Kehadiran</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Klik area ini untuk mengambil foto atau memilih gambar dari perangkat Anda.
          </p>
          
          <style>{`
            .capture-container:hover {
              border-color: var(--primary-color);
              background-color: var(--bg-hover);
            }
          `}</style>
        </div>
      ) : (
        <div style={{
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-card)'
        }}>
          <img 
            src={previewUrl} 
            alt="Preview" 
            style={{ width: '100%', height: 'auto', maxHeight: '350px', objectFit: 'cover' }}
          />
          <div style={{ padding: '16px', display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={clearPhoto} type="button">
              <FiX /> Retake
            </button>
            <button className="btn-primary" style={{ flex: 1, backgroundColor: 'var(--success-color)' }} onClick={confirmPhoto} type="button">
              <FiCheck /> Gunakan Foto Ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoCapture;
