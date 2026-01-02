import React from 'react';
import { Database, MessageSquare } from 'lucide-react';

interface InputCardProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  icon: 'input' | 'output';
}

export const InputCard: React.FC<InputCardProps> = ({ label, value, onChange, icon }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/,/g, ''), 10);
    if (!isNaN(val)) {
      onChange(val);
    } else if (e.target.value === '') {
      onChange(0);
    }
  };

  const handleQuickSet = (amount: number) => {
    onChange(amount);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${icon === 'input' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
          {icon === 'input' ? <Database size={20} /> : <MessageSquare size={20} />}
        </div>
        <h3 className="text-lg font-semibold text-slate-100">{label}</h3>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          value={value.toLocaleString()}
          onChange={handleChange}
          className="w-full bg-slate-900 border border-slate-600 text-slate-100 text-2xl font-mono p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">
          TOKENS
        </span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[1000, 10000, 100000, 1000000].map((amt) => (
          <button
            key={amt}
            onClick={() => handleQuickSet(amt)}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-full transition-colors"
          >
            {amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}k`}
          </button>
        ))}
      </div>
    </div>
  );
};
