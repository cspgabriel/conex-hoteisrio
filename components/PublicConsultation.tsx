import React, { useState, useEffect } from 'react';
import { Search, FileText, Mail, Calendar, MapPin, Clock, CheckCircle2, AlertCircle, Info, ArrowLeft, Send } from 'lucide-react';
import { demandService } from '../services/demandService';
import { Demand, Status } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

const PublicConsultation: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Consulta de Solicitação - CONEX HotéisRIO";
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      const allDemands = await demandService.getAll();
      const filtered = allDemands.filter(d => 
        d.contactEmail && d.contactEmail.toLowerCase() === query.toLowerCase().trim()
      );
      setResults(filtered);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Ocorreu um erro ao buscar as demandas. Por favor, tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestUpdate = (demand: Demand) => {
    const recipients = [
      'theresa.jansen@hoteisrio.com.br',
      'marketing@hoteisrio.com.br',
      'cristiana@hoteisrio.com.br'
    ].join(',');
    
    const subject = encodeURIComponent(`${demand.id} + ${demand.hotelName} - Status da Demanda`);
    const body = encodeURIComponent(
      `Olá equipe HotéisRIO,\n\nGostaria de solicitar uma atualização sobre o status da demanda ${demand.id} (${demand.hotelName}).\n\nAtualmente o status consta como: ${demand.status}.\n\nFico no aguardo de novidades ou feedback sobre o andamento.\n\nAtenciosamente,\n[Seu Nome]`
    );
    
    window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`;
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.RESOLVED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case Status.IN_PROGRESS: return 'bg-blue-100 text-blue-700 border-blue-200';
      case Status.DELAYED: return 'bg-amber-100 text-amber-700 border-amber-200';
      case Status.PARTIAL: return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case Status.RESOLVED: return <CheckCircle2 className="w-4 h-4" />;
      case Status.IN_PROGRESS: return <Clock className="w-4 h-4" />;
      case Status.DELAYED: return <AlertCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-12 relative">
          <Link to="/" className="absolute left-0 top-0 p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Voltar ao Painel">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <img 
            src="https://sindhoteisrj.com.br/wp-content/uploads/2020/04/logo-hoteisrio-azul-fundo-transparente-178x171-1.png" 
            alt="HotéisRIO" 
            className="h-24 mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-[#0a2e50] mb-2 uppercase tracking-tight">Consulta CONEX</h1>
          <p className="text-slate-600 font-medium">Acompanhe o status do seu pedido de conexão institucional</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSearch} className="mb-12">
          <div className="relative group">
            <input
              type="email"
              placeholder="Digite seu E-mail corporativo cadastrado..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-32 py-5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-[#0a2e50] transition-all outline-none text-lg placeholder:text-slate-300"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-[#0a2e50] transition-colors" />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#0a2e50] hover:bg-[#c5a059] text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg"
            >
              {loading ? '...' : 'Consultar'}
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-12"
              >
                <div className="w-10 h-10 border-4 border-[#0a2e50] border-t-transparent rounded-full animate-spin"></div>
              </motion.div>
            ) : searched && results.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-12 rounded-[32px] border border-slate-100 text-center shadow-sm"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhuma demanda encontrada</h3>
                <p className="text-slate-500 text-sm">Verifique se o e-mail digitado está correto e cadastrado no sistema CONEX.</p>
              </motion.div>
            ) : (
              results.map((demand, index) => (
                <motion.div
                  key={demand.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all border-b-4 border-b-[#c5a059]"
                >
                  <div className="p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Protocolo Institucional</span>
                        </div>
                        <h2 className="text-3xl font-black text-[#0a2e50] tracking-tight">{demand.id}</h2>
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">
                          <Calendar className="w-3 h-3" />
                          <span>Aberto em {new Date(demand.dateOpened).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-widest shadow-sm ${getStatusColor(demand.status)}`}>
                        {getStatusIcon(demand.status)}
                        {demand.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-6">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-[#f8fafd] rounded-2xl flex items-center justify-center flex-shrink-0 text-[#c5a059] border border-white shadow-sm">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Empresa / Hotel</p>
                            <p className="text-[#0a2e50] font-black text-lg leading-tight">{demand.hotelName}</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-[#f8fafd] rounded-2xl flex items-center justify-center flex-shrink-0 text-[#c5a059] border border-white shadow-sm">
                            <MapPin className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Origem / Destino</p>
                            <p className="text-[#0a2e50] font-black">{demand.neighborhood} <span className="text-slate-300 mx-1">/</span> {demand.region}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-[#f8fafd] rounded-2xl flex items-center justify-center flex-shrink-0 text-[#c5a059] border border-white shadow-sm">
                            <Info className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Setor Responsável</p>
                            <p className="text-[#0a2e50] font-black">{demand.assignedAgency || 'CONEX Institucional'}</p>
                          </div>
                        </div>
                        {demand.contactEmail && (
                          <div className="flex gap-4">
                            <div className="w-12 h-12 bg-[#f8fafd] rounded-2xl flex items-center justify-center flex-shrink-0 text-[#c5a059] border border-white shadow-sm">
                              <Mail className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">E-mail Cadastrado</p>
                              <p className="text-[#0a2e50] font-black">{demand.contactEmail}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#f8fafd] rounded-[24px] p-6 border border-slate-100 mb-8">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Detalhamento da Solicitação</p>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">{demand.description}</p>
                    </div>

                    {demand.status !== Status.RESOLVED && (
                      <button
                        onClick={() => handleRequestUpdate(demand)}
                        className="w-full flex items-center justify-center gap-3 bg-[#0a2e50] hover:bg-[#c5a059] text-white py-4 rounded-2xl font-bold transition-all shadow-lg group"
                      >
                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        Solicitar Atualização Estratégica
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <footer className="mt-auto pt-20 pb-12 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] text-center">
        <p>&copy; {new Date().getFullYear()} HotéisRIO — Iniciativa CONEX HotéisRIO</p>
      </footer>
    </div>
  );
};


export default PublicConsultation;
