import React from 'react';
import { Demand, Status, Category } from '../types';
import { AlertTriangle, ShieldAlert, Activity, TrendingUp, Users } from 'lucide-react';

interface AdvancedStatsProps {
  demands: Demand[];
}

const AdvancedStats: React.FC<AdvancedStatsProps> = ({ demands }) => {
  
  // 1. Impacto na Experiência (Guest Experience Impact)
  // Counts descriptions mentioning guests, tourists, fear, etc.
  const impactKeywords = ['hóspede', 'turista', 'medo', 'susto', 'cliente', 'recepção'];
  const highImpactCount = demands.filter(d => 
    impactKeywords.some(k => d.description.toLowerCase().includes(k))
  ).length;

  // 2. Eficiência de Resolução (GovScore)
  const total = demands.length;
  const resolved = demands.filter(d => d.status === Status.RESOLVED).length;
  const efficiencyRate = total > 0 ? (resolved / total) * 100 : 0;
  
  let govGrade = 'F';
  if (efficiencyRate >= 90) govGrade = 'A';
  else if (efficiencyRate >= 75) govGrade = 'B';
  else if (efficiencyRate >= 60) govGrade = 'C';
  else if (efficiencyRate >= 40) govGrade = 'D';

  // 3. Gargalo Crítico (Agency with most OPEN tickets)
  const agencyOpenMap = demands
    .filter(d => d.status !== Status.RESOLVED)
    .reduce((acc, curr) => {
      acc[curr.assignedAgency] = (acc[curr.assignedAgency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  const bottleneckAgency = Object.entries(agencyOpenMap)
    .sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0]; // [AgencyName, Count]

  // 4. Hotspot de Segurança (Neighborhood with most SECURITY tickets)
  const securityMap = demands
    .filter(d => {
      const categories = Array.isArray(d.category) ? d.category : [d.category];
      return categories.includes(Category.SECURITY);
    })
    .reduce((acc, curr) => {
      const nb = curr.neighborhood || 'Desconhecido';
      acc[nb] = (acc[nb] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  const securityHotspot = Object.entries(securityMap)
    .sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0];

  // 5. Prevenção de Crises (High Severity Keywords)
  const crisisKeywords = ['armada', 'tiro', 'agressão', 'faca', 'arrastão', 'refém'];
  const crisisCount = demands.filter(d => 
    crisisKeywords.some(k => d.description.toLowerCase().includes(k))
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {/* Card 1: Guest Impact */}
      <div className="bg-white rounded-xl p-5 border-l-4 border-indigo-500 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Impacto no Hóspede</h4>
          <Users className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-slate-800">{highImpactCount}</span>
          <span className="text-xs text-slate-400 mb-1">ocorrências</span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Relatos citando diretamente hóspedes ou turistas.
        </p>
      </div>

      {/* Card 2: GovScore */}
      <div className="bg-white rounded-xl p-5 border-l-4 border-emerald-500 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Score Gov</h4>
          <Activity className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-slate-800">{govGrade}</span>
          <span className={`text-xs mb-1 font-medium ${efficiencyRate > 50 ? 'text-emerald-600' : 'text-rose-600'}`}>
            ({Math.round(efficiencyRate)}% Resolução)
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Eficiência global dos órgãos públicos.
        </p>
      </div>

      {/* Card 3: Bottleneck */}
      <div className="bg-white rounded-xl p-5 border-l-4 border-amber-500 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gargalo Operacional</h4>
          <TrendingUp className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-slate-800 truncate" title={bottleneckAgency?.[0] || 'Nenhum'}>
            {bottleneckAgency?.[0] || 'N/A'}
          </span>
          <span className="text-xs text-amber-700 font-medium">
            {bottleneckAgency?.[1] || 0} pendências
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Órgão com maior volume em aberto.
        </p>
      </div>

      {/* Card 4: Security Hotspot */}
      <div className="bg-white rounded-xl p-5 border-l-4 border-rose-500 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hotspot Crítico</h4>
          <ShieldAlert className="w-4 h-4 text-rose-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-slate-800 truncate" title={securityHotspot?.[0] || 'Nenhum'}>
            {securityHotspot?.[0] || 'N/A'}
          </span>
          <span className="text-xs text-rose-700 font-medium">
            {securityHotspot?.[1] || 0} alertas de segurança
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Bairro com maior índice de criminalidade reportada.
        </p>
      </div>

      {/* Card 5: Crisis Prevention */}
      <div className="bg-slate-800 rounded-xl p-5 border-l-4 border-slate-400 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Risco Crítico</h4>
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-white">{crisisCount}</span>
          <span className="text-xs text-slate-300 mb-1">gravíssimos</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Eventos com armas ou violência explícita.
        </p>
      </div>
    </div>
  );
};

export default AdvancedStats;
