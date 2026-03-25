import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean; // true if up is good, false if up is bad (or vice versa depending on context)
  colorClass?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp, colorClass = "bg-white", onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${colorClass} rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between transition-all hover:shadow-md text-left w-full ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
          {icon}
        </div>
      </div>
      {trend && (
        <div className={`text-xs font-medium flex items-center ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
           {trend}
        </div>
      )}
    </button>
  );
};

export default StatCard;
