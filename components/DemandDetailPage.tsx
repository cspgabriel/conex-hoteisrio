import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, Building2, Calendar, FileText, Tag, Settings, User, Briefcase, Mail, Phone, UserCheck, ClipboardList } from 'lucide-react';
import { Demand, Status } from '../types';
import html2canvas from 'html2canvas';
import FieldVisibilityModal, { FieldConfig } from './FieldVisibilityModal';

interface DemandDetailPageProps {
  demand: Demand;
  onBack: () => void;
  hiddenMode?: boolean;
}

const DEFAULT_CONFIG: FieldConfig = {
  hotelInfo: true,
  date: true,
  location: false,
  status: true,
  category: true,
  description: true,
  observations: true,
  extraInfo: true,
};

const getCustomField = (demand: Demand, key: string) => demand.customFields?.[key] || '';

const DemandDetailPage: React.FC<DemandDetailPageProps> = ({ demand, onBack, hiddenMode = false }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [fieldConfig, setFieldConfig] = useState<FieldConfig>(() => {
    const saved = localStorage.getItem('demand_print_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const LOGO_URL = 'https://sindhoteisrj.com.br/wp-content/uploads/2020/04/logo-hoteisrio-azul-fundo-transparente-178x171-1.png';

  useEffect(() => {
    localStorage.setItem('demand_print_config', JSON.stringify(fieldConfig));
  }, [fieldConfig]);

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.RESOLVED: return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case Status.IN_PROGRESS: return 'text-amber-700 bg-amber-50 border-amber-200';
      case Status.PARTIAL: return 'text-orange-700 bg-orange-50 border-orange-200';
      case Status.DELAYED: return 'text-rose-700 bg-rose-50 border-rose-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `Ficha_${demand.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const responsibleName = getCustomField(demand, 'Responsavel pelo Preenchimento');
  const responsibleRole = getCustomField(demand, 'Cargo');
  const whatsapp = getCustomField(demand, 'WhatsApp');
  const referenceName = getCustomField(demand, 'Nome da Referencia');
  const subjects = Array.isArray(demand.category) ? demand.category : [demand.category];
  const extraCustomFields = Object.entries(demand.customFields || {}).filter(([key]) => !['Responsavel pelo Preenchimento', 'Cargo', 'WhatsApp', 'Nome da Referencia'].includes(key));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {!hiddenMode && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors" title="Voltar">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <img src={LOGO_URL} alt="HotéisRIO" className="h-12 w-auto object-contain" />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsConfigOpen(true)} className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors" title="Configurar campos">
                <Settings className="w-5 h-5" />
              </button>
              <button onClick={handleDownloadImage} disabled={downloading} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70">
                <Download className="w-4 h-4" />
                {downloading ? 'Gerando...' : 'Baixar ficha'}
              </button>
            </div>
          </div>
        </header>
      )}

      <main className={`flex-1 overflow-y-auto ${hiddenMode ? 'p-0' : 'p-4 sm:p-8'}`}>
        <div className={`${hiddenMode ? 'w-[800px]' : 'max-w-4xl mx-auto'}`}>
          <div ref={cardRef} className={`bg-white p-10 rounded-xl shadow-lg border border-slate-200 ${hiddenMode ? 'rounded-none shadow-none border-0' : ''}`}>
            <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black text-blue-800 tracking-tight uppercase leading-tight">
                  HOTÉISRIO <br /> <span className="text-xl text-slate-600 font-bold">Assessoria Jurídica</span>
                </h1>
              </div>
              <div className="text-right">
                <div className="text-3xl font-mono font-bold text-blue-700">{demand.id}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Protocolo</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              {fieldConfig.hotelInfo && (
                <>
                  <div className="col-span-2 sm:col-span-1 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Nome do hotel</label>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-slate-900 font-bold text-lg">{demand.hotelName}</div>
                        <div className="text-sm text-slate-500">{demand.contactEmail || 'Email não informado'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Responsável pelo preenchimento</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-800"><User className="w-4 h-4 text-blue-500" /> {responsibleName || 'Não informado'}</div>
                      <div className="flex items-center gap-2 text-slate-600"><Briefcase className="w-4 h-4 text-blue-500" /> {responsibleRole || 'Cargo não informado'}</div>
                      <div className="flex items-center gap-2 text-slate-600"><Phone className="w-4 h-4 text-blue-500" /> {whatsapp || 'WhatsApp não informado'}</div>
                    </div>
                  </div>
                </>
              )}

              {fieldConfig.date && (
                <div className="col-span-2 sm:col-span-1 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Adicionado em</label>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span className="text-slate-900 font-bold text-lg">{new Date(demand.dateOpened).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              )}

              {/* Attachments Section */}
              {demand.attachments && demand.attachments.length > 0 && (
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Anexos / Fotos ({demand.attachments.length})</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {demand.attachments.map((attachment, idx) => {
                      // Handle both old format (string) and new format (object)
                      const url = typeof attachment === 'string' ? attachment : attachment.url;
                      const name = typeof attachment === 'string' ? `Anexo ${idx + 1}` : attachment.name;
                      const isImage = url.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i) || url.includes('data:image');
                      
                      return (
                        <div key={idx} className="group relative bg-slate-100 rounded-lg overflow-hidden border border-slate-200 aspect-square flex items-center justify-center">
                          {isImage ? (
                            <img 
                              src={url} 
                              alt={name} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2 p-4 text-center">
                              <FileText className="w-8 h-8 text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase truncate w-full">{name}</span>
                            </div>
                          )}
                          {typeof attachment !== 'string' && attachment.url && (
                            <a 
                              href={attachment.url} 
                              download={attachment.name}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
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

              {fieldConfig.status && (
                <div className="col-span-2 sm:col-span-1 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Status e responsável pela tarefa</label>
                  <div className="mb-3">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm ${getStatusColor(demand.status)}`}>{demand.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700"><UserCheck className="w-4 h-4 text-blue-500" /> {demand.assignedAgency || 'Não informado'}</div>
                </div>
              )}

              {fieldConfig.category && (
                <div className="col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Categoria da demanda</label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Tag className="w-5 h-5 text-blue-500 shrink-0" />
                    {subjects.map((subject, index) => (
                      <span key={`${subject}-${index}`} className="bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-800 font-bold text-sm shadow-sm">{subject}</span>
                    ))}
                  </div>
                </div>
              )}

              {fieldConfig.description && (
                <div className="col-span-2 bg-slate-50 p-6 rounded-lg border border-slate-100 min-h-[220px]">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Breve descrição da solicitação</label>
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-slate-400 mt-1 shrink-0" />
                    <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap break-words text-justify">{demand.description}</p>
                  </div>
                </div>
              )}

              {fieldConfig.observations && (
                <>
                  <div className="col-span-2 sm:col-span-1 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Email</label>
                    <div className="flex items-center gap-2 text-slate-700"><Mail className="w-4 h-4 text-blue-500" /> {demand.contactEmail || 'Não informado'}</div>
                  </div>
                  <div className="col-span-2 sm:col-span-1 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Nome da referência</label>
                    <div className="flex items-center gap-2 text-slate-700"><ClipboardList className="w-4 h-4 text-blue-500" /> {referenceName || 'Não informado'}</div>
                  </div>
                </>
              )}

              {fieldConfig.extraInfo && extraCustomFields.map(([key, value]) => (
                <div key={key} className="col-span-2 sm:col-span-1 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">{key}</label>
                  <p className="text-slate-800 whitespace-pre-wrap break-words">{String(value || '')}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-6 border-t-2 border-slate-100 flex justify-between items-end">
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Gerado digitalmente</div>
                <div className="text-xs text-slate-500 font-medium">{new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                <span className="text-sm font-bold text-slate-700">Assessoria Jurídica HotéisRIO</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {!hiddenMode && (
        <FieldVisibilityModal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          config={fieldConfig}
          onToggle={(key) => setFieldConfig((prev) => ({ ...prev, [key]: !prev[key] }))}
        />
      )}
    </div>
  );
};

export default DemandDetailPage;
