import React from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(11,15,25,0.75)] backdrop-blur-[4px] flex items-center justify-center z-[1000] p-5">
      <div 
        className="w-full max-w-[500px] max-h-[90vh] flex flex-col bg-card rounded-lg border border-border shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] animate-fade-in"
      >
        <div className="flex justify-between items-center px-6 py-5 border-b border-border">
          <h2 className="text-[1.25rem] font-semibold m-0">{title}</h2>
          <button 
            onClick={onClose}
            className="bg-none border-none text-text-secondary cursor-pointer flex items-center justify-center p-1 transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-danger hover:scale-110"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
