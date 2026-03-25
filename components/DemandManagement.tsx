
import React, { useState, useRef, useMemo } from 'react';
import { Demand, Status, Category } from '../types';
import { Search, Filter, Edit2, CheckCircle, Clock, AlertCircle, AlertTriangle, Upload, ArrowUpDown, Calendar, Eye, Mail, Plus, Trash2, FileDown, CheckSquare, Square, X, Paperclip } from 'lucide-react';
import { demandService } from '../services/demandService';
import html2canvas from 'html2canvas';
// Ensure jspdf is loaded via import map or script tag globally in index.html
import { jsPDF } from 'jspdf';
import DemandDetailPage from './DemandDetailPage';
import { createRoot } from 'react-dom/client';

interface DemandManagementProps {
  demands: Demand[];
  onUpdateStatus: (id: string, newStatus: Status) => void;
  onImportCsv: (content: string) => void;
  onViewDetail: (demand: Demand) => void;
  onSendEmail: (demand: Demand) => void;
  onEditDemand: (demand: Demand) => void;
  onCreateDemand: () => void;
}

const DemandManagement: React.FC<DemandManagementProps> = ({ demands, onUpdateStatus, onImportCsv, onViewDetail, onSendEmail, onEditDemand, onCreateDemand }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');
  
  // New Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [agencyFilter, setAgencyFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');

  const [sortConfig, setSortConfig] = useState<{ key: keyof Demand; direction: 'asc' | 'desc' } | null>({ key: 'dateOpened', direction: 'desc' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onImportCsv(text);
      };
      reader.readAsText(file);
    }
  };

  const requestSort = (key: keyof Demand) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Deep recursive search through object
  const searchInObject = (obj: any, term: string): boolean => {
    if (!obj) return false;
    if (typeof obj === 'string' || typeof obj === 'number') {
        return String(obj).toLowerCase().includes(term);
    }
    if (Array.isArray(obj)) {
        return obj.some(item => searchInObject(item, term));
    }
    if (typeof obj === 'object') {
        return Object.values(obj).some(val => searchInObject(val, term));
    }
    return false;
  };

  // Extract unique values for filters
  const uniqueCategories = useMemo(() => {
    const all = demands.flatMap(d => Array.isArray(d.category) ? d.category : [d.category]);
    return Array.from(new Set(all)).filter(Boolean).sort();
  }, [demands]);

  const uniqueNeighborhoods = useMemo(() => {
    return Array.from(new Set(demands.map(d => d.neighborhood || ''))).filter(Boolean).sort();
  }, [demands]);

  const uniqueRegions = useMemo(() => {
    return Array.from(new Set(demands.map(d => d.region || ''))).filter(Boolean).sort();
  }, [demands]);

  const uniqueAgencies = useMemo(() => {
    return Array.from(new Set(demands.map(d => d.assignedAgency || ''))).filter(Boolean).sort();
  }, [demands]);

  const uniqueYears = useMemo(() => {
    const years = demands.map(d => {
      if (!d.dateOpened) return null;
      // Robust extraction from YYYY-MM-DD or full ISO string
      const year = d.dateOpened.split('-')[0];
      return year && year.length === 4 ? year : new Date(d.dateOpened).getFullYear().toString();
    });
    return (Array.from(new Set(years)) as string[]).filter(y => y && y !== 'NaN').sort((a, b) => b.localeCompare(a));
  }, [demands]);

  const filteredDemands = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    
    let filtered = demands.filter(d => {
      // Deep search
      const matchesSearch = searchInObject(d, lowerSearch);
      
      // Filters
      const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
      const matchesNeighborhood = neighborhoodFilter === 'ALL' || d.neighborhood === neighborhoodFilter;
      const matchesRegion = regionFilter === 'ALL' || d.region === regionFilter;
      const matchesAgency = agencyFilter === 'ALL' || d.assignedAgency === agencyFilter;
      
      // Year Logic
      const dYear = d.dateOpened ? d.dateOpened.split('-')[0] : '';
      const matchesYear = yearFilter === 'ALL' || dYear === yearFilter;
      
      // Category Logic (Array contains)
      const dCats = Array.isArray(d.category) ? d.category : [d.category];
      const matchesCategory = categoryFilter === 'ALL' || dCats.includes(categoryFilter);

      return matchesSearch && matchesStatus && matchesNeighborhood && matchesRegion && matchesAgency && matchesCategory && matchesYear;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key]! < b[sortConfig.key]!) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key]! > b[sortConfig.key]!) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [demands, searchTerm, statusFilter, categoryFilter, neighborhoodFilter, regionFilter, agencyFilter, yearFilter, sortConfig]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredDemands.length) {
        setSelectedIds(new Set());
    } else {
        setSelectedIds(new Set(filteredDemands.map(d => d.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedIds(newSet);
  };

  const handleDeleteOne = async (id: string) => {
      if (!confirm("Tem certeza que deseja excluir esta demanda? Esta ação não pode ser desfeita.")) return;
      
      setIsProcessing(true);
      try {
          await demandService.delete(id);
          window.location.reload();
      } catch (error) {
          alert("Erro ao excluir demanda.");
          console.error(error);
      } finally {
          setIsProcessing(false);
      }
  };

  const handleDeleteSelected = async () => {
      if (selectedIds.size === 0) return;
      if (!confirm(`Tem certeza que deseja excluir ${selectedIds.size} demanda(s)? Esta ação não pode ser desfeita.`)) return;

      setIsProcessing(true);
      try {
          await demandService.batchDelete(Array.from(selectedIds));
          window.location.reload(); 
      } catch (error) {
          alert("Erro ao excluir demandas.");
          console.error(error);
      } finally {
          setIsProcessing(false);
          setSelectedIds(new Set());
      }
  };

  const handleExportPDF = async () => {
      if (selectedIds.size === 0) return;
      setIsProcessing(true);

      try {
          const pdf = new jsPDF({
              orientation: 'p',
              unit: 'mm',
              format: 'a4',
              compress: true
          });

          const itemsToExport = demands.filter(d => selectedIds.has(d.id));
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.top = '-9999px';
          container.style.width = '800px'; 
          document.body.appendChild(container);

          for (let i = 0; i < itemsToExport.length; i++) {
              const demand = itemsToExport[i];
              const root = createRoot(container);
              root.render(<DemandDetailPage demand={demand} onBack={() => {}} hiddenMode={true} />);
              await new Promise(resolve => setTimeout(resolve, 300));

              const canvas = await html2canvas(container, {
                  scale: 1.5,
                  useCORS: true,
                  logging: false
              });

              const imgData = canvas.toDataURL('image/jpeg', 0.8);
              const imgWidth = 210; 
              const pageHeight = 297; 
              const imgHeight = (canvas.height * imgWidth) / canvas.width;

              if (i > 0) pdf.addPage();
              pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
              root.unmount();
          }

          document.body.removeChild(container);
          pdf.save(`Demandas_HoteisRIO_${new Date().toLocaleDateString()}.pdf`);

      } catch (error) {
          console.error("PDF Gen Error", error);
          alert("Erro ao gerar PDF. Tente selecionar menos itens.");
      } finally {
          setIsProcessing(false);
      }
  };

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

  const isAllSelected = filteredDemands.length > 0 && selectedIds.size === filteredDemands.length;

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setNeighborhoodFilter('ALL');
    setRegionFilter('ALL');
    setAgencyFilter('ALL');
    setYearFilter('ALL');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || neighborhoodFilter !== 'ALL' || regionFilter !== 'ALL' || agencyFilter !== 'ALL' || yearFilter !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-20 z-20">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Gerenciamento de Demandas</h2>
              <p className="text-sm text-slate-500">Administre, importe e atualize o status das solicitações.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden" 
              />
              
              {selectedIds.size > 0 ? (
                 <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-200">
                     <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-lg">
                        {selectedIds.size} selecionados
                     </span>
                     <button 
                        onClick={handleExportPDF}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
                     >
                        <FileDown className="w-4 h-4" /> {isProcessing ? 'Gerando...' : 'Exportar PDF'}
                     </button>
                     <button 
                        onClick={handleDeleteSelected}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
                     >
                        <Trash2 className="w-4 h-4" /> Excluir
                     </button>
                 </div>
              ) : (
                <>
                  <button 
                     onClick={onCreateDemand}
                     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                     <Plus className="w-4 h-4" /> Nova Demanda
                  </button>
    
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" /> Importar CSV
                  </button>
                </>
              )}
    
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${showFilters || hasActiveFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Filter className="w-4 h-4" /> Filtros
              </button>
            </div>
        </div>

        {/* Filters Row */}
        {(showFilters || hasActiveFilters) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar por texto..." 
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <select 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as Status | 'ALL')}
                >
                    <option value="ALL">Status: Todos</option>
                    {Object.values(Status).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                </select>

                <select 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="ALL">Categoria: Todas</option>
                    {uniqueCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                </select>

                <select 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    value={neighborhoodFilter}
                    onChange={(e) => setNeighborhoodFilter(e.target.value)}
                >
                    <option value="ALL">Bairro: Todos</option>
                    {uniqueNeighborhoods.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                </select>

                <select 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                >
                    <option value="ALL">Região: Todas</option>
                    {uniqueRegions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                </select>

                <select 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    value={agencyFilter}
                    onChange={(e) => setAgencyFilter(e.target.value)}
                >
                    <option value="ALL">Órgão: Todos</option>
                    {uniqueAgencies.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                </select>

                <select 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                >
                    <option value="ALL">Ano: Todos</option>
                    {uniqueYears.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                </select>
                
                {hasActiveFilters && (
                    <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-6 flex justify-end">
                        <button 
                            onClick={clearFilters}
                            className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Limpar Filtros
                        </button>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 w-10 text-center">
                    <button onClick={toggleSelectAll} className="text-slate-500 hover:text-indigo-600">
                        {isAllSelected ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                    </button>
                </th>
                <th 
                  className="px-6 py-4 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors group"
                  onClick={() => requestSort('dateOpened')}
                >
                  <div className="flex items-center gap-1">
                    ID / Data
                    <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600">Local e Hotel</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Demanda</th>
                <th 
                  className="px-6 py-4 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors group"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status / Órgão
                    <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDemands.map((demand) => {
                const isSelected = selectedIds.has(demand.id);
                const categories = Array.isArray(demand.category) ? demand.category : [demand.category];
                return (
                <tr key={demand.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-indigo-50/50' : ''}`}>
                  <td className="px-4 py-4 text-center">
                      <button onClick={() => toggleSelectOne(demand.id)} className="text-slate-400 hover:text-indigo-600">
                        {isSelected ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                      </button>
                  </td>
                  <td 
                    className="px-6 py-4 cursor-pointer hover:text-indigo-600"
                    onClick={() => onViewDetail(demand)}
                  >
                    <div className="font-mono font-medium text-slate-800 group-hover:text-indigo-600 flex items-center gap-2">
                      {demand.id}
                      {demand.attachments && demand.attachments.length > 0 && (
                        <span title={`${demand.attachments.length} anexo(s)`}>
                          <Paperclip className="w-3 h-3 text-blue-500" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(demand.dateOpened).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{demand.hotelName}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                       {demand.neighborhood}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                     <div className="flex flex-wrap gap-1 mb-1">
                        {categories.slice(0, 2).map((cat, i) => (
                            <span key={i} className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600">
                                {cat}
                            </span>
                        ))}
                        {categories.length > 2 && <span className="text-[10px] text-slate-400">+{categories.length - 2}</span>}
                     </div>
                     <p className="text-slate-600 line-clamp-2" title={demand.description}>
                       {demand.description}
                     </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(demand.status)}
                      <span className="text-xs font-medium text-slate-500 pl-1">{demand.assignedAgency}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button
                          onClick={() => onEditDemand(demand)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Editar Demanda"
                       >
                         <Edit2 className="w-4 h-4" />
                       </button>

                       <button
                          onClick={() => onViewDetail(demand)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Ver Ficha Completa"
                       >
                         <Eye className="w-4 h-4" />
                       </button>

                       <button
                          onClick={() => onSendEmail(demand)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Enviar Status por E-mail"
                       >
                         <Mail className="w-4 h-4" />
                       </button>

                       {demand.status !== Status.RESOLVED && (
                         <button 
                            onClick={() => onUpdateStatus(demand.id, Status.RESOLVED)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Marcar como Atendido"
                         >
                           <CheckCircle className="w-4 h-4" />
                         </button>
                       )}

                       <button 
                          onClick={() => handleDeleteOne(demand.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir Demanda"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              )})}
              {filteredDemands.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nenhuma demanda encontrada com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
          <span>Mostrando {filteredDemands.length} de {demands.length} registros</span>
          {sortConfig && (
            <span className="hidden sm:inline-block">
               Ordenado por <span className="font-semibold">{sortConfig.key === 'dateOpened' ? 'Data' : sortConfig.key}</span> ({sortConfig.direction === 'asc' ? 'Crescente' : 'Decrescente'})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemandManagement;
