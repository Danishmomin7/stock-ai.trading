import React, { useState } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area
} from 'recharts';

export default function StockChart({ data, symbol }) {
  const [chartType, setChartType] = useState('line');

  if (!data || data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-400">
        No chart data available
      </div>
    );
  }

  // Calculate price range for better Y-axis
  const prices = data.map(d => d.close);
  const minPrice = Math.min(...prices) * 0.98;
  const maxPrice = Math.max(...prices) * 1.02;

  // Format data with moving averages
  const chartData = data.slice(-90).map((item, index, arr) => {
    const sma20 = index >= 19
      ? arr.slice(index - 19, index + 1).reduce((sum, d) => sum + d.close, 0) / 20
      : null;
    
    return {
      ...item,
      date: item.date.slice(5), // Show MM-DD
      sma20,
      volumeColor: item.close >= item.open ? '#10b981' : '#ef4444'
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-gray-400 text-sm mb-2">{data.date}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <span className="text-gray-400">Open:</span>
            <span className="text-white font-medium">${data.open.toFixed(2)}</span>
            <span className="text-gray-400">High:</span>
            <span className="text-emerald-400 font-medium">${data.high.toFixed(2)}</span>
            <span className="text-gray-400">Low:</span>
            <span className="text-red-400 font-medium">${data.low.toFixed(2)}</span>
            <span className="text-gray-400">Close:</span>
            <span className="text-white font-medium">${data.close.toFixed(2)}</span>
            <span className="text-gray-400">Volume:</span>
            <span className="text-white font-medium">{(data.volume / 1000000).toFixed(2)}M</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{symbol} Price Chart</h3>
        <div className="flex gap-2">
          {['line', 'area', 'candle'].map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                chartType === type
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Price Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis 
              domain={[minPrice, maxPrice]}
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {chartType === 'area' ? (
              <Area
                type="monotone"
                dataKey="close"
                stroke="#10b981"
                fill="url(#colorGradient)"
                strokeWidth={2}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="close"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            )}
            
            <Line
              type="monotone"
              dataKey="sma20"
              stroke="#f59e0b"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />
            
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Chart */}
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Tooltip 
              formatter={(value) => [`${(value / 1000000).toFixed(2)}M`, 'Volume']}
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
            />
            <Bar 
              dataKey="volume" 
              fill="#6b7280"
              opacity={0.5}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-emerald-500"></div>
          <span className="text-gray-400">Price</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-amber-500" style={{ borderStyle: 'dashed' }}></div>
          <span className="text-gray-400">SMA 20</span>
        </div>
      </div>
    </div>
  );
}
