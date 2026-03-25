
import React, { useRef, useState } from 'react';
import { X, Download, Building2, MapPin, Calendar, Activity, FileText, Tag } from 'lucide-react';
import { Demand, Status } from '../types';
import html2canvas from 'html2canvas';

interface DemandDetailModalProps {
  demand: Demand | null;
  isOpen: boolean;
  onClose: () => void;
}

const DemandDetailModal: React.FC<DemandDetailModalProps> = ({ demand, isOpen, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !demand) return null;

  const handleDownloadImage = async () => {
    if (cardRef.current) {
      setDownloading(true);
      try {
        const canvas = await html2canvas(cardRef.current, {
          scale: 2, // Higher resolution
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true // Important for internal/external resources
        });
        
        const link = document.createElement('a');
        link.download = `Ficha_${demand.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Erro ao gerar imagem', error);
      } finally {
        setDownloading(false);
      }
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.RESOLVED: return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case Status.IN_PROGRESS: return 'text-amber-700 bg-amber-50 border-amber-200';
      case Status.PARTIAL: return 'text-orange-700 bg-orange-50 border-orange-200';
      case Status.DELAYED: return 'text-rose-700 bg-rose-50 border-rose-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Actions Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" /> Ficha Técnica
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownloadImage}
              disabled={downloading}
              className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Gerando...' : 'Baixar Imagem'}
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
          <div ref={cardRef} className="bg-white p-8 rounded-none shadow-sm border border-slate-200 mx-auto max-w-xl">
            {/* Ficha Header */}
            <div className="border-b-2 border-slate-800 pb-6 mb-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {/* Text Logo */}
                <h1 className="text-2xl font-black text-blue-800 tracking-tight uppercase leading-tight">
                  HOTÉISRIO DEMANDAS PÚBLICAS
                </h1>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-blue-700">{demand.id}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Protocolo</div>
              </div>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
               
               {/* Row 1: Hotel Name */}
               <div className="col-span-2 sm:col-span-1">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Empresa / Hotel Solicitante</label>
                 <div className="flex items-start gap-2">
                   <Building2 className="w-4 h-4 text-blue-500 mt-1" />
                   <span className="text-slate-900 font-semibold">{demand.hotelName}</span>
                 </div>
               </div>

               {/* Row 1: Date */}
               <div className="col-span-2 sm:col-span-1">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Data de Abertura da OP</label>
                 <div className="flex items-start gap-2">
                   <Calendar className="w-4 h-4 text-blue-500 mt-1" />
                   <span className="text-slate-900 font-medium">{new Date(demand.dateOpened).toLocaleDateString('pt-BR')}</span>
                 </div>
               </div>

               {/* Row 2: Location (Col 1) */}
               <div className="col-span-2 sm:col-span-1">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1 text-center">Localização</label>
                 <div className="flex flex-col items-center justify-center bg-slate-50 p-3 rounded border border-slate-100 h-full text-center">
                   <MapPin className="w-5 h-5 text-blue-500 mb-1 shrink-0" />
                   <div>
                     <span className="text-slate-900 font-medium block leading-tight mb-0.5">{demand.neighborhood}</span>
                     <span className="text-xs text-slate-500 block mb-1">{demand.region}</span>
                     {demand.address && (
                       <span className="text-[10px] text-slate-400 block border-t border-slate-200 pt-1 mt-1 leading-tight">{demand.address}</span>
                     )}
                   </div>
                 </div>
               </div>

               {/* Row 2: Status (Col 2) */}
               <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1 text-center">Status Atual</label>
                  <div className="flex flex-col items-center justify-center bg-slate-50 p-3 rounded border border-slate-100 h-full">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm ${getStatusColor(demand.status)}`}>
                      {demand.status}
                    </span>
                  </div>
               </div>

               {/* Row 3: Category (Full Width) */}
               <div className="col-span-2">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 border-b border-slate-100 pb-1">Categoria da Demanda</label>
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center gap-3">
                    <Tag className="w-5 h-5 text-blue-500" />
                    <span className="text-slate-800 font-semibold">{demand.category}</span>
                 </div>
               </div>

               {/* Row 4: Description (Full Width) */}
               <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 border-b border-slate-100 pb-1">Descrição Detalhada</label>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap break-words text-justify">
                        {demand.description}
                      </p>
                  </div>
               </div>

            </div>

             {/* Footer */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
              <div className="text-[10px] text-slate-400">
                Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
              </div>
              <div className="flex items-center gap-1">
                 <div className="w-2 h-2 rounded-full bg-blue-700"></div>
                 <span className="text-xs font-bold text-slate-700">Sistema HotéisRIO</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandDetailModal;
