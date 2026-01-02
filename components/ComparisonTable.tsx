import React from 'react';
import { CostCalculation, SortField, SortOrder } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown, Info, Check } from 'lucide-react';

interface ComparisonTableProps {
  data: CostCalculation[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  currency: 'USD' | 'INR';
  rate: number;
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ 
  data, 
  sortField, 
  sortOrder, 
  onSort,
  currency,
  rate,
  selectedIds,
  onToggleSelection
}) => {
  const symbol = currency === 'USD' ? '$' : '₹';

  // Helper to format price based on currency
  const formatPrice = (val: number, isTotal = false) => {
    if (val === 0) return null; // Handled by FREE badge logic
    const converted = val * rate;
    // Use slightly different precision for USD vs INR if needed, 
    // but 2 decimals for Rate/M and 6 for Total is generally good.
    if (isTotal) return `${symbol}${converted.toFixed(6)}`;
    return `${symbol}${converted.toFixed(2)}`;
  };
  
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-slate-500 opacity-50 group-hover:opacity-100" />;
    return sortOrder === 'asc' 
      ? <ArrowUp size={14} className="text-blue-400" />
      : <ArrowDown size={14} className="text-blue-400" />;
  };

  const HeaderCell = ({ field, label, align = 'right' }: { field: SortField, label: string, align?: 'left' | 'right' }) => (
    <th 
      className={`px-6 py-4 text-${align} text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer group hover:bg-slate-700/50 transition-colors select-none sticky top-0 bg-slate-800 z-10`}
      onClick={() => onSort(field)}
    >
      <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        {label}
        <SortIcon field={field} />
      </div>
    </th>
  );

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden flex flex-col h-full">
      <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="w-12 px-6 py-4 sticky top-0 bg-slate-800 z-10 border-b border-slate-700">
                {/* Empty header for checkbox column */}
              </th>
              <HeaderCell field="name" label="Model" align="left" />
              <HeaderCell field="provider" label="Provider" align="left" />
              <HeaderCell field="contextWindow" label="Context" />
              <HeaderCell field="inputPrice" label={`In (${symbol}/1M)`} />
              <HeaderCell field="outputPrice" label={`Out (${symbol}/1M)`} />
              <HeaderCell field="totalCost" label="Total Cost" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {data.length === 0 ? (
               <tr>
                 <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                   No models found matching your filters.
                 </td>
               </tr>
            ) : (
              data.map((item) => {
                const isSelected = selectedIds.has(item.model.id);
                return (
                  <tr 
                    key={item.model.id} 
                    className={`transition-colors group ${isSelected ? 'bg-blue-500/5 hover:bg-blue-500/10' : 'hover:bg-slate-700/30'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onToggleSelection(item.model.id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-blue-500 border-blue-500 text-white shadow-sm shadow-blue-500/20' 
                            : 'border-slate-600 hover:border-slate-400 bg-slate-900/50'
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium ${isSelected ? 'text-blue-200' : 'text-slate-200'}`}>
                          {item.model.name}
                        </span>
                        <span className="text-xs text-slate-500 font-mono truncate max-w-[200px]" title={item.model.id}>{item.model.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">
                        {item.model.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-400 font-mono">
                      {item.model.contextWindow > 0 ? (item.model.contextWindow / 1000).toFixed(0) + 'k' : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-300 font-mono">
                      {item.model.inputPricePerMillion === 0 ? (
                        <span className="text-slate-500 text-xs uppercase">Free</span>
                      ) : (
                        formatPrice(item.model.inputPricePerMillion)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-300 font-mono">
                      {item.model.outputPricePerMillion === 0 ? (
                        <span className="text-slate-500 text-xs uppercase">Free</span>
                      ) : (
                        formatPrice(item.model.outputPricePerMillion)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {item.totalCost === 0 ? (
                         <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                           FREE
                         </span>
                      ) : (
                        <span className="text-emerald-400 font-bold font-mono text-sm">
                          {formatPrice(item.totalCost, true)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 bg-slate-900 border-t border-slate-700 text-xs text-slate-500 flex justify-between items-center">
        <span>Showing {data.length} models</span>
        <span className="flex items-center gap-1">
          <Info size={12} />
          Select models to compare in chart
        </span>
      </div>
    </div>
  );
};