import React, { useEffect, useState } from 'react';
import { X, Save, Building2, FileText, Calendar, Mail, Hash, ArrowLeft, User, Briefcase, Phone, UserCheck, Tag } from 'lucide-react';
import { Demand, Status } from '../types';
import CATEGORIES from '../services/categories';

interface EditDemandModalProps {
  demand: Demand | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedDemand: Demand) => void;
  isCreating: boolean;
  onNotifyStatus?: (demand: Demand) => void;
  isPage?: boolean;
}

const EditDemandModal: React.FC<EditDemandModalProps> = ({ demand, isOpen, onClose, onSave, isCreating, onNotifyStatus, isPage = false }) => {
  const [formData, setFormData] = useState<Demand | null>(null);
  const [statusChanged, setStatusChanged] = useState(false);

  useEffect(() => {
    if (!demand) return;
    setFormData({
      ...demand,
      category: Array.isArray(demand.category) ? demand.category : [demand.category],
      customFields: {
        'Responsavel pelo Preenchimento': demand.customFields?.['Responsavel pelo Preenchimento'] || '',
        Cargo: demand.customFields?.Cargo || '',
        WhatsApp: demand.customFields?.WhatsApp || '',
        'Nome da Referencia': demand.customFields?.['Nome da Referencia'] || '',
      },
    });
    setStatusChanged(false);
  }, [demand]);

  if ((!isOpen && !isPage) || !formData) return null;

  const handleChange = (field: keyof Demand, value: any) => {
    if (field === 'status' && formData.status !== value) setStatusChanged(true);
    setFormData((prev) => prev ? { ...prev, [field]: value } : null);
  };

  const handleCustomFieldChange = (key: string, value: string) => {
    setFormData((prev) => prev ? { ...prev, customFields: { ...prev.customFields, [key]: value } } : null);
  };

  const handleCategoryToggle = (category: string) => {
    const current = Array.isArray(formData.category) ? formData.category : [formData.category];
    if (current.includes(category)) handleChange('category', current.filter((item) => item !== category));
    else handleChange('category', [...current, category]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className={isPage ? 'w-full' : 'fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6'}>
      {!isPage && <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>}

      <div className={`relative bg-white rounded-xl shadow-2xl w-full ${isPage ? 'max-w-3xl mx-auto' : 'max-w-3xl max-h-[90vh]'} flex flex-col overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
          <div className="flex items-center gap-3">
            {isPage && (
              <button type="button" onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors" title="Voltar">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="text-lg font-bold text-slate-800">{isCreating ? 'Nova solicitacao' : 'Editar solicitacao'}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { onSave(formData); onClose(); }} className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" /> Salvar
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={`flex-1 overflow-y-auto p-6 space-y-6 ${isPage ? 'max-h-[calc(100vh-180px)]' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2"><Hash className="w-4 h-4 text-slate-400" /> Protocolo</label>
              <input type="text" required readOnly={!isCreating} className={`w-full px-3 py-2 border rounded-lg text-sm font-mono font-bold ${!isCreating ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-300 focus:ring-2 focus:ring-indigo-500'}`} value={formData.id} onChange={(e) => handleChange('id', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> Adicionado em</label>
              <input type="date" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" value={formData.dateOpened} onChange={(e) => handleChange('dateOpened', e.target.value)} />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-400" /> Nome do hotel</label>
              <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" value={formData.hotelName} onChange={(e) => handleChange('hotelName', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /> Responsavel pelo preenchimento</label>
              <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" value={formData.customFields?.['Responsavel pelo Preenchimento'] || ''} onChange={(e) => handleCustomFieldChange('Responsavel pelo Preenchimento', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2"><Briefcase className="w-4 h-4 text-slate-400" /> Cargo</label>
              <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" value={formData.customFields?.Cargo || ''} onChange={(e) => handleCustomFieldChange('Cargo', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> Email</label>
              <input type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" value={formData.contactEmail || ''} onChange={(e) => handleChange('contactEmail', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> WhatsApp</label>
              <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" value={formData.customFields?.WhatsApp || ''} onChange={(e) => handleCustomFieldChange('WhatsApp', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2"><UserCheck className="w-4 h-4 text-slate-400" /> Responsavel pela tarefa</label>
              <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" value={formData.assignedAgency} onChange={(e) => handleChange('assignedAgency', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2"><Tag className="w-4 h-4 text-slate-400" /> Nome da referencia</label>
              <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" value={formData.customFields?.['Nome da Referencia'] || ''} onChange={(e) => handleCustomFieldChange('Nome da Referencia', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
              <div className="flex gap-2">
                <select className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white" value={formData.status} onChange={(e) => handleChange('status', e.target.value)}>
                  {Object.values(Status).map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                {statusChanged && onNotifyStatus && (
                  <button type="button" onClick={() => onNotifyStatus(formData)} className="px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold">
                    Notificar
                  </button>
                )}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Tag className="w-4 h-4 text-slate-400" /> Categoria de demanda</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => {
                  const selected = (formData.category as string[]).includes(category);
                  return (
                    <button key={category} type="button" onClick={() => handleCategoryToggle(category)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${selected ? 'bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" /> Breve descricao da solicitacao</label>
              <textarea rows={7} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
            </div>

            {/* Attachments View */}
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Anexos ({formData.attachments.length})</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {formData.attachments.map((attachment, idx) => {
                    // Handle both old format (string) and new format (object)
                    const url = typeof attachment === 'string' ? attachment : attachment.url;
                    const name = typeof attachment === 'string' ? `Anexo ${idx + 1}` : attachment.name;
                    const isImage = url.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i) || url.includes('data:image');
                    
                    return (
                      <div key={idx} className="relative group aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                        {isImage ? (
                          <img 
                            src={url} 
                            alt={name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        {typeof attachment !== 'string' && attachment.url && (
                          <a 
                            href={attachment.url} 
                            download={attachment.name}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold"
                          >
                            Baixar
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Fields (Integrated Look) */}
            <div className="col-span-2">
                 <div className="flex items-center justify-between mb-3 border-t border-slate-100 pt-4">
                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Outros Campos</h4>
                 </div>

                 <div className="space-y-4">
                    {Object.entries(formData.customFields || {}).map(([key, value]) => (
                        <div key={key} className="bg-white rounded-lg border border-slate-200 p-3 group hover:border-indigo-200 transition-colors">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2 w-full">
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{key}</span>
                                </div>
                            </div>
                            <textarea
                                rows={2}
                                className="w-full text-sm text-slate-800 bg-transparent border-none focus:ring-0 p-0 resize-y min-h-[40px]"
                                value={value as string}
                                onChange={(e) => handleCustomFieldChange(key, e.target.value)}
                                placeholder="Digite o conteúdo aqui..."
                            />
                        </div>
                    ))}
                 </div>


            </div>


          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium text-sm hover:text-slate-800 transition-colors">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm">
              <Save className="w-4 h-4" /> {isCreating ? 'Criar solicitacao' : 'Salvar alteracoes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDemandModal;
