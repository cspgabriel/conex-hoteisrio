import React from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area 
} from 'recharts';
import { Demand } from '../types';
import { motion } from 'motion/react';
import { TrendingUp, PieChart as PieIcon, BarChart3, AlertCircle } from 'lucide-react';

interface ChartsSectionProps {
  demands: Demand[];
}

const COLORS = ['#0a2e50', '#c5a059', '#3b82f6', '#94a3b8', '#1e293b', '#64748b'];

const ChartsSection: React.FC<ChartsSectionProps> = ({ demands }) => {
  const hasData = demands.length > 0;

  const categoryData = Object.values(demands.reduce((acc, demand) => {
    const categories = Array.isArray(demand.category) ? demand.category : [demand.category];
    categories.forEach((category) => {
      const key = String(category || 'Não informado');
      if (!acc[key]) acc[key] = { name: key, value: 0 };
      acc[key].value += 1;
    });
    return acc;
  }, {} as Record<string, { name: string; value: number }>)).sort((a, b) => b.value - a.value);

  // Time Series Data (last 6 months)
  const monthlyData = Object.values(demands.reduce((acc, demand) => {
    const month = new Date(demand.dateOpened).toLocaleString('pt-BR', { month: 'short' });
    if (!acc[month]) acc[month] = { name: month, total: 0 };
    acc[month].total += 1;
    return acc;
  }, {} as Record<string, { name: string; total: number }>));

  if (!hasData) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12"
      >
        <div className="bg-white p-12 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <PieIcon className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Aguardando Dados</h3>
            <p className="text-slate-500 max-w-xs text-sm">Assim que as primeiras solicitações forem recebidas, os gráficos de categoria aparecerão aqui.</p>
        </div>
        <div className="bg-white p-12 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Tendência de Demanda</h3>
            <p className="text-slate-500 max-w-xs text-sm">Visualize o crescimento das conexões B2B ao longo dos meses.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden group"
      >
        <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-xl font-bold text-[#0a2e50] flex items-center gap-2">
                    <PieIcon className="w-5 h-5" /> Distribuição por Categoria
                </h3>
                <p className="text-xs text-slate-500 font-medium">Divisão percentual das solicitações recebidas</p>
            </div>
        </div>
        
        <div className="h-80 w-full flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 w-full h-full min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie 
                            data={categoryData} 
                            innerRadius={80} 
                            outerRadius={110} 
                            paddingAngle={8} 
                            dataKey="value"
                            stroke="none"
                        >
                            {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="w-full lg:w-48 space-y-3">
                {categoryData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-800 truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-500">{item.value} solicitações</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100"
      >
        <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-xl font-bold text-[#0a2e50] flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" /> Volume de Solicitações
                </h3>
                <p className="text-xs text-slate-500 font-medium">Rank de categorias mais demandadas</p>
            </div>
        </div>

        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={120} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                    />
                    <Tooltip 
                        cursor={{ fill: '#f8fafd' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                    />
                    <Bar 
                        dataKey="value" 
                        fill="#0a2e50" 
                        radius={[0, 10, 10, 0]} 
                        barSize={32}
                    >
                        {categoryData.map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={index === 0 ? '#0a2e50' : '#c5a059'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default ChartsSection;
