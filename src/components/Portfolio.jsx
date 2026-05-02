import React, { useState, useEffect } from 'react';
import { api } from '../api';
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
          <div className={`text-2xl font-bold ${portfolio.total_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${portfolio.total_pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Positions */}
      {portfolio.positions.length > 0 ? (
        <div className="bg-gray-700/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Symbol</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Shares</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Avg Cost</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Price</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Value</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">P&L</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {portfolio.positions.map((position) => (
                  <tr key={position.symbol} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{position.symbol}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{position.shares}</td>
                    <td className="px-4 py-3 text-right text-gray-300">${position.avg_cost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-300">${position.current_price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      ${position.market_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${position.profit_loss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${position.profit_loss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${position.profit_loss_percent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {position.profit_loss_percent.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-700/50 rounded-lg p-8 text-center text-gray-400">
          <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No active positions</p>
        </div>
      )}
    </div>
  );
}
