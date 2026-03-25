import React from 'react';
import { Demand, Category } from '../types';
import { Map } from 'lucide-react';

interface RegionAnalysisProps {
  demands: Demand[];
}

const RegionAnalysis: React.FC<RegionAnalysisProps> = ({ demands }) => {
  
  // Group by Region -> Count Categories
  const regionData = demands.reduce((acc, curr) => {
    const region = curr.region || 'Outra';
    if (!acc[region]) {
      acc[region] = {};
    }
    const categories = Array.isArray(curr.category) ? curr.category : [curr.category];
    categories.forEach((category) => {
      const key = String(category || 'Nao informado');
      acc[region][key] = (acc[region][key] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const regions = Object.keys(regionData).sort();

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case Category.SECURITY: return 'bg-rose-100 text-rose-700';
      case Category.HOMELESSNESS: return 'bg-orange-100 text-orange-700';
      case Category.CLEANING: return 'bg-emerald-100 text-emerald-700';
      case Category.INFRASTRUCTURE: return 'bg-blue-100 text-blue-700';
      case Category.TRANSPORT: return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Map className="w-5 h-5 text-indigo-600" />
          Top 3 Ofensores por Região
        </h3>
        <p className="text-sm text-slate-500 mt-1">Principais categorias de demanda agrupadas por zona hoteleira.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:gap-px bg-slate-100">
        {regions.map((region) => {
          const categories = Object.entries(regionData[region])
            .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
            .slice(0, 3); // Take Top 3

          return (
            <div key={region} className="bg-white p-6 hover:bg-slate-50 transition-colors">
              <h4 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">
                {region}
              </h4>
              <div className="space-y-3">
                {categories.map(([cat, count], idx) => (
                  <div key={cat} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-4">#{idx + 1}</span>
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${getCategoryColor(cat)}`}>
                        {cat}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{count}</span>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-xs text-slate-400 italic">Sem dados suficientes.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RegionAnalysis;
