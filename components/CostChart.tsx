import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { BarChart as BarChartIcon, LineChart as LineChartIcon } from 'lucide-react';
import { CostCalculation } from '../types';

interface CostChartProps {
  data: CostCalculation[];
  currency: 'USD' | 'INR';
  rate: number;
  isSelectionMode?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  symbol: string;
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, symbol }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 p-4 border border-slate-700 rounded-lg shadow-xl text-sm backdrop-blur-sm bg-opacity-95 z-50">
        <p className="font-bold text-slate-100 mb-3 pb-2 border-b border-slate-800">{data.fullName || data.name}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-500"></div>
              <span>Input Cost</span>
            </div>
            <span className="text-slate-200 font-mono tracking-tight">{symbol}{data.input.toFixed(6)}</span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></div>
              <span>Output Cost</span>
            </div>
            <span className="text-slate-200 font-mono tracking-tight">{symbol}{data.output.toFixed(6)}</span>
          </div>
          <div className="border-t border-slate-800 mt-2 pt-2 flex items-center justify-between gap-8">
            <span className="text-slate-100 font-semibold">Total Price</span>
            <span className="text-emerald-400 font-bold font-mono tracking-tight">{symbol}{data.total.toFixed(6)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const CostChart: React.FC<CostChartProps> = ({ 
  data, 
  currency, 
  rate, 
  isSelectionMode = false 
}) => {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const symbol = currency === 'USD' ? '$' : '₹';
  
  let chartData;

  if (isSelectionMode) {
    // Selection Mode: Show EXACTLY what was passed, no filtering of free models, no slicing.
    chartData = data.map(item => ({
      name: item.model.name.split('/').pop() || item.model.name, // Shorten name
      fullName: item.model.name,
      input: item.inputCost * rate,
      output: item.outputCost * rate,
      total: item.totalCost * rate,
      provider: item.model.provider
    }));
  } else {
    // Default Mode: Filter out free models (totalCost > 0) AND take the top 15
    chartData = data
      .filter(item => item.totalCost > 0)
      .slice(0, 15)
      .map(item => ({
        name: item.model.name.split('/').pop() || item.model.name, // Shorten name
        fullName: item.model.name,
        input: item.inputCost * rate,
        output: item.outputCost * rate,
        total: item.totalCost * rate,
        provider: item.model.provider
      }));
  }

  // Helper to truncate text
  const truncateText = (text: string, maxLength: number = 25) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Custom label renderer for the total cost above the bar
  const renderCustomLabel = (props: any) => {
    const { x, y, width, payload } = props;
    
    // Safety check: ensure payload exists before accessing properties
    if (!payload) return null;

    const value = payload.total;
    
    // Avoid rendering if value is 0 or invalid
    if (value === undefined || value === null) return null;

    return (
      <text 
        x={x + width / 2} 
        y={y - 8} 
        fill="#e2e8f0" 
        textAnchor="middle" 
        fontSize={11}
        fontWeight={600}
        className="font-mono"
      >
        {symbol}{value.toFixed(currency === 'INR' ? 2 : 4)}
      </text>
    );
  };

  // Custom label renderer for line chart points
  const renderLineLabel = (props: any) => {
    const { x, y, value } = props;
    
    if (value === undefined || value === null) return null;

    const formattedValue = `${symbol}${Number(value).toFixed(currency === 'INR' ? 2 : 4)}`;

    return (
      <g>
        {/* Halo effect: Thick stroke of background color to separate text from lines */}
        <text 
          x={x} 
          y={y - 12} 
          textAnchor="middle" 
          fontSize={12}
          fontWeight={700}
          stroke="#1e293b" // slate-800 background
          strokeWidth={4}
          strokeLinejoin="round"
          fill="none"
          className="font-mono"
        >
          {formattedValue}
        </text>
        {/* Actual text */}
        <text 
          x={x} 
          y={y - 12} 
          fill="#f8fafc" // bright white
          textAnchor="middle" 
          fontSize={12}
          fontWeight={700}
          className="font-mono"
        >
          {formattedValue}
        </text>
      </g>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg h-[400px] flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-semibold text-slate-100 mb-2">Cost Breakdown</h3>
        <p className="text-slate-400 mb-1">
          {isSelectionMode ? "No models selected." : "No paid models currently visible."}
        </p>
        <p className="text-slate-500 text-sm">
          {isSelectionMode ? "Select models from the list below to compare." : "Adjust filters or select paid models to see the cost comparison."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-slate-100">
          Cost Breakdown 
          <span className="text-slate-500 font-normal text-base ml-2">
            ({isSelectionMode ? `Selected ${chartData.length}` : `Top ${chartData.length} Paid`})
          </span>
        </h3>
        
        <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-700/50">
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded transition-colors ${chartType === 'bar' ? 'bg-slate-700 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            title="Bar Chart"
          >
            <BarChartIcon size={18} />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`p-1.5 rounded transition-colors ${chartType === 'line' ? 'bg-slate-700 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            title="Line Chart"
          >
            <LineChartIcon size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 10, 
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                tick={{ fontSize: 10 }} 
                tickFormatter={(val) => truncateText(val)}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={100} 
              />
              <YAxis 
                stroke="#94a3b8" 
                tickFormatter={(val) => `${symbol}${val.toFixed(currency === 'INR' ? 2 : 4)}`}
                width={70}
              />
              <Tooltip 
                content={<CustomTooltip symbol={symbol} />}
                cursor={{ fill: '#334155', opacity: 0.2 }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="input" name="Input Cost" stackId="a" fill="#3b82f6" />
              <Bar 
                dataKey="output" 
                name="Output Cost" 
                stackId="a" 
                fill="#10b981" 
                label={renderCustomLabel}
              />
            </BarChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 10, 
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                tick={{ fontSize: 10 }} 
                tickFormatter={(val) => truncateText(val)}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={100} 
              />
              <YAxis 
                stroke="#94a3b8" 
                tickFormatter={(val) => `${symbol}${val.toFixed(currency === 'INR' ? 2 : 4)}`}
                width={70}
              />
              <Tooltip 
                content={<CustomTooltip symbol={symbol} />}
                cursor={{ stroke: '#334155', strokeWidth: 1 }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line 
                type="monotone" 
                dataKey="input" 
                name="Input Cost" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 3, fill: '#3b82f6' }}
              />
              <Line 
                type="monotone" 
                dataKey="output" 
                name="Output Cost" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 3, fill: '#10b981' }}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                name="Total Cost" 
                stroke="#e2e8f0" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#e2e8f0' }}
                strokeDasharray="5 5"
              >
                <LabelList content={renderLineLabel} />
              </Line>
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};