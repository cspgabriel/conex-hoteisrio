import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Demand } from '../types';

interface ChartsSectionProps {
  demands: Demand[];
}

const COLORS = ['#2563eb', '#0f766e', '#ea580c', '#9333ea', '#dc2626', '#0891b2'];

const ChartsSection: React.FC<ChartsSectionProps> = ({ demands }) => {
  const categoryData = Object.values(demands.reduce((acc, demand) => {
    const categories = Array.isArray(demand.category) ? demand.category : [demand.category];
    categories.forEach((category) => {
      const key = String(category || 'Nao informado');
      if (!acc[key]) acc[key] = { name: key, value: 0 };
      acc[key].value += 1;
    });
    return acc;
  }, {} as Record<string, { name: string; value: number }>)).sort((a, b) => b.value - a.value);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Categorias de Demanda</h3>
        <div className="h-80 w-full">
          <div className="w-full h-full flex flex-col lg:flex-row items-stretch gap-4">
            <div className="flex-1 min-w-0 h-full flex items-center justify-center p-2">
              <div className="mx-auto" style={{ width: 240, height: 240 }}>
                <PieChart width={240} height={240}>
                  <Pie data={categoryData} cx={120} cy={120} innerRadius={64} outerRadius={104} paddingAngle={4} dataKey="value">
                    {categoryData.map((entry, index) => <Cell key={`category-${entry.name}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </div>
            </div>
            <div className="w-52 overflow-auto">
              <ul className="space-y-2">
                {categoryData.map((item, index) => (
                  <li key={item.name} className="flex items-start gap-3">
                    <span style={{ background: COLORS[index % COLORS.length] }} className="w-3 h-3 rounded-full mt-1 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-800">{item.name}</div>
                      <div className="text-slate-500">{item.value} recebida{item.value > 1 ? 's' : ''}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Quantidade Recebida por Categoria</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={150} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="value" name="Recebidas" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
