
import React from 'react';
import { X, Calendar, MapPin, CheckCircle, Clock, AlertCircle, AlertTriangle } from 'lucide-react';
import { Demand, Status } from '../types';

interface FilteredDemandListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  demands: Demand[];
}

const FilteredDemandListModal: React.FC<FilteredDemandListModalProps> = ({ isOpen, onClose, title, demands }) => {
  if (!isOpen) return null;

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case Status.RESOLVED: 
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3"/> Atendido</span>;
      case Status.IN_PROGRESS: 
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit"><Clock className="w-3 h-3"/> Em Andamento</span>;
      case Status.PARTIAL:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3"/> Parcialmente Atendido</span>;
      case Status.DELAYED: 
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3"/> Pendente</span>;
      default: 
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 w-fit">Não Iniciado</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500">Visualizando {demands.length} registros</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">ID</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Hotel / Local</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Categoria</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {demands.map((demand) => (
                  <tr key={demand.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono font-medium text-blue-700">{demand.id}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(demand.dateOpened).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{demand.hotelName}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                         <MapPin className="w-3 h-3" /> {demand.neighborhood}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                       <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600 mb-1">
                         {demand.category}
                       </span>
                       <p className="text-xs text-slate-500 line-clamp-1" title={demand.description}>
                         {demand.description}
                       </p>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(demand.status)}
                    </td>
                  </tr>
                ))}
                {demands.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilteredDemandListModal;
