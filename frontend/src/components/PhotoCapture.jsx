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
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {!previewUrl ? (
        <div 
          onClick={handleCaptureClick}
          className="border-2 border-dashed border-border rounded-lg px-5 py-10 text-center cursor-pointer bg-surface transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-primary hover:bg-hover"
        >
          <div className="w-[60px] h-[60px] bg-primary-glow text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCamera size={28} />
          </div>
          <h3 className="text-[1.1rem] mb-2">Ambil Foto Bukti Kehadiran</h3>
          <p className="text-text-secondary text-[0.9rem]">
            Klik area ini untuk mengambil foto atau memilih gambar dari perangkat Anda.
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-auto max-h-[350px] object-cover"
          />
          <div className="p-4 flex gap-2.5">
            <button className="flex-1 bg-surface text-text-primary border border-border px-6 py-2.5 rounded-md font-medium transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-hover hover:border-text-muted inline-flex items-center justify-center gap-2" onClick={clearPhoto} type="button">
              <FiX /> Retake
            </button>
            <button className="flex-1 bg-success text-white border-none px-6 py-2.5 rounded-md font-medium transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] inline-flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(59,130,246,0.2)] hover:brightness-110 hover:-translate-y-px" onClick={confirmPhoto} type="button">
              <FiCheck /> Gunakan Foto Ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoCapture;
