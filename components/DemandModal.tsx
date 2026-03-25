
import React from 'react';
import { X } from 'lucide-react';
import PublicDemandForm from './PublicDemandForm';

interface DemandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemandModal: React.FC<DemandModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Nova Solicitação Jurídica</h3>
            <p className="text-xs text-slate-500">Preencha os dados abaixo para registrar o pedido</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            title="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
            <PublicDemandForm isModal={true} onModalClose={onClose} />
        </div>
      </div>
    </div>
  );
};

export default DemandModal;
