import React from 'react';
import { motion } from 'motion/react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  colorClass?: string;
  onClick?: () => void;
  index?: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendUp, 
  onClick,
  index = 0
}) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      type="button"
      onClick={onClick}
      className={`bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden text-left w-full ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -z-0 opacity-50 group-hover:bg-blue-50 transition-colors" />
      
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-[#0a2e50] group-hover:bg-[#0a2e50] group-hover:text-white transition-all transform group-hover:rotate-6">
          {icon}
        </div>
        
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-slate-900 leading-none tracking-tight">{value}</h3>
            {trend && (
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {trend}
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2">
           <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '70%' }}
                transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                className={`h-full ${trendUp ? 'bg-emerald-400' : 'bg-blue-400'}`}
              />
           </div>
        </div>
      </div>
    </motion.button>
  );
};

export default StatCard;
