import React from 'react';
import { Sparkles, Lightbulb, Target, AlertTriangle } from 'lucide-react';
import { AIAnalysisResult } from '../types';

interface InsightsPanelProps {
  insights: AIAnalysisResult | null;
  isLoading: boolean;
  onGenerate: () => void;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights, isLoading, onGenerate }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold">Inteligência Artificial HotéisRIO</h2>
          </div>
          <button 
            onClick={onGenerate}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isLoading 
                ? 'bg-white/10 cursor-not-allowed text-white/50' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {isLoading ? 'Analisando dados...' : 'Atualizar Insights'}
          </button>
        </div>

        {!insights && !isLoading && (
           <div className="text-center py-8 text-indigo-200">
             <p>Clique em atualizar para gerar insights sobre as demandas.</p>
           </div>
        )}

        {insights && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-indigo-100 text-sm leading-relaxed">
                {insights.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3" /> Pontos de Atenção
                </h3>
                <ul className="space-y-2">
                  {(insights.keyInsights || []).map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0"></span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                  <Target className="w-3 h-3" /> Recomendações
                </h3>
                <ul className="space-y-2">
                  {(insights.recommendations || []).map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsPanel;