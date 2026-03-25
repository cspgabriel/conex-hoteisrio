
import React from 'react';
import { X, Check, Layout, Type, MapPin, Activity, FileText, ClipboardList, Database } from 'lucide-react';

export interface FieldConfig {
  hotelInfo: boolean;
  date: boolean;
  location: boolean;
  status: boolean;
  category: boolean;
  description: boolean;
  observations: boolean;
  extraInfo: boolean;
}

interface FieldVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: FieldConfig;
  onToggle: (key: keyof FieldConfig) => void;
}

const FieldVisibilityModal: React.FC<FieldVisibilityModalProps> = ({ isOpen, onClose, config, onToggle }) => {
  if (!isOpen) return null;

  const fields: { key: keyof FieldConfig; label: string; icon: React.ReactNode }[] = [
    { key: 'hotelInfo', label: 'Empresa / Hotel', icon: <Type className="w-4 h-4" /> },
    { key: 'date', label: 'Data de Abertura', icon: <Activity className="w-4 h-4" /> },
    { key: 'location', label: 'Localização Completa', icon: <MapPin className="w-4 h-4" /> },
    { key: 'status', label: 'Status e Órgão', icon: <Check className="w-4 h-4" /> },
    { key: 'category', label: 'Categoria', icon: <Layout className="w-4 h-4" /> },
    { key: 'description', label: 'Descrição Detalhada', icon: <FileText className="w-4 h-4" /> },
    { key: 'observations', label: 'Observações Adicionais (Destaque)', icon: <ClipboardList className="w-4 h-4" /> },
    { key: 'extraInfo', label: 'Outras Informações (Rodapé)', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <h3 className="text-lg font-bold text-slate-800">Personalizar Ficha</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-slate-50">
           <p className="text-sm text-slate-500 mb-4">Selecione quais campos devem aparecer na visualização e na exportação da imagem.</p>
           
           <div className="space-y-3">
             {fields.map((field) => (
               <div 
                key={field.key} 
                onClick={() => onToggle(field.key)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  config[field.key] 
                    ? 'bg-white border-blue-200 shadow-sm' 
                    : 'bg-slate-100 border-transparent opacity-60 hover:opacity-100'
                }`}
               >
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${config[field.key] ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                      {field.icon}
                    </div>
                    <span className={`text-sm font-medium ${config[field.key] ? 'text-slate-800' : 'text-slate-500'}`}>
                      {field.label}
                    </span>
                 </div>
                 
                 <div className={`w-10 h-6 rounded-full relative transition-colors ${config[field.key] ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${config[field.key] ? 'left-5' : 'left-1'}`}></div>
                 </div>
               </div>
             ))}
           </div>
        </div>

        <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end">
          <button 
             onClick={onClose}
             className="px-6 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors shadow-sm"
          >
            Concluir
          </button>
        </div>

      </div>
    </div>
  );
};

export default FieldVisibilityModal;
