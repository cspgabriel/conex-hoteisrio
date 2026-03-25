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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Consulta CONEX</h1>
          <p className="text-slate-600">Acompanhe o status do seu pedido de conexão institucional</p>
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
              placeholder="Digite seu E-mail cadastrado..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-32 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-lg"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-blue-500 transition-colors" />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Consultar'}
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400 text-center">
            Exemplo: seuemail@exemplo.com
          </p>
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
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </motion.div>
            ) : searched && results.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Nenhuma demanda encontrada</h3>
                <p className="text-slate-500">Verifique se o e-mail digitado está correto e cadastrado no sistema.</p>
              </motion.div>
            ) : (
              results.map((demand, index) => (
                <motion.div
                  key={demand.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Protocolo</span>
                          <h2 className="text-xl font-bold text-slate-900">{demand.id}</h2>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>Registrado em {new Date(demand.dateOpened).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${getStatusColor(demand.status)}`}>
                        {getStatusIcon(demand.status)}
                        {demand.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">Hotel</p>
                            <p className="text-slate-900 font-medium">{demand.hotelName}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">Localização</p>
                            <p className="text-slate-900 font-medium">{demand.neighborhood} - {demand.region}</p>
                            {demand.address && <p className="text-sm text-slate-500">{demand.address}</p>}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Info className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">Responsável Interno</p>
                            <p className="text-slate-900 font-medium">{demand.assignedAgency || 'Em análise'}</p>
                          </div>
                        </div>
                        {demand.contactEmail && (
                          <div className="flex gap-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Mail className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">E-mail de Contato</p>
                              <p className="text-slate-900 font-medium">{demand.contactEmail}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight mb-2">Descrição da Demanda</p>
                      <p className="text-slate-700 text-sm leading-relaxed">{demand.description}</p>
                    </div>

                    {demand.status !== Status.RESOLVED && (
                      <button
                        onClick={() => handleRequestUpdate(demand)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-xl font-semibold transition-all border border-blue-200"
                      >
                        <Send className="w-4 h-4" />
                        Enviar E-mail Solicitando Atualização
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <footer className="mt-auto pt-12 text-slate-400 text-sm text-center">
        <p>&copy; {new Date().getFullYear()} HotéisRIO. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default PublicConsultation;
