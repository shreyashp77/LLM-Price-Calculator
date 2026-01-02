import React, { useState, useEffect, useMemo } from 'react';
import { 
  UnifiedModelData, 
  CostCalculation, 
  SortField, 
  SortOrder 
} from './types';
import { fetchModels, calculateModelCost } from './services/apiService';
import { InputCard } from './components/InputCard';
import { ComparisonTable } from './components/ComparisonTable';
import { CostChart } from './components/CostChart';
import { Search, Filter, RefreshCw, AlertTriangle, IndianRupee, DollarSign, X } from 'lucide-react';

function App() {
  // State
  const [models, setModels] = useState<UnifiedModelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  
  // Currency State
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  
  // Input State
  const [inputTokens, setInputTokens] = useState<number>(20000);
  const [outputTokens, setOutputTokens] = useState<number>(100000);
  
  // Filter/Sort State
  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('totalCost');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Selection State
  const [selectedModelIds, setSelectedModelIds] = useState<Set<string>>(new Set());

  // Load Data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchModels();
      setModels(data);
      setLastUpdated(Date.now());
    } catch (err) {
      setError('Failed to fetch pricing data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Exchange Rate
  useEffect(() => {
    const fetchRate = async () => {
      if (currency === 'INR') {
        try {
          const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
          const data = await res.json();
          if (data && data.rates && data.rates.INR) {
            setExchangeRate(data.rates.INR);
          }
        } catch (e) {
          console.error("Failed to fetch exchange rate, using fallback");
          setExchangeRate(84); // Fallback
        }
      } else {
        setExchangeRate(1);
      }
    };
    fetchRate();
  }, [currency]);

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleToggleSelection = (id: string) => {
    const next = new Set(selectedModelIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedModelIds(next);
  };

  const clearSelection = () => setSelectedModelIds(new Set());

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Derived State: Providers List
  const providers = useMemo(() => {
    const p = new Set(models.map(m => m.provider));
    return ['All', ...Array.from(p).sort()];
  }, [models]);

  // Derived State: All Costs (Base calculations)
  const allCosts = useMemo(() => {
    return models.map(model => 
      calculateModelCost(model, inputTokens, outputTokens)
    );
  }, [models, inputTokens, outputTokens]);

  // Derived State: Table Data (Filtered & Sorted)
  const tableData = useMemo(() => {
    let data = allCosts;

    // Filter
    if (selectedProvider !== 'All') {
      data = data.filter(d => d.model.provider === selectedProvider);
    }
    
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(d => 
        d.model.name.toLowerCase().includes(q) || 
        d.model.id.toLowerCase().includes(q)
      );
    }

    // Sort
    const sorted = [...data].sort((a, b) => {
      // Priority 1: Selected items always appear at the top
      const isSelectedA = selectedModelIds.has(a.model.id);
      const isSelectedB = selectedModelIds.has(b.model.id);
      
      if (isSelectedA && !isSelectedB) return -1;
      if (!isSelectedA && isSelectedB) return 1;

      // Priority 2: Normal sorting logic
      let valA: number | string;
      let valB: number | string;

      switch (sortField) {
        case 'name':
          valA = a.model.name;
          valB = b.model.name;
          break;
        case 'provider':
          valA = a.model.provider;
          valB = b.model.provider;
          break;
        case 'contextWindow':
          valA = a.model.contextWindow;
          valB = b.model.contextWindow;
          break;
        case 'inputPrice':
          valA = a.model.inputPricePerMillion;
          valB = b.model.inputPricePerMillion;
          break;
        case 'outputPrice':
          valA = a.model.outputPricePerMillion;
          valB = b.model.outputPricePerMillion;
          break;
        case 'totalCost':
        default:
          valA = a.totalCost;
          valB = b.totalCost;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [allCosts, selectedProvider, search, sortField, sortOrder, selectedModelIds]);

  // Derived State: Chart Data
  const chartData = useMemo(() => {
    // If user has manually selected models, use those (from allCosts to ensure they appear even if filtered out of table)
    if (selectedModelIds.size > 0) {
      return allCosts.filter(d => selectedModelIds.has(d.model.id));
    }
    // Otherwise use the table data (which will then be top-sliced by the chart component)
    return tableData;
  }, [selectedModelIds, allCosts, tableData]);

  const isSelectionMode = selectedModelIds.size > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              {currency === 'USD' ? '$' : '₹'}
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              LLM Price Calculator
            </h1>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-400">
            {/* Currency Toggle */}
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                  currency === 'USD' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <DollarSign size={12} /> USD
              </button>
              <button
                onClick={() => setCurrency('INR')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                  currency === 'INR' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <IndianRupee size={12} /> INR
              </button>
            </div>

            <span className="hidden sm:inline border-l border-slate-700 pl-4">Updated: {new Date(lastUpdated).toLocaleTimeString()}</span>
            <button 
              onClick={loadData}
              disabled={loading}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"
              title="Refresh Prices"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputCard 
            label="Input Tokens" 
            value={inputTokens} 
            onChange={setInputTokens}
            icon="input"
          />
          <InputCard 
            label="Output Tokens" 
            value={outputTokens} 
            onChange={setOutputTokens}
            icon="output"
          />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Charts & Visuals */}
        {!loading && !error && (
          <CostChart 
            data={chartData} 
            currency={currency} 
            rate={exchangeRate}
            isSelectionMode={isSelectionMode}
          />
        )}

        {/* Controls & Table */}
        <div className="space-y-4">
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search models..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <select 
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                >
                  {providers.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isSelectionMode && (
                <button 
                  onClick={clearSelection}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 transition-colors"
                >
                  <X size={12} />
                  Clear {selectedModelIds.size} selected
                </button>
              )}
              <div className="text-sm text-slate-500">
                Sorted by <span className="text-slate-300 font-medium">{sortField === 'inputPrice' ? 'input price' : sortField === 'outputPrice' ? 'output price' : sortField === 'totalCost' ? 'total cost' : sortField}</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="h-[600px]">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <RefreshCw size={32} className="animate-spin text-blue-500" />
                <p>Fetching latest pricing from OpenRouter...</p>
              </div>
            ) : (
              <ComparisonTable 
                data={tableData}
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={handleSort}
                currency={currency}
                rate={exchangeRate}
                selectedIds={selectedModelIds}
                onToggleSelection={handleToggleSelection}
              />
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;