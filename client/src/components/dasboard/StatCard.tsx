import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const StatCard = ({ icon, label, value }: StatCardProps) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl flex items-center gap-5">
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-yellow-400">
        {icon}
      </div>
      <div>
        <div className="text-3xl font-bold text-white">{value}</div>
        {/* Changed text-slate-400 to text-slate-300 for better contrast */}
        <div className="text-sm text-slate-300">{label}</div>
      </div>
    </div>
  );
};

export default StatCard;