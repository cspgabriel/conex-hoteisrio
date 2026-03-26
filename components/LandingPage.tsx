import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Globe, Users, CheckCircle, ArrowRight, Menu, LogIn } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafd] text-[#333333] font-inter">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-xl border-b border-white/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#0a2e50] rounded-xl flex items-center justify-center">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <div className="font-outfit font-bold text-xl text-[#0a2e50]">
              CONEX <span className="text-[#c5a059]">HotéisRIO</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href="/marketing/index-pipeline-conex-hoteisrio.html" target="_blank" className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-[#0a2e50] hover:text-[#c5a059] transition-colors">
              Planejamento
            </a>
            <Link to="/gestao" className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#0a2e50] transition-colors">
              <LogIn className="w-3 h-3" /> Acesso Restrito
            </Link>
            <Link to="/enviar" className="bg-[#0a2e50] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#c5a059] transition-all shadow-lg hover:-translate-y-0.5">
              Enviar Demanda
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 overflow-hidden bg-[#0a2e50]">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-outfit text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Sua Conexão Direta com a <br />
            <span className="text-[#c5a059]">Hotelaria Carioca</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto"
          >
            O braço institucional que conecta o mercado corporativo, consulados e organizadores de eventos diretamente aos tomadores de decisão da hotelaria no Rio de Janeiro.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <Link to="/hospedagem" className="bg-[#c5a059] text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-[#0a2e50] transition-all shadow-2xl flex items-center justify-center gap-2 group">
              Ver hotéis disponíveis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-outfit text-3xl md:text-4xl font-bold text-[#0a2e50] mb-4">Elimine Filtros e Agilize sua Resposta</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Um serviço institucional gratuito para impulsionar o Rio de Janeiro como destino de negócios e eventos.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BenefitCard 
              icon={<Globe className="w-8 h-8" />}
              title="Contato Direto"
              description="Sua demanda é encaminhada estrategicamente para o Diretor Comercial ou Gerente Geral do hotel."
            />
            <BenefitCard 
              icon={<CheckCircle className="w-8 h-8" />}
              title="Selo Institucional"
              description="O HotéisRIO assegura confiança e procedência em todas as solicitações trafegadas no CONEX."
            />
            <BenefitCard 
              icon={<Users className="w-8 h-8" />}
              title="Público B2B"
              description="Focado em Consulados, Centros de Eventos e Empresas com demandas acima de 10 UHs."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-outfit text-3xl md:text-4xl font-bold text-[#0a2e50] mb-6">Centralize sua Demanda de Grupos agora.</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Preencha o formulário institucional. Nossa equipe encaminhará sua solicitação para os hotéis associados em tempo recorde, sem cobrança de taxas ou comissões.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-[#0a2e50] font-bold">
                <CheckCircle className="w-5 h-5 text-[#c5a059]" /> Sem cobrança de taxas
              </li>
              <li className="flex items-center gap-3 text-[#0a2e50] font-bold">
                <CheckCircle className="w-5 h-5 text-[#c5a059]" /> Sem comissões
              </li>
              <li className="flex items-center gap-3 text-[#0a2e50] font-bold">
                <CheckCircle className="w-5 h-5 text-[#c5a059]" /> Atendimento Direto HotéisRIO
              </li>
            </ul>
            <div className="mt-10">
               <Link to="/enviar" className="inline-flex items-center gap-3 bg-[#0a2e50] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#c5a059] transition-all shadow-xl">
                  Iniciar Registro de Demanda <ArrowRight className="w-5 h-5" />
               </Link>
            </div>
          </div>
          <div className="bg-[#f8fafd] p-8 rounded-[40px] border-4 border-white shadow-2xl">
             <div className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">01</div>
                   <div>
                      <h4 className="font-bold text-[#0a2e50]">Preencha os Dados</h4>
                      <p className="text-sm text-slate-500">Informe os detalhes da sua necessidade.</p>
                   </div>
                </div>
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">02</div>
                   <div>
                      <h4 className="font-bold text-[#0a2e50]">Equipe CONEX Valida</h4>
                      <p className="text-sm text-slate-500">Fazemos o roteamento para os hotéis associados.</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">03</div>
                   <div>
                      <h4 className="font-bold text-[#0a2e50]">Resposta Direta</h4>
                      <p className="text-sm text-slate-500">O Gerente Geral entra em contato direto com você.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#051629] text-white/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <img 
            src="https://sindhoteisrj.com.br/wp-content/uploads/2020/04/logo-hoteisrio-azul-fundo-transparente-178x171-1.png" 
            alt="HotéisRIO" 
            className="h-16 mx-auto mb-6 brightness-0 invert opacity-50"
          />
          <p className="text-sm mb-2">&copy; 2026 HotéisRIO — Sindicato dos Meios de Hospedagem do Município do Rio de Janeiro.</p>
          <p className="text-xs uppercase tracking-widest font-bold text-white/30">Iniciativa CONEX HotéisRIO — Conexão B2B e Turismo</p>
        </div>
      </footer>
    </div>
  );
};

const BenefitCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#c5a059] transition-all hover:-translate-y-2 group">
    <div className="w-16 h-16 bg-[#f8fafd] rounded-2xl flex items-center justify-center text-[#c5a059] mb-6 group-hover:bg-[#c5a059] group-hover:text-white transition-all">
      {icon}
    </div>
    <h3 className="font-outfit text-xl font-bold text-[#0a2e50] mb-3">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
  </div>
);

import { motion } from 'motion/react';

export default LandingPage;
