import React, { useMemo, useState } from 'react';
import { Copy, Check, ArrowLeft } from 'lucide-react';
import { Demand, Status } from '../types';

interface ReleasePageProps {
  demands: Demand[];
  periodLabel: string;
  onBack: () => void;
}

const ReleasePage: React.FC<ReleasePageProps> = ({ demands, periodLabel, onBack }) => {
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const total = demands.length;
    const resolved = demands.filter(d => d.status === Status.RESOLVED).length;
    const delayed = demands.filter(d => d.status === Status.DELAYED).length;
    const open = demands.filter(d => d.status === Status.OPEN).length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const regionMap: Record<string, number> = {};
    const categoryMap: Record<string, number> = {};

    demands.forEach(d => {
      const region = d.region || 'Outros';
      regionMap[region] = (regionMap[region] || 0) + 1;

      (d.category || []).forEach(cat => {
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });
    });

    const topRegions = Object.entries(regionMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const topCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

    return { total, resolved, delayed, open, rate, topRegions, topCategories };
  }, [demands]);

  const releaseText = useMemo(() => {
    const regionText = stats.topRegions.length > 0
      ? stats.topRegions.map(([name, count]) => `${name} (${count})`).join(', ')
      : 'sem concentração regional relevante';

    const categoryText = stats.topCategories.length > 0
      ? stats.topCategories.map(([name, count]) => `${name} (${count})`).join(', ')
      : 'sem categoria predominante';

    return `RELEASE - ${periodLabel}\n\n` +
      `No período ${periodLabel}, o sistema registrou ${stats.total} demandas de ordem pública. ` +
      `Desse total, ${stats.resolved} foram resolvidas (${stats.rate}% de taxa de resolução), ` +
      `${stats.open} permanecem em aberto e ${stats.delayed} estão pendentes/atrasadas.\n\n` +
      `As regiões com maior volume foram: ${regionText}.\n` +
      `As categorias mais recorrentes foram: ${categoryText}.\n\n` +
      `A plataforma segue com monitoramento contínuo e atuação conjunta com os órgãos responsáveis.`;
  }, [periodLabel, stats]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Página de RELEASE</h2>
              <p className="text-xs text-slate-500">Período: {periodLabel}</p>
            </div>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(releaseText);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            }}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${copied ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado' : 'Copiar RELEASE'}
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
              <p className="text-xs text-emerald-700">Resolvidas</p>
              <p className="text-xl font-bold text-emerald-700">{stats.resolved}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
              <p className="text-xs text-amber-700">Abertas</p>
              <p className="text-xl font-bold text-amber-700">{stats.open}</p>
            </div>
            <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
              <p className="text-xs text-rose-700">Pendentes</p>
              <p className="text-xl font-bold text-rose-700">{stats.delayed}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
              <p className="text-xs text-indigo-700">Taxa</p>
              <p className="text-xl font-bold text-indigo-700">{stats.rate}%</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-700 mb-2">Texto do RELEASE</p>
            <textarea
              readOnly
              value={releaseText}
              className="w-full h-72 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm leading-relaxed resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReleasePage;
