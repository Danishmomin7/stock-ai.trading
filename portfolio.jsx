import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  PieChart,
  DollarSign
} from 'lucide-react';

export default function Portfolio({ onTrade }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const data = await api.getPortfolio();
      setPortfolio(data);
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Loading portfolio...
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        Failed to load portfolio
      </div>
    );
  }

  const investedValue = portfolio.positions.reduce((sum, p) => sum + (p.shares * p.avg_cost), 0);
  const marketValue = portfolio.positions.reduce((sum, p) => sum + p.market_value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Paper Trading Portfolio</h3>
        </div>
        <button
          onClick={loadPortfolio}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-400 text-sm">Total Value</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${portfolio.total_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400 text-sm">Cash Available</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${portfolio.cash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400 text-sm">Invested</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${marketValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {portfolio.total_pnl >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className="text-gray-400 text-sm">Total P&L</span>
          </div>
          <div className={`text-2xl font-bold ${
            portfolio.total_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {portfolio.total_pnl >= 0 ? '+' : ''}
            ${portfolio.total_pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-gray-700/50 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-600">
          <h4 className="text-white font-medium">Open Positions</h4>
        </div>
        
        {portfolio.positions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No open positions. Use AI signals to make your first trade!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-600">
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3 text-right">Shares</th>
                  <th className="px-4 py-3 text-right">Avg Cost</th>
                  <th className="px-4 py-3 text-right">Current Price</th>
                  <th className="px-4 py-3 text-right">Market Value</th>
                  <th className="px-4 py-3 text-right">P&L</th>
                  <th className="px-4 py-3 text-right">P&L %</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.positions.map((position) => (
                  <tr 
                    key={position.symbol} 
                    className="border-b border-gray-600/50 hover:bg-gray-600/30"
                  >
                    <td className="px-4 py-3">
                      <span className="font-semibold text-white">{position.symbol}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      {position.shares.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      ${position.avg_cost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      ${position.current_price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-white font-medium">
                      ${position.market_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${
                      position.profit_loss >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {position.profit_loss >= 0 ? '+' : ''}
                      ${position.profit_loss.toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${
                      position.profit_loss_percent >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {position.profit_loss_percent >= 0 ? '+' : ''}
                      {position.profit_loss_percent.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Portfolio Allocation Chart */}
      {portfolio.positions.length > 0 && (
        <div className="bg-gray-700/50 rounded-lg p-4">
          <h4 className="text-white font-medium mb-4">Portfolio Allocation</h4>
          <div className="flex flex-wrap gap-4">
            {/* Cash allocation */}
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: '#6b7280' }}
              ></div>
              <span className="text-sm text-gray-300">
                Cash: {((portfolio.cash / portfolio.total_value) * 100).toFixed(1)}%
              </span>
            </div>
            {/* Position allocations */}
            {portfolio.positions.map((position, index) => {
              const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
              const color = colors[index % colors.length];
              const allocation = (position.market_value / portfolio.total_value) * 100;
              
              return (
                <div key={position.symbol} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-sm text-gray-300">
                    {position.symbol}: {allocation.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Visual bar */}
          <div className="h-4 bg-gray-600 rounded-full overflow-hidden flex mt-4">
            <div 
              className="h-full bg-gray-500"
              style={{ width: `${(portfolio.cash / portfolio.total_value) * 100}%` }}
            ></div>
            {portfolio.positions.map((position, index) => {
              const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
              const color = colors[index % colors.length];
              const allocation = (position.market_value / portfolio.total_value) * 100;
              
              return (
                <div 
                  key={position.symbol}
                  className="h-full"
                  style={{ width: `${allocation}%`, backgroundColor: color }}
                ></div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
