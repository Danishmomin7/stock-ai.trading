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
            
            {/* Render based on chart type */}
            {chartType === 'line' && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="close" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                  name="Close Price"
                />
                {chartData.some(d => d.sma20) && (
                  <Line 
                    type="monotone" 
                    dataKey="sma20" 
                    stroke="#f59e0b" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="SMA 20"
                  />
                )}
              </>
            )}
            
            {chartType === 'area' && (
              <Area 
                type="monotone" 
                dataKey="close" 
                fill="#10b981" 
                fillOpacity={0.3}
                stroke="#10b981" 
                strokeWidth={2}
              />
            )}
            
            {chartType === 'candle' && (
              <Bar 
                dataKey="volume" 
                fill="#6b7280" 
                opacity={0.3}
                name="Volume"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
