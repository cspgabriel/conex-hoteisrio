
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, FileSpreadsheet, Save, Database, Plus, Trash2 } from 'lucide-react';

interface CsvMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  headers: string[];
  onConfirm: (systemMapping: Record<string, string>, customMapping: Record<string, string>) => void;
}

// The internal keys used by the App
const APP_FIELDS: { key: string; label: string; required?: boolean }[] = [
  { key: 'id', label: 'ID da Ocorrência (OP)', required: true },
  { key: 'dateOpened', label: 'Data de Abertura', required: true },
  { key: 'hotelName', label: 'Nome do Hotel', required: true },
  { key: 'status', label: 'Status', required: true },
  { key: 'category', label: 'Categoria / Órgão', required: true },
  { key: 'description', label: 'Descrição da Demanda', required: true },
  { key: 'neighborhood', label: 'Bairro' },
  { key: 'region', label: 'Região' },
  { key: 'address', label: 'Endereço Completo' },
  { key: 'contactEmail', label: 'E-mail de Contato' },
  { key: 'assignedAgency', label: 'Agência/Órgão Responsável' },
  { key: 'coords', label: 'Coordenadas (formato Point)' },
];

const CsvMappingModal: React.FC<CsvMappingModalProps> = ({ isOpen, onClose, headers, onConfirm }) => {
  const [systemMapping, setSystemMapping] = useState<Record<string, string>>({});
  const [customMapping, setCustomMapping] = useState<Record<string, string>>({}); // { csvHeader: customFieldName }

  // Auto-map based on similar names
  useEffect(() => {
    if (isOpen && headers.length > 0) {
      const initialMap: Record<string, string> = {};
      APP_FIELDS.forEach(field => {
        const match = headers.find(h => 
          h.toLowerCase().includes(field.label.toLowerCase()) || 
          h.toLowerCase().includes(field.key.toLowerCase()) ||
          (field.key === 'id' && h.toLowerCase() === 'op') ||
          (field.key === 'hotelName' && h.toLowerCase().includes('hotel'))
        );
        if (match) {
          initialMap[field.key] = match;
        }
      });
      setSystemMapping(initialMap);
      setCustomMapping({});
    }
  }, [isOpen, headers]);

  if (!isOpen) return null;

  const handleSystemSelectChange = (fieldKey: string, header: string) => {
    setSystemMapping(prev => ({
      ...prev,
      [fieldKey]: header
    }));
    // Remove from custom mapping if selected as system
    if (customMapping[header]) {
        const newCustom = { ...customMapping };
        delete newCustom[header];
        setCustomMapping(newCustom);
    }
  };

  const handleToggleCustomField = (header: string) => {
    if (customMapping[header]) {
        const newCustom = { ...customMapping };
        delete newCustom[header];
        setCustomMapping(newCustom);
    } else {
        setCustomMapping(prev => ({
            ...prev,
            [header]: header // Default name is header name
        }));
    }
  };

  const handleCustomFieldNameChange = (header: string, newName: string) => {
    setCustomMapping(prev => ({
        ...prev,
        [header]: newName
    }));
  };

  const handleConfirm = () => {
    // Validate required
    const missing = APP_FIELDS.filter(f => f.required && !systemMapping[f.key]);
    if (missing.length > 0) {
        if (!confirm(`Alguns campos obrigatórios não foram mapeados (${missing.map(m => m.label).join(', ')}). Isso pode gerar registros incompletos. Deseja continuar?`)) {
            return;
        }
    }
    onConfirm(systemMapping, customMapping);
  };

  // Get headers that are NOT mapped to system fields
  const usedHeaders = Object.values(systemMapping);
  const availableHeaders = headers.filter(h => !usedHeaders.includes(h));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" /> Mapear Colunas do Import
            </h3>
            <p className="text-xs text-slate-500">Relacione as colunas do seu arquivo com o sistema ou crie novos campos.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800 flex items-start gap-3">
             <Database className="w-5 h-5 shrink-0 mt-0.5" />
             <div>
                <strong>Deduplicação Inteligente:</strong> Se o ID (OP) do arquivo já existir, os dados serão atualizados. Novos campos criados abaixo serão adicionados à ficha da demanda.
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: System Fields */}
              <div>
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
                      1. Campos do Sistema (Padrão)
                  </h4>
                  <div className="space-y-3">
                    {APP_FIELDS.map((field) => (
                    <div key={field.key} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex flex-col mb-2">
                            <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                {field.label}
                                {field.required && <span className="text-rose-500">*</span>}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Campo: {field.key}</span>
                        </div>
                        <select 
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${systemMapping[field.key] ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                            value={systemMapping[field.key] || ''}
                            onChange={(e) => handleSystemSelectChange(field.key, e.target.value)}
                        >
                            <option value="">-- Ignorar --</option>
                            {headers.map(h => (
                                <option key={h} value={h}>{h}</option>
                            ))}
                        </select>
                    </div>
                    ))}
                  </div>
              </div>

              {/* Right Column: Custom Fields */}
              <div>
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
                      2. Criar Novas Colunas (Personalizadas)
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                      Selecione colunas extras do seu CSV para importar como novos dados na ficha.
                  </p>
                  
                  <div className="space-y-2">
                      {availableHeaders.length === 0 && (
                          <div className="text-center py-8 text-slate-400 text-sm">
                              Todas as colunas do CSV já foram mapeadas para campos do sistema.
                          </div>
                      )}

                      {availableHeaders.map(header => {
                          const isSelected = !!customMapping[header];
                          return (
                              <div key={header} className={`p-3 rounded-lg border transition-all ${isSelected ? 'bg-white border-green-200 shadow-sm' : 'bg-slate-100 border-transparent opacity-70 hover:opacity-100'}`}>
                                  <div className="flex items-center gap-3">
                                      <input 
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleToggleCustomField(header)}
                                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500 cursor-pointer"
                                      />
                                      <div className="flex-1">
                                          <div className="text-xs font-mono text-slate-500 mb-1">Coluna CSV: {header}</div>
                                          {isSelected ? (
                                              <input 
                                                type="text" 
                                                value={customMapping[header]}
                                                onChange={(e) => handleCustomFieldNameChange(header, e.target.value)}
                                                className="w-full px-2 py-1 text-sm font-semibold text-green-800 border-b border-green-300 focus:outline-none focus:border-green-600 bg-transparent"
                                                placeholder="Nome do Campo no Sistema"
                                              />
                                          ) : (
                                              <span className="text-sm font-medium text-slate-600">{header}</span>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          )
                      })}
                  </div>
              </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end gap-3">
          <button 
             onClick={onClose}
             className="px-4 py-2 text-slate-600 font-medium text-sm hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button 
             onClick={handleConfirm}
             className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" /> Importar Dados
          </button>
        </div>

      </div>
    </div>
  );
};

export default CsvMappingModal;
