import React, { useState, useEffect, useMemo } from 'react';
import { 
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link
} from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  PlusCircle,
  ListFilter,
  CalendarDays,
  Filter,
  LogOut,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { Demand, Status } from './types';
import CATEGORIES from './services/categories';
import { parseCSV, getCsvHeaders, parseMappedCSV } from './services/mockData';
import { getLegalSeedDemands, LEGAL_SEED_VERSION } from './services/legalSeed';
import { demandService } from './services/demandService';
import StatCard from './components/StatCard';
import ChartsSection from './components/ChartsSection';
import DemandManagement from './components/DemandManagement';
import DemandDetailPage from './components/DemandDetailPage';
import EmailModal from './components/EmailModal';
import EditDemandModal from './components/EditDemandModal';
import FilteredDemandListModal from './components/FilteredDemandListModal';
import CsvMappingModal from './components/CsvMappingModal';
import PublicConsultation from './components/PublicConsultation';
import PublicDemandOrderForm from './components/PublicDemandOrderForm';
import HospedagemGruposForm from './components/HospedagemGruposForm';
import LoginPage from './components/LoginPage';
import YearSummary from './components/YearSummary';
import EmailMarketingPage from './components/EmailMarketingPage';
import ReleasePage from './components/ReleasePage';
import LandingPage from './components/LandingPage';

const Dashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'management' | 'detail' | 'edit' | 'release'>('dashboard');
  const [previousView, setPreviousView] = useState<'dashboard' | 'management'>('dashboard'); // To return correctly
  const [editReturnView, setEditReturnView] = useState<'dashboard' | 'management'>('management');
  
  // Dashboard Filters
  const [monthFilter, setMonthFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  
  // States for selected demand (Page or Modal)
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  
  const [emailDemand, setEmailDemand] = useState<Demand | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Edit Modal State
  const [editDemand, setEditDemand] = useState<Demand | null>(null);
  const [isCreatingDemand, setIsCreatingDemand] = useState(false);

  // CSV Import State
  const [csvFileContent, setCsvFileContent] = useState<string | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);

  // Filtered List Modal State
  const [listModalConfig, setListModalConfig] = useState<{ isOpen: boolean; title: string; filterFn: (d: Demand) => boolean }>({
    isOpen: false,
    title: '',
    filterFn: () => true
  });

  const [copied, setCopied] = useState(false);

  // Use environment variable for public URL if available, otherwise use current origin
  const PUBLIC_CONSULTATION_URL = (import.meta.env.VITE_PUBLIC_URL || window.location.origin).replace(/\/$/, '') + '/consultar';
  const PUBLIC_SUBMISSION_URL = (import.meta.env.VITE_PUBLIC_URL || window.location.origin).replace(/\/$/, '') + '/hospedagem';

  // URL Logo restored
  const LOGO_URL = "https://sindhoteisrj.com.br/wp-content/uploads/2020/04/logo-hoteisrio-azul-fundo-transparente-178x171-1.png";

  // Initial Load
  useEffect(() => {
    document.title = "CONEX HotéisRIO - Gestão";
    const loadData = async () => {
      try {
        // We skip seed sync for CONEX since the categories/data are different
        // await demandService.syncSeedDemands(LEGAL_SEED_VERSION, legalSeedDemands);
        const data = await demandService.getAll();

        setDemands(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load demands:", error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Calculate available years from data
  const availableYears = useMemo(() => {
    const years = new Set<number>(demands.map(d => {
      // Handle various date formats if necessary, assuming ISO YYYY-MM-DD
      const date = new Date(d.dateOpened);
      return isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
    }));
    return Array.from(years).sort((a: number, b: number) => b - a);
  }, [demands]);

  // Filtered Data for Dashboard
  const dashboardDemands = useMemo(() => {
    return demands.filter(d => {
      const date = new Date(d.dateOpened);
      if (isNaN(date.getTime())) return false;

      const matchesYear = yearFilter === 'ALL' || date.getFullYear().toString() === yearFilter;
      // getMonth is 0-indexed (0 = Jan, 11 = Dec), so we add 1
      const matchesMonth = monthFilter === 'ALL' || (date.getMonth() + 1).toString() === monthFilter;

      return matchesYear && matchesMonth;
    });
  }, [demands, yearFilter, monthFilter]);

  const handleUpdateStatus = async (id: string, newStatus: Status) => {
    const demandToUpdate = demands.find(d => d.id === id);
    if (demandToUpdate) {
      const updatedDemand = { ...demandToUpdate, status: newStatus };
      
      // Optimistic Update
      setDemands(prev => prev.map(d => d.id === id ? updatedDemand : d));
      
      // DB Update
      try {
        await demandService.update(updatedDemand);
      } catch (e) {
        console.error("Failed to update status in DB", e);
      }
    }
  };

  const handleEditDemand = (demand: Demand) => {
    setEditReturnView(currentView === 'dashboard' ? 'dashboard' : 'management');
    setEditDemand(demand);
    setIsCreatingDemand(false);
    setCurrentView('edit');
  };

  const handleCreateDemand = () => {
    // Calculate next ID
    let maxId = 0;
    demands.forEach(d => {
        // Extract number from "CX-123"
        const cleanId = d.id.replace(/[^0-9]/g, '');
        const num = parseInt(cleanId, 10);
        if (!isNaN(num) && num > maxId) maxId = num;
    });
    const nextId = `CX-${maxId + 1}`;

    const newDemand: Demand = {
        id: nextId,
        hotelName: '',
        region: '',
        neighborhood: '',
        category: [CATEGORIES[0]],
        description: '',
        status: Status.OPEN,
        dateOpened: new Date().toISOString().split('T')[0],
        assignedAgency: '',
        address: '',
        contactEmail: ''
    };
    setEditReturnView(currentView === 'dashboard' ? 'dashboard' : 'management');
    setEditDemand(newDemand);
    setIsCreatingDemand(true);
    setCurrentView('edit');
  };

  const handleSaveDemand = async (updatedDemand: Demand) => {
    if (isCreatingDemand) {
        // Check for duplicates if user manually changed the ID to an existing one
        if (demands.some(d => d.id === updatedDemand.id)) {
            alert(`A demanda com número "${updatedDemand.id}" já existe. Por favor, utilize outro número.`);
            return;
        }

        try {
            const savedDemand = await demandService.add(updatedDemand);
            setDemands(prev => [savedDemand, ...prev]);
        } catch (e) {
            console.error("Failed to create demand", e);
            alert("Erro ao criar demanda. Tente novamente.");
        }
    } else {
        // Optimistic Update for Existing
        setDemands(prev => prev.map(d => d.id === updatedDemand.id ? updatedDemand : d));
        // DB Update
        try {
          await demandService.update(updatedDemand);
        } catch (e) {
          console.error("Failed to save demand to DB", e);
        }
    }
    setCurrentView(editReturnView);
    setEditDemand(null);
  };

  // Step 1: Initiate Import - Open Mapping Modal
  const handleInitiateImport = (fileContent: string) => {
    setCsvFileContent(fileContent);
    const headers = getCsvHeaders(fileContent);
    setCsvHeaders(headers);
    setIsMappingModalOpen(true);
  };

  // Step 2: Confirm Mapping and Import
  const handleConfirmImport = async (systemMapping: Record<string, string>, customMapping: Record<string, string>) => {
    if (!csvFileContent) return;
    
    setIsMappingModalOpen(false);
    setLoading(true);

    try {
      // Parse using user mapping (both system and custom)
      const newDemands = parseMappedCSV(csvFileContent, systemMapping, customMapping);
      
      if (newDemands.length > 0) {
        // Save to DB (batchAdd now handles Merge/Deduplication)
        await demandService.batchAdd(newDemands);
        
        // Refresh from DB to get updated state
        const refreshedData = await demandService.getAll();
        setDemands(refreshedData);
        
        alert(`${newDemands.length} registros processados com sucesso! Registros existentes foram atualizados e colunas novas adicionadas.`);
      } else {
        alert("Nenhum dado válido encontrado para importar.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao processar a importação. Verifique o arquivo.");
    } finally {
      setLoading(false);
      setCsvFileContent(null);
    }
  };

  const openDemandDetailPage = (demand: Demand) => {
    setSelectedDemand(demand);
    if (currentView === 'dashboard' || currentView === 'management') {
        setPreviousView(currentView);
    }
    setCurrentView('detail');
  };

  const closeDemandDetailPage = () => {
    setSelectedDemand(null);
    setCurrentView(previousView);
  };

  const openEmailModal = (demand: Demand) => {
    setEmailDemand(demand);
    setIsEmailModalOpen(true);
  }

  // Derived State (Stats) based on FILTERED dashboardDemands
  const stats = useMemo(() => {
    const total = dashboardDemands.length;
    const resolved = dashboardDemands.filter(d => d.status === Status.RESOLVED).length;
    const delayed = dashboardDemands.filter(d => d.status === Status.DELAYED).length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    
    return { total, resolved, delayed, rate };
  }, [dashboardDemands]);

  // Categoria com maior % de resolução (entre demandas filtradas)
  const topCategory = useMemo(() => {
    const map: Record<string, { total: number; resolved: number }> = {};
    dashboardDemands.forEach(d => {
      (d.category || []).forEach(cat => {
        if (!map[cat]) map[cat] = { total: 0, resolved: 0 };
        map[cat].total += 1;
        if (d.status === Status.RESOLVED) map[cat].resolved += 1;
      });
    });

    const entries = Object.entries(map).map(([name, v]) => ({
      name,
      total: v.total,
      resolved: v.resolved,
      rate: v.total > 0 ? Math.round((v.resolved / v.total) * 100) : 0
    }));

    entries.sort((a, b) => b.rate - a.rate || b.total - a.total);

    return entries.length > 0 ? entries[0] : { name: '', total: 0, resolved: 0, rate: 0 };
  }, [dashboardDemands]);

  const openListModalCategory = (categoryName: string) => {
    setListModalConfig({
      isOpen: true,
      title: `Demandas - Categoria: ${categoryName}`,
      filterFn: (d) => (d.category || []).includes(categoryName)
    });
  };
  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  const selectedPeriodLabel = useMemo(() => {
    const yearText = yearFilter === 'ALL' ? 'todos os anos' : yearFilter;
    if (monthFilter === 'ALL') return `de ${yearText}`;
    const monthLabel = months.find(m => m.value === monthFilter)?.label || 'Mês selecionado';
    return `${monthLabel} de ${yearText}`;
  }, [monthFilter, yearFilter]);

  // Logic to open list modal on stat click
  const openListModal = (type: 'TOTAL' | 'RESOLVED' | 'DELAYED' | 'OPEN') => {
    let title = '';
    let filterFn = (d: Demand) => true;

    switch(type) {
      case 'TOTAL':
        title = 'Todas as Demandas (Período Selecionado)';
        filterFn = () => true;
        break;
      case 'RESOLVED':
        title = 'Demandas Resolvidas';
        filterFn = (d) => d.status === Status.RESOLVED;
        break;
      case 'DELAYED':
        title = 'Demandas Pendentes/Atrasadas';
        filterFn = (d) => d.status === Status.DELAYED;
        break;
      case 'OPEN':
        title = 'Novas Solicitações (Abertas)';
        filterFn = (d) => d.status === Status.OPEN;
        break;
    }

    setListModalConfig({ isOpen: true, title, filterFn });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Carregando inteligência de dados...</p>
        </div>
      </div>
    );
  }

  // View: Demand Detail Page
  if (currentView === 'detail' && selectedDemand) {
    return (
        <DemandDetailPage 
            demand={selectedDemand} 
            onBack={closeDemandDetailPage} 
        />
    );
  }

  // View: Demand Edit Page
  if (currentView === 'edit' && editDemand) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setCurrentView(editReturnView);
                  setEditDemand(null);
                }}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                title="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img 
                src={LOGO_URL}
                alt="HotéisRIO Logo" 
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-none tracking-tight">Portal <span className="text-[#0a2e50]">CONEX</span> HotéisRIO</h1>
                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Sistema de Conexão Estratégica</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EditDemandModal
            demand={editDemand}
            isOpen={true}
            isPage={true}
            onClose={() => {
              setCurrentView(editReturnView);
              setEditDemand(null);
            }}
            onSave={handleSaveDemand}
            isCreating={isCreatingDemand}
            onNotifyStatus={(demand) => {
              setEmailDemand(demand);
              setIsEmailModalOpen(true);
            }}
          />
        </main>

        <EmailModal
          demand={emailDemand}
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
        />
      </div>
    );
  }

  if (currentView === 'release') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={LOGO_URL}
                alt="HotéisRIO Logo" 
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-none tracking-tight">RELEASE de <span className="text-blue-700">Demandas</span></h1>
                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Sistema de Gestão</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ReleasePage
            demands={dashboardDemands}
            periodLabel={selectedPeriodLabel}
            onBack={() => setCurrentView('dashboard')}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <img 
                src={LOGO_URL}
                alt="HotéisRIO Logo" 
                className="h-12 w-auto object-contain"
             />
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none tracking-tight">CONEX <span className="text-[#0a2e50]">HotéisRIO</span></h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Conexão B2B e Turismo</p>
            </div>
          </div>
          
            <div className="flex items-center gap-4">
             {/* View Toggles */}
             <div className="bg-slate-100 p-1 rounded-lg flex items-center">
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'dashboard' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
                <button 
                  onClick={() => setCurrentView('management')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'management' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <ListFilter className="w-4 h-4" />
                  <span className="hidden sm:inline">Gestão</span>
                </button>
             </div>
            <p className="text-slate-500 text-sm">
              Visão geral da performance de conexões institucionais e solicitações de mercado.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreateDemand}
              className="px-4 py-2.5 bg-[#0a2e50] text-white rounded-xl shadow-lg hover:bg-[#0077c2] transition-all flex items-center gap-2 font-semibold text-sm"
            >
              <Plus className="w-4 h-4" /> Nova Demanda Interna
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {currentView === 'dashboard' ? (
          <>
            {/* Public Links Shortcut */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Consultation Link */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-blue-900">Link de Consulta</h3>
                    <p className="text-xs text-blue-700">Envie este link para que os hotéis acompanhem suas solicitações.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a 
                    href={PUBLIC_CONSULTATION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white px-3 py-2 rounded-lg border border-blue-200 text-xs text-blue-800 font-mono flex-1 sm:flex-none truncate max-w-[150px] hover:bg-blue-50 transition-colors"
                  >
                    {PUBLIC_CONSULTATION_URL}
                  </a>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(PUBLIC_CONSULTATION_URL);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className={`p-2 rounded-lg transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submission Link */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-indigo-900">Link de Cadastro</h3>
                    <p className="text-xs text-indigo-700">Envie este link para stakeholders cadastrarem novas demandas de conexão.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a 
                    href={PUBLIC_SUBMISSION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white px-3 py-2 rounded-lg border border-indigo-200 text-xs text-indigo-800 font-mono flex-1 sm:flex-none truncate max-w-[150px] hover:bg-indigo-50 transition-colors"
                  >
                    {PUBLIC_SUBMISSION_URL}
                  </a>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(PUBLIC_SUBMISSION_URL);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className={`p-2 rounded-lg transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
               <div className="flex items-center gap-2 text-slate-500">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filtrar período:</span>
               </div>
               <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-40">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm cursor-pointer"
                    >
                      <option value="ALL">Todos os Meses</option>
                      {months.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="relative w-full sm:w-32">
                    <select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="w-full pl-4 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm cursor-pointer"
                    >
                      <option value="ALL">Todos Anos</option>
                      {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setCurrentView('release')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Gerar RELEASE
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard 
                title="Solicitações Recebidas" 
                value={stats.total} 
                icon={<LayoutDashboard className="w-5 h-5" />} 
                trend="Base atual do CSV"
                trendUp={true}
                onClick={() => openListModal('TOTAL')}
              />
              <StatCard 
                title="Total Resolvidas" 
                value={stats.resolved} 
                icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} 
                trend="Todas importadas como resolvidas"
                trendUp={true}
                onClick={() => openListModal('RESOLVED')}
              />
              <StatCard 
                title="Categoria com Mais Casos" 
                value={topCategory.name || '—'} 
                icon={<Check className="w-5 h-5 text-blue-600" />} 
                trend={topCategory.total ? `${topCategory.total} recebidas` : 'Sem dados'}
                trendUp={true}
                onClick={() => topCategory.name && openListModalCategory(topCategory.name)}
              />
              <StatCard 
                title="Pendentes" 
                value={dashboardDemands.filter(d => d.status !== Status.RESOLVED).length} 
                icon={<Clock className="w-5 h-5 text-blue-600" />} 
                trend="Esperado: 0"
                trendUp={true}
                onClick={() => openListModal('OPEN')}
              />
            </div>

            <ChartsSection demands={dashboardDemands} />

            <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl p-8 shadow-xl text-white text-center relative overflow-hidden border border-blue-800">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2"></div>
              <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-3 tracking-tight">Nova Solicitação</h2>
                <p className="text-blue-100 mb-8 max-w-2xl leading-relaxed text-sm">
                  O sistema gerencia solicitações de hospedagem, eventos e visitas técnicas facilitando a ponte direta entre stakeholders e os hotéis associados.
                </p>
                <button 
                  onClick={() => window.open('/hospedagem', '_blank')}
                  className="w-full max-w-xs bg-white text-blue-800 px-6 py-4 rounded-lg font-bold shadow-lg transition-all transform hover:scale-105 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer border border-blue-100 hover:bg-blue-50"
                >
                  <PlusCircle className="w-5 h-5" />
                  Abrir Solicitação
                </button>
              </div>
            </div>
          </>
        ) : (
          <DemandManagement 
            demands={demands} 
            onUpdateStatus={handleUpdateStatus} 
            onImportCsv={handleInitiateImport} 
            onViewDetail={openDemandDetailPage} // Changed to open page
            onSendEmail={openEmailModal}
            onEditDemand={handleEditDemand}
            onCreateDemand={handleCreateDemand}
          />
        )}
      </main>

      {/* Modals */}

      <EmailModal
        demand={emailDemand}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />

      <FilteredDemandListModal
        isOpen={listModalConfig.isOpen}
        onClose={() => setListModalConfig(prev => ({ ...prev, isOpen: false }))}
        title={listModalConfig.title}
        demands={dashboardDemands.filter(listModalConfig.filterFn)}
      />

      <CsvMappingModal
        isOpen={isMappingModalOpen}
        onClose={() => setIsMappingModalOpen(false)}
        headers={csvHeaders}
        onConfirm={handleConfirmImport}
      />

    </div>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('conex_auth') === 'true');

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('conex_auth', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('conex_auth');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/consultar" element={<PublicConsultation />} />
        <Route path="/hospedagem" element={<HospedagemGruposForm />} />
        <Route path="/hospedagem/sucesso" element={<HospedagemGruposForm />} />
        <Route path="/ordem-publica" element={<PublicDemandOrderForm />} />
        
        <Route 
          path="/gestao" 
          element={isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />} 
        />
        
        {/* Support for old URL params or legacy links */}
        <Route path="/summary/2026" element={<YearSummary year={2026} />} />
        <Route path="/summary/2025" element={<YearSummary year={2025} />} />
        <Route path="/email-marketing" element={<EmailMarketingPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
