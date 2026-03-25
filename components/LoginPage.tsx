import React, { useState } from 'react';
import { Lock, LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginPageProps {
  onLogin: (password: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'sind2026') {
      onLogin(password);
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <img 
              src="https://sindhoteisrj.com.br/wp-content/uploads/2020/04/logo-hoteisrio-azul-fundo-transparente-178x171-1.png" 
              alt="HotéisRIO" 
              className="h-20 mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-slate-900">Acesso Restrito</h1>
            <p className="text-slate-500 mt-2">Área de gestão e inteligência</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Senha de Acesso</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha..."
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${error ? 'border-red-500 ring-red-50' : 'border-slate-200 focus:ring-blue-50 focus:border-blue-500'} rounded-xl transition-all outline-none`}
                  autoFocus
                />
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${error ? 'text-red-400' : 'text-slate-400'}`} />
              </div>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-500 flex items-center gap-1.5"
                >
                  <AlertCircle className="w-4 h-4" />
                  Senha incorreta. Tente novamente.
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
            >
              <LogIn className="w-5 h-5" />
              Entrar no Sistema
            </button>
          </form>
        </div>
        
        <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Acesso exclusivo para administradores e parceiros autorizados.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
