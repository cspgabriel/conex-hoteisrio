import React, { useEffect, useMemo, useState } from 'react';
import { demandService } from '../services/demandService';
import { Demand, Status } from '../types';
import { Link } from 'react-router-dom';

type Props = { year: number };

const YearSummary: React.FC<Props> = ({ year }) => {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const all = await demandService.getAll();
        if (!mounted) return;
        const filtered = all.filter(d => {
          const dt = new Date(d.dateOpened);
          return !isNaN(dt.getTime()) && dt.getFullYear() === year;
        });
        setDemands(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [year]);

  const stats = useMemo(() => {
    const total = demands.length;
    const resolved = demands.filter(d => d.status === Status.RESOLVED).length;
    const delayed = demands.filter(d => d.status === Status.DELAYED).length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const byRegion: Record<string, number> = {};
    demands.forEach(d => {
      const r = d.region || 'Sem Região';
      byRegion[r] = (byRegion[r] || 0) + 1;
    });

    const topRegions = Object.entries(byRegion).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { total, resolved, delayed, rate, topRegions };
  }, [demands]);

  if (loading) return <div className="p-6">Carregando resumo de {year}...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Resumo de Demandas — {year}</h2>
          <p className="text-sm text-blue-600 mt-1">Visão consolidada das demandas registradas no ano</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="text-sm text-blue-600 hover:underline">Voltar à Dashboard</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-blue-600">
          <div className="text-xs text-slate-500">Total de Demandas</div>
          <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-emerald-500">
          <div className="text-xs text-slate-500">Resolvidas</div>
          <div className="text-3xl font-bold text-emerald-600">{stats.resolved}</div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-rose-500">
          <div className="text-xs text-slate-500">Pendentes/Atrasadas</div>
          <div className="text-3xl font-bold text-rose-600">{stats.delayed}</div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-indigo-600">
          <div className="text-xs text-slate-500">Taxa de Resolução</div>
          <div className="text-3xl font-bold text-indigo-700">{stats.rate}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-bold mb-3">Top Regiões</h3>
          {stats.topRegions.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma região encontrada para o período.</p>
          ) : (
            <ul className="text-sm space-y-2">
              {stats.topRegions.map(([region, count]) => (
                <li key={region} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <span className="truncate max-w-[70%]">{region}</span>
                  <span className="font-mono text-sm text-slate-700">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-bold mb-3">Demandas Recentes ({demands.length})</h3>
          {demands.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma demanda encontrada.</p>
          ) : (
            <div className="overflow-auto" style={{ maxHeight: 420 }}>
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-slate-500 sticky top-0 bg-white">
                  <tr>
                    <th className="pb-2">Protocolo</th>
                    <th className="pb-2">Hotel</th>
                    <th className="pb-2">Região</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {demands.slice(0, 200).map(d => (
                    <tr key={d.id} className="border-t">
                      <td className="py-2 font-mono text-xs">{d.id}</td>
                      <td className="py-2">{d.hotelName || '—'}</td>
                      <td className="py-2">{d.region || d.neighborhood || '—'}</td>
                      <td className="py-2">{d.status}</td>
                      <td className="py-2">{d.dateOpened}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YearSummary;
