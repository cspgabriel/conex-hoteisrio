import React from 'react';
import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

interface PublicSiteLayoutProps {
  children: React.ReactNode;
  contentClassName?: string;
}

const PublicSiteLayout: React.FC<PublicSiteLayoutProps> = ({ children, contentClassName = '' }) => (
  <div className="min-h-screen bg-[#f8fafd] text-[#333333] font-inter flex flex-col">
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
          <Link to="/hospedagem" className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-[#0a2e50] hover:text-[#c5a059] transition-colors">
            REGISTRO DA DEMANDA
          </Link>
          <Link to="/hospedagem" className="bg-[#0a2e50] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#c5a059] transition-all shadow-lg hover:-translate-y-0.5">
            Iniciar registro de demanda
          </Link>
        </div>
      </div>
    </nav>

    <main className={`flex-1 ${contentClassName}`.trim()}>{children}</main>

    <footer className="py-12 bg-[#051629] text-white/50 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <img
          src="https://sindhoteisrj.com.br/wp-content/uploads/2020/04/logo-hoteisrio-azul-fundo-transparente-178x171-1.png"
          alt="HotéisRIO"
          className="h-16 mx-auto mb-6 brightness-0 invert opacity-50"
        />
        <p className="text-sm mb-2">&copy; 2026 HotéisRIO — Sindicato Patronal dos Meios de Hospedagens da cidade do Rio de Janeiro.</p>
        <p className="text-xs uppercase tracking-widest font-bold text-white/30">Iniciativa CONEX HotéisRIO — Conexão B2B e Turismo</p>
      </div>
    </footer>
  </div>
);

export default PublicSiteLayout;
